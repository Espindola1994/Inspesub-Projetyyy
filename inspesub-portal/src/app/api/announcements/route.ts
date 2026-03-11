import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { z } from "zod"
import type { AnnouncementCategory } from "@prisma/client"

const announcementSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  category: z.enum(["hr", "operational", "training", "safety", "general"]),
  isPinned: z.boolean().optional(),
})

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })

    const isAdmin = ["admin_master", "rh"].includes(session.user.role)
    if (!isAdmin) return NextResponse.json({ error: "Sem permissão" }, { status: 403 })

    const body = await request.json()
    const validation = announcementSchema.safeParse(body)
    if (!validation.success) return NextResponse.json({ error: "Dados inválidos" }, { status: 400 })

    const { title, content, category, isPinned } = validation.data

    const announcement = await db.announcement.create({
      data: {
        authorId: session.user.id,
        title,
        content,
        category: category as AnnouncementCategory,
        isPinned: isPinned ?? false,
        isPublished: true,
        publishedAt: new Date(),
        targetRoles: ["admin_master", "rh", "supervisor", "member"],
      },
    })

    // Notify all active users
    const users = await db.user.findMany({
      where: { status: "active" },
      select: { id: true },
    })

    await db.notification.createMany({
      data: users.map((u) => ({
        userId: u.id,
        type: "new_announcement" as const,
        title: "Novo comunicado",
        message: title,
        link: "/comunicados",
      })),
    })

    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action: "announcement_created",
        description: `Comunicado criado: ${title}`,
        metadata: { announcementId: announcement.id },
      },
    })

    return NextResponse.json({ data: announcement }, { status: 201 })
  } catch (error) {
    console.error("[ANNOUNCEMENTS_POST]", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
