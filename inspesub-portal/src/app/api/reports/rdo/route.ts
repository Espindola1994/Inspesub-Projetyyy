import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import * as XLSX from "xlsx"
import { MONTH_NAMES } from "@/lib/utils"

const STATUS_LABELS: Record<string, string> = {
  pending: "Pendente",
  submitted: "Enviado",
  under_review: "Em Revisão",
  approved: "Aprovado",
  rejected: "Rejeitado",
}

export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })

    const canAccess = ["admin_master", "rh", "supervisor"].includes(session.user.role)
    if (!canAccess) return NextResponse.json({ error: "Sem permissão" }, { status: 403 })

    const { searchParams } = new URL(request.url)
    const year = parseInt(searchParams.get("year") ?? String(new Date().getFullYear()))
    const month = parseInt(searchParams.get("month") ?? String(new Date().getMonth() + 1))

    const rdos = await db.rdoRecord.findMany({
      where: {
        date: {
          gte: new Date(year, month - 1, 1),
          lte: new Date(year, month, 0, 23, 59, 59),
        },
      },
      include: {
        team: { select: { name: true, code: true } },
        author: { select: { name: true } },
        reviewer: { select: { name: true } },
      },
      orderBy: [{ team: { code: "asc" } }, { date: "asc" }],
    })

    const data = rdos.map((r) => ({
      Data: new Intl.DateTimeFormat("pt-BR").format(r.date),
      Equipe: `${r.team.name} (${r.team.code})`,
      Local: r.location,
      Embarcação: r.vessel ?? "",
      "Horas Trabalhadas": r.workedHours,
      "Descrição do Serviço": r.serviceDescription,
      "Condições Operacionais": r.operationalConditions ?? "",
      Equipamentos: r.equipmentUsed ?? "",
      Ocorrências: r.occurrences ?? "",
      Responsável: r.responsibleName,
      Autor: r.author.name,
      Status: STATUS_LABELS[r.status] ?? r.status,
      Revisor: r.reviewer?.name ?? "",
    }))

    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(data)
    XLSX.utils.book_append_sheet(wb, ws, `RDO - ${MONTH_NAMES[month - 1]} ${year}`)
    const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" })

    return new NextResponse(buf, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="relatorio_rdo_${year}_${String(month).padStart(2, "0")}.xlsx"`,
      },
    })
  } catch (error) {
    console.error("[REPORT_RDO]", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
