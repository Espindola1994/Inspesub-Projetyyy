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

    const { id: teamId } = await params
    const { userId } = await request.json()

    const member = await db.teamMember.upsert({
      where: { teamId_userId: { teamId, userId } },
      create: { teamId, userId, isActive: true },
      update: { isActive: true, leftAt: null },
    })

    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action: "team_changed",
        description: `Membro adicionado à equipe ${teamId}`,
        metadata: { teamId, userId },
      },
    })

    return NextResponse.json({ data: member }, { status: 201 })
  } catch (error) {
    console.error("[TEAM_MEMBERS_POST]", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
