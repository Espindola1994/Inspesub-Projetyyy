import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })

    const { id } = await params
    const doc = await db.document.findUnique({ where: { id } })
    if (!doc) return NextResponse.json({ error: "Documento não encontrado" }, { status: 404 })

    const isAdmin = ["admin_master", "rh", "supervisor"].includes(session.user.role)
    if (!isAdmin && doc.userId !== session.user.id) {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 })
    }

    // Fetch and proxy file for inline display (no download header)
    const fileRes = await fetch(doc.fileUrl)
    if (!fileRes.ok) throw new Error("Falha ao buscar arquivo")

    const buffer = await fileRes.arrayBuffer()
    const contentType = doc.mimeType ?? fileRes.headers.get("content-type") ?? "application/octet-stream"

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `inline; filename="${encodeURIComponent(doc.fileName)}"`,
        "Content-Length": buffer.byteLength.toString(),
      },
    })
  } catch (error) {
    console.error("[DOCUMENT_PREVIEW]", error)
    return NextResponse.json({ error: "Erro ao visualizar arquivo" }, { status: 500 })
  }
}
