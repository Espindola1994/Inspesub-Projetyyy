import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import type { UserRole } from "@prisma/client"

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })

    if (session.user.role !== "admin_master") {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 })
    }

    const { id: userId } = await params
    const { role } = await request.json()

    await db.user.update({
      where: { id: userId },
      data: { role: role as UserRole },
    })

    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action: "profile_updated",
        description: `Role alterado para ${role}: ${userId}`,
        metadata: { userId, role },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[USER_ROLE]", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
