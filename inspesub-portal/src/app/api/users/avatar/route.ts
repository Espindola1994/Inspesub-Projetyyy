import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { createAdminClient } from "@/lib/supabase/server"

const MAX_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"]

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) return NextResponse.json({ error: "Arquivo obrigatório" }, { status: 400 })
    if (file.size > MAX_SIZE) return NextResponse.json({ error: "Imagem muito grande (max 5MB)" }, { status: 400 })
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "Formato inválido. Use JPG, PNG ou WebP" }, { status: 400 })
    }

    const supabase = createAdminClient()
    const ext = file.name.split(".").pop() ?? "jpg"
    const fileName = `avatars/${session.user.id}/avatar.${ext}`
    const bytes = await file.arrayBuffer()

    // Upsert (overwrite) existing avatar
    const { error: uploadError } = await supabase.storage
      .from("portal-files")
      .upload(fileName, bytes, { contentType: file.type, upsert: true })

    if (uploadError) throw uploadError

    const { data: urlData } = supabase.storage.from("portal-files").getPublicUrl(fileName)
    // Add cache-bust so Next.js Image picks up the new photo
    const avatarUrl = `${urlData.publicUrl}?t=${Date.now()}`

    await db.employeeProfile.upsert({
      where: { userId: session.user.id },
      create: { userId: session.user.id, avatarUrl },
      update: { avatarUrl },
    })

    return NextResponse.json({ avatarUrl })
  } catch (error) {
    console.error("[AVATAR_POST]", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
