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

    const { id } = await params

    const payslip = await db.payslip.findUnique({ where: { id } })
    if (!payslip) return NextResponse.json({ error: "Não encontrado" }, { status: 404 })

    if (payslip.employeeId !== session.user.id && !["admin_master", "rh"].includes(session.user.role)) {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 })
    }

    await db.payslip.update({
      where: { id },
      data: { readAt: new Date() },
    })

    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action: "download",
        description: `Contracheque visualizado: ${payslip.month}/${payslip.year}`,
        metadata: { payslipId: id },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[PAYSLIP_READ]", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
