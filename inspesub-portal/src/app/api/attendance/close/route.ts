import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })

    const isAdmin = ["admin_master", "rh"].includes(session.user.role)
    if (!isAdmin) return NextResponse.json({ error: "Sem permissão" }, { status: 403 })

    const body = await request.json()
    const { userId, year, month } = body

    await db.attendanceMonthClosing.create({
      data: { userId, year, month, closedBy: session.user.id },
    })

    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action: "attendance_closed",
        description: `Mês ${month}/${year} fechado para usuário ${userId}`,
        metadata: { userId, year, month },
      },
    })

    return NextResponse.json({ message: "Mês fechado com sucesso" })
  } catch (error) {
    console.error("[ATTENDANCE_CLOSE]", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
