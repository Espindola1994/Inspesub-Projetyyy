import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { createAdminClient } from "@/lib/supabase/server"
import type { DocumentCategory } from "@prisma/client"

const MAX_SIZE = 20 * 1024 * 1024 // 20MB

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })

    const formData = await request.formData()
    const file = formData.get("file") as File
    const userId = formData.get("userId") as string
    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const category = formData.get("category") as DocumentCategory
    const issuedAt = formData.get("issuedAt") as string
    const expiresAt = formData.get("expiresAt") as string
    const tagsRaw = formData.get("tags") as string

    if (!file || !userId || !title) {
      return NextResponse.json({ error: "Dados obrigatórios faltando" }, { status: 400 })
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "Arquivo muito grande (max 20MB)" }, { status: 400 })
    }

    // Permission: non-admin can only upload for themselves
    const isAdmin = ["admin_master", "rh"].includes(session.user.role)
    if (userId !== session.user.id && !isAdmin) {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 })
    }

    const supabase = createAdminClient()
    const ext = file.name.split(".").pop()
    const fileName = `documents/${userId}/${Date.now()}.${ext}`

    const bytes = await file.arrayBuffer()
    const { error: uploadError } = await supabase.storage
      .from("portal-files")
      .upload(fileName, bytes, { contentType: file.type, upsert: false })

    if (uploadError) throw uploadError

    const { data: urlData } = supabase.storage.from("portal-files").getPublicUrl(fileName)

    const tags = tagsRaw ? tagsRaw.split(",").map((t) => t.trim()).filter(Boolean) : []

    const document = await db.document.create({
      data: {
        userId,
        uploadedById: session.user.id,
        title,
        description: description || null,
        category: category || "other",
        fileUrl: urlData.publicUrl,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        issuedAt: issuedAt ? new Date(issuedAt) : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        tags,
      },
    })

    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action: "document_uploaded",
        description: `Documento enviado: ${title}`,
        metadata: { documentId: document.id, userId, category },
      },
    })

    return NextResponse.json({ data: document }, { status: 201 })
  } catch (error) {
    console.error("[DOCUMENTS_POST]", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
