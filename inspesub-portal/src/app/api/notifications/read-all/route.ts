import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export async function POST() {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })

    await db.notification.updateMany({
      where: { userId: session.user.id, isRead: false },
      data: { isRead: true, readAt: new Date() },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[NOTIFICATION_READ_ALL]", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
