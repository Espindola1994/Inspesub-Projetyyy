import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { createAdminClient } from "@/lib/supabase/server"

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    if (session.user.role !== "admin_master") {
      return NextResponse.json({ error: "Permissão negada: apenas admin master pode excluir documentos." }, { status: 403 })
    }
    const { id } = await params
    const doc = await db.document.findUnique({ where: { id } })
    if (!doc) return NextResponse.json({ error: "Documento não encontrado" }, { status: 404 })

    // Remove arquivo do storage
    const supabase = createAdminClient()
    const filePath = doc.fileUrl.split("/portal-files/")[1]
    if (filePath) {
      await supabase.storage.from("portal-files").remove([filePath])
    }

    // Remove registro do banco
    await db.document.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    let errMsg = "Erro ao excluir documento."
    if (error instanceof Error) {
      errMsg = error.message
    } else if (typeof error === "string") {
      errMsg = error
    }
    return NextResponse.json({ error: errMsg }, { status: 500 })
  }
}
