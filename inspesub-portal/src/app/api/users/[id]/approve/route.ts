import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })

    const isAdmin = ["admin_master", "rh"].includes(session.user.role)
    if (!isAdmin) return NextResponse.json({ error: "Sem permissão" }, { status: 403 })

    const { id: userId } = await params

    await db.$transaction([
      db.user.update({
        where: { id: userId },
        data: { status: "active" },
      }),
      db.approval.updateMany({
        where: { userId, status: "pending" },
        data: { status: "active", reviewedBy: session.user.id, reviewedAt: new Date() },
      }),
    ])

    // Notification
    await db.notification.create({
      data: {
        userId,
        type: "account_approved",
        title: "Conta aprovada!",
        message: "Sua conta foi aprovada. Bem-vindo ao INSPESUB Portal!",
        link: "/dashboard",
      },
    })

    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action: "account_approved",
        description: `Conta aprovada: ${userId}`,
        metadata: { approvedUserId: userId },
      },
    })

    return NextResponse.json({ message: "Conta aprovada" })
  } catch (error) {
    console.error("[USER_APPROVE]", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
