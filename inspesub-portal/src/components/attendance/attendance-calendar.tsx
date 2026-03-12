"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { cn, MONTH_NAMES } from "@/lib/utils"
import type { AttendanceStatus } from "@prisma/client"
import { ChevronLeft, ChevronRight, Lock, Download, Filter } from "lucide-react"

type AttendanceRecord = {
  id: string
  date: string
  status: AttendanceStatus
  observation: string | null
}

interface AttendanceCalendarProps {
  year: number
  month: number
  records: AttendanceRecord[]
  isClosed: boolean
  isAdmin: boolean
  userId: string
  users: { id: string; name: string; profile: { position: string | null } | null }[]
  currentUserId: string
}

const STATUS_CONFIG: Record<
  AttendanceStatus,
  { label: string; color: string; bg: string; dot: string }
> = {
  worked: { label: "Trabalhado", color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200", dot: "bg-emerald-500" },
  day_off: { label: "Folga", color: "text-[#6B7280]", bg: "bg-gray-50 border-gray-200", dot: "bg-gray-400" },
  embarked: { label: "Embarcado", color: "text-[#0059A0]", bg: "bg-blue-50 border-blue-200", dot: "bg-[#0059A0]" },
  disembarked: { label: "Desembarcado", color: "text-purple-700", bg: "bg-purple-50 border-purple-200", dot: "bg-purple-500" },
  training: { label: "Treinamento", color: "text-amber-700", bg: "bg-amber-50 border-amber-200", dot: "bg-amber-500" },
  vacation: { label: "Férias", color: "text-pink-700", bg: "bg-pink-50 border-pink-200", dot: "bg-pink-500" },
  medical_leave: { label: "Atestado", color: "text-red-700", bg: "bg-red-50 border-red-200", dot: "bg-red-500" },
  justified_absence: { label: "Aus. Justificada", color: "text-orange-700", bg: "bg-orange-50 border-orange-200", dot: "bg-orange-500" },
  not_informed: { label: "Não informado", color: "text-[#9CA3AF]", bg: "bg-[#F9FAFB] border-[#E5E7EB]", dot: "bg-[#D1D5DB]" },
}

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]

// ── Feriados Nacionais Brasileiros ──────────────────────────────────────────

function getEasterDate(year: number): Date {
  const a = year % 19
  const b = Math.floor(year / 100)
  const c = year % 100
  const d = Math.floor(b / 4)
  const e = b % 4
  const f = Math.floor((b + 8) / 25)
  const g = Math.floor((b - f + 1) / 3)
  const h = (19 * a + b - d - g + 15) % 30
  const i = Math.floor(c / 4)
  const k = c % 4
  const l = (32 + 2 * e + 2 * i - h - k) % 7
  const m = Math.floor((a + 11 * h + 22 * l) / 451)
  const mo = Math.floor((h + l - 7 * m + 114) / 31)
  const dy = ((h + l - 7 * m + 114) % 31) + 1
  return new Date(year, mo - 1, dy)
}

