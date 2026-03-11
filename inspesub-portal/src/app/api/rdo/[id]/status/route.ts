import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import type { RdoStatus } from "@prisma/client"

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })

    const { id } = await params
    const { status, reviewNotes } = await request.json()

    const rdo = await db.rdoRecord.findUnique({ where: { id } })
    if (!rdo) return NextResponse.json({ error: "RDO não encontrado" }, { status: 404 })

    const canReview = ["admin_master", "rh", "supervisor"].includes(session.user.role)
    const isAuthor = rdo.authorId === session.user.id

    // Authors can submit, reviewers can approve/reject
    if (status === "submitted" && !isAuthor) {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 })
    }

    if (["approved", "rejected", "under_review"].includes(status) && !canReview) {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 })
    }

    const now = new Date()
    const updateData: Record<string, unknown> = { status: status as RdoStatus, reviewNotes: reviewNotes || null }

    if (status === "submitted") updateData.submittedAt = now
    if (status === "approved") {
      updateData.approvedAt = now
      updateData.reviewerId = session.user.id
      updateData.reviewedAt = now
    }
    if (status === "rejected") {
      updateData.rejectedAt = now
      updateData.reviewerId = session.user.id
      updateData.reviewedAt = now
    }

    const updated = await db.rdoRecord.update({ where: { id }, data: updateData })

    // Notify author on status change
    if (status === "approved" || status === "rejected") {
      await db.notification.create({
        data: {
          userId: rdo.authorId,
          type: status === "approved" ? "general" : "pending_rdo",
          title: `RDO ${status === "approved" ? "aprovado" : "rejeitado"}`,
          message: `Seu RDO de ${new Intl.DateTimeFormat("pt-BR").format(rdo.date)} foi ${status === "approved" ? "aprovado" : "rejeitado"}.`,
          link: "/rdo",
        },
      })
    }

    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action: status === "approved" ? "rdo_approved" : status === "rejected" ? "rdo_rejected" : "rdo_submitted",
        description: `RDO ${status}: ${id}`,
        metadata: { rdoId: id, status },
      },
    })

    return NextResponse.json({ data: updated })
  } catch (error) {
    console.error("[RDO_STATUS]", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
