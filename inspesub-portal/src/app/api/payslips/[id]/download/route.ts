import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { createAdminClient } from "@/lib/supabase/server"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) return new NextResponse("Não autenticado", { status: 401 })

    const { id } = await params

    const payslip = await db.payslip.findUnique({ where: { id } })
    if (!payslip) return new NextResponse("Não encontrado", { status: 404 })

    // Check permissions
    if (payslip.employeeId !== session.user.id && !["admin_master", "rh"].includes(session.user.role)) {
      return new NextResponse("Sem permissão", { status: 403 })
    }

    const supabase = createAdminClient()
    
    // Extract the filePath from the publicUrl or fileName logic
    // We used: `payslips/${employeeId}/${year}-${String(month).padStart(2, "0")}.${ext}` for upload
    // The easiest way is to fetch by the fileName saved during upload if we used it as path, 
    // but the DB saves file.name as fileName. Let's extract the path from the URL.
    
    const urlParts = payslip.fileUrl.split('/portal-files/')
    if (urlParts.length < 2) {
      return new NextResponse("URL de arquivo inválida", { status: 500 })
    }
    
    const filePath = urlParts[1]

    // Create a short-lived signed URL to securely view/download the file
    const { data, error } = await supabase.storage
      .from("portal-files")
      .createSignedUrl(filePath, 60, {
        download: payslip.fileName // Forces download with the original name
      })

    if (error || !data) {
      console.error("[PAYSLIPS_DOWNLOAD_ERROR]", error)
      return new NextResponse("Erro ao gerar link de acesso", { status: 500 })
    }

    // Redirect the user to the signed URL
    return NextResponse.redirect(data.signedUrl)
  } catch (error) {
    console.error("[PAYSLIPS_DOWNLOAD]", error)
    return new NextResponse("Erro interno", { status: 500 })
  }
}
