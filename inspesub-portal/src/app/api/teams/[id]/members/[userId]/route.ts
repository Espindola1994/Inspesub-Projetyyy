import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })

    const isAdmin = ["admin_master", "rh"].includes(session.user.role)
    if (!isAdmin) return NextResponse.json({ error: "Sem permissão" }, { status: 403 })

    const { id: teamId, userId } = await params

    await db.teamMember.update({
      where: { teamId_userId: { teamId, userId } },
      data: { isActive: false, leftAt: new Date() },
    })

    return NextResponse.json({ message: "Membro removido" })
  } catch (error) {
    console.error("[TEAM_MEMBER_DELETE]", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