function shiftDays(date: Date, days: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

/** Retorna Map de "M-D" → nome do feriado para o ano dado */
function getBrazilianHolidays(year: number): Map<string, string> {
  const h = new Map<string, string>()
  const add = (mo: number, dy: number, name: string) => h.set(`${mo}-${dy}`, name)

  // Feriados fixos
  add(1,  1,  "Ano Novo")
  add(4,  21, "Tiradentes")
  add(5,  1,  "Dia do Trabalhador")
  add(9,  7,  "Independência")
  add(10, 12, "N. Sra. Aparecida")
  add(11, 2,  "Finados")
  add(11, 15, "Proclamação da República")
  add(11, 20, "Consciência Negra")
  add(12, 25, "Natal")

  // Feriados móveis (baseados na Páscoa)
  const easter = getEasterDate(year)
  const fmt = (d: Date) => `${d.getMonth() + 1}-${d.getDate()}`
  h.set(fmt(shiftDays(easter, -48)), "Carnaval")          // segunda
  h.set(fmt(shiftDays(easter, -47)), "Carnaval")          // terça
  h.set(fmt(shiftDays(easter, -2)),  "Sexta-feira Santa")
  h.set(fmt(easter),                 "Páscoa")
  h.set(fmt(shiftDays(easter,  60)), "Corpus Christi")

  return h
}

export function AttendanceCalendar({
  year,
  month,
  records,
  isClosed,
  isAdmin,
  userId,
  users,
  currentUserId,
}: AttendanceCalendarProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [selectedStatus, setSelectedStatus] = useState<AttendanceStatus>("worked")
  const [observation, setObservation] = useState("")
  const [saving, setSaving] = useState(false)
  const [filterUserId, setFilterUserId] = useState(userId)

  // Feriados do ano atual
  const holidays = getBrazilianHolidays(year)

  // Build calendar days
  const firstDay = new Date(year, month - 1, 1)
  const lastDay = new Date(year, month, 0)
  const daysInMonth = lastDay.getDate()
  const startWeekday = firstDay.getDay()

  // Map records by day
  const recordsByDay = new Map<number, AttendanceRecord>()
  records.forEach((r) => {
    const d = new Date(r.date)
    recordsByDay.set(d.getUTCDate(), r)
  })

  const canEdit = !isClosed || isAdmin

  function navigateMonth(dir: -1 | 1) {
    const d = new Date(year, month - 1 + dir, 1)
    const newYear = d.getFullYear()
    const newMonth = d.getMonth() + 1
    startTransition(() => {
      router.push(
        `/presenca?year=${newYear}&month=${newMonth}${filterUserId !== currentUserId ? `&userId=${filterUserId}` : ""}`
      )
    })
  }

  function handleUserFilter(uid: string) {
    setFilterUserId(uid)
    startTransition(() => {
      router.push(`/presenca?year=${year}&month=${month}&userId=${uid}`)
    })
  }

  function openDayModal(day: number) {
    if (!canEdit) return
    const record = recordsByDay.get(day)
    setSelectedStatus(record?.status ?? "not_informed")
    setObservation(record?.observation ?? "")
    setSelectedDay(day)
  }

  async function clearRecord() {
    if (!selectedDay) return
    setSaving(true)
    try {
      const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(selectedDay).padStart(2, "0")}`
      const res = await fetch(`/api/attendance?userId=${filterUserId}&date=${dateStr}`, { method: "DELETE" })
      if (res.ok) {
        setSelectedDay(null)
        router.refresh()
      }
    } finally {
      setSaving(false)
    }
  }

  async function saveRecord() {
    if (!selectedDay) return
    setSaving(true)

    try {
      const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(selectedDay).padStart(2, "0")}`

      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: filterUserId,
          date: dateStr,
          status: selectedStatus,
          observation: observation || null,
        }),
      })

      if (res.ok) {
        setSelectedDay(null)
        router.refresh()
      }
    } finally {
      setSaving(false)
    }
  }

  async function closeMonth() {
    if (!confirm("Tem certeza que deseja fechar o mês? Não será possível editar após o fechamento.")) return

    const res = await fetch("/api/attendance/close", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: filterUserId, year, month }),
    })

    if (res.ok) router.refresh()
  }

  async function exportToExcel() {
    window.location.href = `/api/attendance/export?userId=${filterUserId}&year=${year}&month=${month}`
  }

  // Summary
  const summary: Record<AttendanceStatus, number> = {} as Record<AttendanceStatus, number>
  Object.keys(STATUS_CONFIG).forEach((s) => { summary[s as AttendanceStatus] = 0 })
  records.forEach((r) => { summary[r.status] = (summary[r.status] ?? 0) + 1 })

  // Conta feriados nacionais que caem neste mês
  const holidaysThisMonth = Array.from(holidays.entries())
    .filter(([key]) => key.startsWith(`${month}-`))
    .map(([, name]) => name)

  return (
    <div className="space-y-5">
      {/* Controls */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* Month navigation */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigateMonth(-1)}
              disabled={isPending}
              className="w-8 h-8 rounded-lg border border-[#E5E7EB] flex items-center justify-center hover:bg-[#F5F8FB] transition-colors disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4 text-[#6B7280]" />
            </button>
            <h2 className="text-base font-semibold text-[#1F2937] min-w-[180px] text-center">
              {MONTH_NAMES[month - 1]} {year}
            </h2>
            <button
              onClick={() => navigateMonth(1)}
              disabled={isPending}
              className="w-8 h-8 rounded-lg border border-[#E5E7EB] flex items-center justify-center hover:bg-[#F5F8FB] transition-colors disabled:opacity-50"
            >
              <ChevronRight className="w-4 h-4 text-[#6B7280]" />
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            {isAdmin && (
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-[#6B7280]" />
                <select
                  value={filterUserId}
                  onChange={(e) => handleUserFilter(e.target.value)}
                  className="h-8 px-2 border border-[#E5E7EB] rounded-lg text-xs text-[#1F2937] focus:outline-none focus:border-[#0059A0] bg-white"
                >
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              onClick={exportToExcel}
              className="flex items-center gap-1.5 h-8 px-3 text-xs font-medium text-[#6B7280] border border-[#E5E7EB] rounded-lg hover:bg-[#F5F8FB] transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Exportar
            </button>

            {isAdmin && !isClosed && (
              <button
                onClick={closeMonth}
                className="flex items-center gap-1.5 h-8 px-3 text-xs font-medium text-amber-600 border border-amber-200 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors"
              >
                <Lock className="w-3.5 h-3.5" />
                Fechar Mês
              </button>
            )}

            {isClosed && (
              <div className="flex items-center gap-1.5 h-8 px-3 text-xs font-medium text-[#6B7280] bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg">
                <Lock className="w-3.5 h-3.5" />
                Mês Fechado
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 border-b border-[#E5E7EB]">
          {WEEKDAYS.map((day) => (
            <div
              key={day}
              className="py-3 text-center text-xs font-semibold text-[#6B7280] uppercase tracking-wide"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7">
          {/* Empty cells before month start */}
          {Array.from({ length: startWeekday }).map((_, i) => (
            <div key={`empty-${i}`} className="h-14 border-b border-r border-[#F3F4F6]" />
          ))}

          {/* Days */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1
            const record = recordsByDay.get(day)
            const status = record?.status ?? "not_informed"
            const config = STATUS_CONFIG[status]
            const isToday =
              new Date().getDate() === day &&
              new Date().getMonth() + 1 === month &&
              new Date().getFullYear() === year
            const isWeekend = new Date(year, month - 1, day).getDay() % 6 === 0
            const holidayName = holidays.get(`${month}-${day}`)

            return (
              <div
                key={day}
                onClick={() => canEdit && openDayModal(day)}
                className={cn(
                  "h-14 border-b border-r border-[#F3F4F6] p-1.5 flex flex-col transition-all",
                  canEdit && "cursor-pointer hover:bg-[#F8FAFC]",
                  isWeekend && "bg-[#FAFBFC]",
                  holidayName && !record && "bg-red-50/40",
                  record && status !== "not_informed" && "bg-opacity-50"
                )}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={cn(
                      "text-xs font-medium",
                      isToday
                        ? "w-5 h-5 rounded-full bg-[#0059A0] text-white flex items-center justify-center text-[11px]"
                        : isWeekend
                        ? "text-[#9CA3AF]"
                        : "text-[#374151]"
                    )}
                  >
                    {day}
                  </span>
                  <div className="flex items-center gap-1">
                    {holidayName && (
                      <div className="w-2 h-2 rounded-full bg-red-400" title={holidayName} />
                    )}
                    {record && status !== "not_informed" && (
                      <div className={cn("w-2 h-2 rounded-full", config.dot)} />
                    )}
                  </div>
                </div>
                {holidayName && (
                  <div className="mt-0.5 px-1.5 py-0.5 rounded text-[11px] font-semibold leading-tight hidden sm:block text-red-600 bg-red-50 border border-red-100 truncate">
                    {holidayName}
                  </div>
                )}
                {record && status !== "not_informed" && (
                  <div className={cn("mt-0.5 px-1.5 py-0.5 rounded text-[11px] font-medium leading-tight hidden sm:block", config.bg, config.color)}>
                    {config.label}
                  </div>
                )}
                {record?.observation && (
                  <div className="mt-auto" title={record.observation}>
                    <div className="w-1.5 h-1.5 rounded-full bg-[#0B7FC1]" />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Summary */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
        <h3 className="text-sm font-semibold text-[#1F2937] mb-4">Resumo do Mês</h3>
        <div className="flex flex-wrap gap-2">
          {Object.entries(STATUS_CONFIG).filter(([status]) => status !== "not_informed").map(([status, config]) => (
            <div key={status} className={cn("flex items-center gap-2 px-3 py-1.5 rounded-lg border", config.bg)}>
              <span className={cn("text-sm font-bold", config.color)}>{summary[status as AttendanceStatus] ?? 0}</span>
              <span className={cn("text-xs font-medium", config.color)}>{config.label}</span>
            </div>
          ))}
          {/* Feriados do mês */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-red-200 bg-red-50">
            <span className="text-sm font-bold text-red-600">{holidaysThisMonth.length}</span>
            <span className="text-xs font-medium text-red-600">Feriados</span>
          </div>
        </div>

        {/* Lista de feriados do mês */}
        {holidaysThisMonth.length > 0 && (
          <div className="mt-4 pt-4 border-t border-[#F3F4F6]">
            <p className="text-xs font-medium text-[#6B7280] mb-2">Feriados Nacionais em {MONTH_NAMES[month - 1]}</p>
            <div className="flex flex-wrap gap-2">
              {Array.from(holidays.entries())
                .filter(([key]) => key.startsWith(`${month}-`))
                .sort(([a], [b]) => {
                  const da = parseInt(a.split("-")[1])
                  const db = parseInt(b.split("-")[1])
                  return da - db
                })
                .map(([key, name]) => {
                  const day = key.split("-")[1]
                  return (
                    <span key={key} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
                      <span className="font-bold">{day}</span>
                      {name}
                    </span>
                  )
                })}
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {selectedDay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSelectedDay(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <h3 className="text-base font-semibold text-[#1F2937] mb-1">
              Dia {selectedDay} — {MONTH_NAMES[month - 1]} {year}
            </h3>
            <p className="text-xs text-[#6B7280] mb-5">Selecione o status do dia</p>

            <div className="grid grid-cols-2 gap-2 mb-4">
              {Object.entries(STATUS_CONFIG).filter(([status]) => status !== "not_informed").map(([status, config]) => (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status as AttendanceStatus)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all",
                    selectedStatus === status
                      ? `${config.bg} ${config.color} border-current`
                      : "border-[#E5E7EB] text-[#6B7280] hover:border-[#CBD5E1]"
                  )}
                >
                  <div className={cn("w-2 h-2 rounded-full flex-shrink-0", config.dot)} />
                  {config.label}
                </button>
              ))}
            </div>

            <div className="mb-5">
              <label className="block text-xs font-medium text-[#1F2937] mb-1.5">
                Observação (opcional)
              </label>
              <textarea
                value={observation}
                onChange={(e) => setObservation(e.target.value)}
                placeholder="Ex: Atividade em plataforma P-52..."
                rows={3}
                className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm text-[#1F2937] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#0059A0] resize-none"
              />
            </div>

            {selectedDay && recordsByDay.get(selectedDay) && recordsByDay.get(selectedDay)!.status !== "not_informed" && (
              <button
                onClick={clearRecord}
                disabled={saving}
                className="w-full h-9 mb-3 border border-red-200 text-sm text-red-600 rounded-xl hover:bg-red-50 transition-colors disabled:opacity-60"
              >
                {saving ? "Removendo..." : "Desmarcar este dia"}
              </button>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setSelectedDay(null)}
                className="flex-1 h-10 border border-[#E5E7EB] text-sm text-[#6B7280] rounded-xl hover:bg-[#F5F8FB] transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={saveRecord}
                disabled={saving}
                className="flex-1 h-10 bg-[#0059A0] text-white text-sm font-medium rounded-xl hover:bg-[#1F4E87] transition-colors disabled:opacity-60"
              >
                {saving ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
