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
    const { notes } = await request.json().catch(() => ({ notes: "" }))

    await db.$transaction([
      db.user.update({
        where: { id: userId },
        data: { status: "rejected" },
      }),
      db.approval.updateMany({
        where: { userId, status: "pending" },
        data: { status: "rejected", reviewedBy: session.user.id, reviewedAt: new Date(), notes },
      }),
    ])

    await db.notification.create({
      data: {
        userId,
        type: "account_rejected",
        title: "Conta não aprovada",
        message: "Sua solicitação de acesso não foi aprovada. Entre em contato com o RH.",
        link: "/login",
      },
    })

    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action: "account_rejected",
        description: `Conta rejeitada: ${userId}`,
        metadata: { rejectedUserId: userId, notes },
      },
    })

    return NextResponse.json({ message: "Conta rejeitada" })
  } catch (error) {
    console.error("[USER_REJECT]", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
