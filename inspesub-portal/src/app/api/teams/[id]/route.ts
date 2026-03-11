import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })

    const isAdmin = ["admin_master", "rh"].includes(session.user.role)
    if (!isAdmin) return NextResponse.json({ error: "Sem permissão" }, { status: 403 })

    const { id } = await params

    // Remove membros primeiro (FK), depois a equipe
    await db.teamMember.deleteMany({ where: { teamId: id } })
    await db.team.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[TEAM_DELETE]", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })

    const isAdmin = ["admin_master", "rh"].includes(session.user.role)
    if (!isAdmin) return NextResponse.json({ error: "Sem permissão" }, { status: 403 })

    const { id } = await params
    const body = await request.json()

    const team = await db.team.update({
      where: { id },
      data: body,
    })

    return NextResponse.json({ data: team })
  } catch (error) {
    console.error("[TEAM_PATCH]", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
