import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import * as XLSX from "xlsx"
import { MONTH_NAMES } from "@/lib/utils"

const STATUS_LABELS: Record<string, string> = {
  worked: "Trabalhado",
  day_off: "Folga",
  embarked: "Embarcado",
  disembarked: "Desembarcado",
  training: "Treinamento",
  vacation: "Férias",
  medical_leave: "Atestado",
  justified_absence: "Ausência Justificada",
  not_informed: "Não Informado",
}

export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId") ?? session.user.id
    const year = parseInt(searchParams.get("year") ?? String(new Date().getFullYear()))
    const month = parseInt(searchParams.get("month") ?? String(new Date().getMonth() + 1))

    const isAdmin = ["admin_master", "rh", "supervisor"].includes(session.user.role)
    if (userId !== session.user.id && !isAdmin) {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 })
    }

    const [user, records] = await Promise.all([
      db.user.findUnique({
        where: { id: userId },
        include: { profile: true },
      }),
      db.attendanceRecord.findMany({
        where: {
          userId,
          date: {
            gte: new Date(year, month - 1, 1),
            lte: new Date(year, month, 0, 23, 59, 59),
          },
        },
        orderBy: { date: "asc" },
      }),
    ])

    // Build Excel data
    const data = records.map((r) => ({
      Data: new Intl.DateTimeFormat("pt-BR").format(r.date),
      "Dia da Semana": new Intl.DateTimeFormat("pt-BR", { weekday: "long" }).format(r.date),
      Status: STATUS_LABELS[r.status] ?? r.status,
      Observação: r.observation ?? "",
    }))

    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(data)

    // Column widths
    ws["!cols"] = [{ wch: 12 }, { wch: 18 }, { wch: 22 }, { wch: 40 }]

    XLSX.utils.book_append_sheet(wb, ws, `${MONTH_NAMES[month - 1]} ${year}`)

    const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" })

    const filename = `presenca_${user?.name.replace(/\s+/g, "_")}_${year}_${String(month).padStart(2, "0")}.xlsx`

    return new NextResponse(buf, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error("[ATTENDANCE_EXPORT]", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
