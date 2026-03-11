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

    const { id } = await params

    await db.notification.updateMany({
      where: { id, userId: session.user.id },
      data: { isRead: true, readAt: new Date() },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[NOTIFICATION_READ]", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
