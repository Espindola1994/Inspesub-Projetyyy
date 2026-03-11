import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { createAdminClient } from "@/lib/supabase/server"

const ALLOWED_TYPES = ["application/pdf", "image/png", "image/jpeg", "image/jpg"]
const MAX_SIZE = 10 * 1024 * 1024 // 10MB

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })

    const isAdmin = ["admin_master", "rh"].includes(session.user.role)
    if (!isAdmin) return NextResponse.json({ error: "Sem permissão" }, { status: 403 })

    const formData = await request.formData()
    const file = formData.get("file") as File
    const employeeId = formData.get("employeeId") as string
    const year = parseInt(formData.get("year") as string)
    const month = parseInt(formData.get("month") as string)
    const description = formData.get("description") as string

    if (!file || !employeeId || !year || !month) {
      return NextResponse.json({ error: "Dados obrigatórios faltando" }, { status: 400 })
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "Tipo de arquivo não permitido" }, { status: 400 })
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "Arquivo muito grande (max 10MB)" }, { status: 400 })
    }

    // Upload to Supabase Storage
    const supabase = createAdminClient()
    const ext = file.name.split(".").pop()
    const fileName = `payslips/${employeeId}/${year}-${String(month).padStart(2, "0")}.${ext}`

    const bytes = await file.arrayBuffer()
    const { error: uploadError } = await supabase.storage
      .from("portal-files")
      .upload(fileName, bytes, {
        contentType: file.type,
        upsert: true,
      })

    if (uploadError) throw uploadError

    const { data: urlData } = supabase.storage.from("portal-files").getPublicUrl(fileName)

    // Save to DB
    const payslip = await db.payslip.upsert({
      where: { employeeId_year_month: { employeeId, year, month } },
      create: {
        employeeId,
        uploadedById: session.user.id,
        year,
        month,
        fileUrl: urlData.publicUrl,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        description: description || null,
      },
      update: {
        uploadedById: session.user.id,
        fileUrl: urlData.publicUrl,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        description: description || null,
        readAt: null,
        updatedAt: new Date(),
      },
    })

    // Create notification for employee
    await db.notification.create({
      data: {
        userId: employeeId,
        type: "new_payslip",
        title: "Novo contracheque disponível",
        message: `Seu contracheque de ${month}/${year} está disponível.`,
        link: "/contracheques",
      },
    })

    // Audit log
    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action: "upload",
        description: `Contracheque enviado para ${employeeId}: ${month}/${year}`,
        metadata: { employeeId, year, month, fileName: file.name },
      },
    })

    return NextResponse.json({ data: payslip }, { status: 201 })
  } catch (error) {
    console.error("[PAYSLIPS_POST]", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
