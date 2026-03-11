import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const q = searchParams.get("q")?.trim()
    if (!q || q.length < 2) return NextResponse.json({ results: [] })

    const isAdmin = ["admin_master", "rh"].includes(session.user.role)
    const isSupervisorOrAdmin = ["admin_master", "rh", "supervisor"].includes(session.user.role)

    const results: {
      type: string
      label: string
      description: string
      href: string
    }[] = []

    // Usuários (admin/rh only)
    if (isAdmin) {
      const users = await db.user.findMany({
        where: {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
          ],
        },
        select: { id: true, name: true, email: true, role: true },
        take: 5,
      })
      users.forEach((u) =>
        results.push({ type: "Usuário", label: u.name, description: u.email, href: "/usuarios" })
      )
    }

    // Equipes (todos)
    const teams = await db.team.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { code: { contains: q, mode: "insensitive" } },
          { operation: { contains: q, mode: "insensitive" } },
        ],
      },
      select: { id: true, name: true, code: true, operation: true },
      take: 5,
    })
    teams.forEach((t) =>
      results.push({ type: "Equipe", label: t.name, description: `${t.code}${t.operation ? ` · ${t.operation}` : ""}`, href: "/equipes" })
    )

    // Comunicados
    const announcements = await db.announcement.findMany({
      where: {
        isPublished: true,
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { content: { contains: q, mode: "insensitive" } },
        ],
      },
      select: { id: true, title: true, category: true },
      take: 5,
    })
    announcements.forEach((a) =>
      results.push({ type: "Comunicado", label: a.title, description: a.category, href: "/comunicados" })
    )

    // Documentos (admin vê todos, membro vê os seus)
    const documents = await db.document.findMany({
      where: {
        ...(isAdmin ? {} : { userId: session.user.id }),
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
        ],
      },
      select: { id: true, title: true, category: true },
      take: 5,
    })
    documents.forEach((d) =>
      results.push({ type: "Documento", label: d.title, description: d.category, href: "/documentos" })
    )

    // RDO (supervisores e admins)
    if (isSupervisorOrAdmin) {
      const rdos = await db.rdoRecord.findMany({
        where: {
          OR: [
            { location: { contains: q, mode: "insensitive" } },
            { vessel: { contains: q, mode: "insensitive" } },
            { serviceDescription: { contains: q, mode: "insensitive" } },
          ],
        },
        select: { id: true, location: true, date: true, status: true },
        take: 5,
      })
      rdos.forEach((r) =>
        results.push({
          type: "RDO",
          label: r.location,
          description: new Date(r.date).toLocaleDateString("pt-BR", { timeZone: "UTC" }),
          href: `/rdo`,
        })
      )
    }

    return NextResponse.json({ results })
  } catch (error) {
    console.error("[SEARCH_GET]", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
