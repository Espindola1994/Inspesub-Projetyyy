import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })

    if (!["admin_master", "rh"].includes(session.user.role)) {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 })
    }

    const { id } = await params
    await db.announcement.delete({ where: { id } })

    return NextResponse.json({ message: "Comunicado excluído" })
  } catch (error) {
    console.error("[ANNOUNCEMENT_DELETE]", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
