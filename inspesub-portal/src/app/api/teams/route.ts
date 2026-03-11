import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { z } from "zod"

const teamSchema = z.object({
  name: z.string().min(1),
  code: z.string().min(1),
  description: z.string().optional(),
  operation: z.string().optional(),
  supervisorId: z.string().optional(),
})

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })

    const teams = await db.team.findMany({
      include: {
        supervisor: { select: { id: true, name: true } },
        members: {
          where: { isActive: true },
          include: { user: { select: { id: true, name: true } } },
        },
        _count: { select: { members: true } },
      },
      orderBy: { code: "asc" },
    })

    return NextResponse.json({ data: teams })
  } catch (error) {
    console.error("[TEAMS_GET]", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })

    const isAdmin = ["admin_master", "rh"].includes(session.user.role)
    if (!isAdmin) return NextResponse.json({ error: "Sem permissão" }, { status: 403 })

    const body = await request.json()
    const validation = teamSchema.safeParse(body)
    if (!validation.success) return NextResponse.json({ error: "Dados inválidos" }, { status: 400 })

    const { name, code, description, operation, supervisorId } = validation.data

    const existing = await db.team.findUnique({ where: { code } })
    if (existing) return NextResponse.json({ error: "Código de equipe já existe" }, { status: 409 })

    const team = await db.team.create({
      data: {
        name,
        code,
        description: description || null,
        operation: operation || null,
        supervisorId: supervisorId || null,
      },
    })

    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action: "team_changed",
        description: `Equipe criada: ${name} (${code})`,
        metadata: { teamId: team.id },
      },
    })

    return NextResponse.json({ data: team }, { status: 201 })
  } catch (error) {
    console.error("[TEAMS_POST]", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
