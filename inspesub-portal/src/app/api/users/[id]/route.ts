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

    const isAdmin = session.user.role === "admin_master"
    if (!isAdmin) return NextResponse.json({ error: "Sem permissão" }, { status: 403 })

    const { id: userId } = await params

    // Cannot delete yourself
    if (userId === session.user.id) {
      return NextResponse.json({ error: "Você não pode excluir a si mesmo" }, { status: 400 })
    }

    await db.user.delete({
      where: { id: userId },
    })

    return NextResponse.json({ message: "Usuário excluído com sucesso" })
  } catch (error: any) {
    if (error?.code === 'P2003') { // Prisma foreign key constraint failure
      return NextResponse.json(
        { error: "Não é possível excluir este usuário pois ele possui registros essenciais vinculados no sistema (ex: RDOs)." },
        { status: 400 }
      )
    }
    
    console.error("[USER_DELETE]", error)
    return NextResponse.json({ error: "Erro interno ao excluir usuário" }, { status: 500 })
  }
}
