"use client"

import { useState } from "react"
import { MONTH_NAMES } from "@/lib/utils"
import { Download, FileText, BarChart3, Users, CalendarDays } from "lucide-react"
import { useLanguage } from "@/components/providers/language-provider"

interface ReportsModuleProps {
  employees: { id: string; name: string }[]
  teams: { id: string; name: string; code: string }[]
}

const CURRENT_YEAR = new Date().getFullYear()
const YEARS = Array.from({ length: 5 }, (_, i) => CURRENT_YEAR - i)
const MONTHS = MONTH_NAMES.map((name, i) => ({ value: i + 1, label: name }))

export function ReportsModule({ employees, teams }: ReportsModuleProps) {
  const { t } = useLanguage()
  const [presencaForm, setPresencaForm] = useState({
    userId: "",
    teamId: "",
    year: String(CURRENT_YEAR),
    month: String(new Date().getMonth() + 1),
  })

  function exportPresenca() {
    const params = new URLSearchParams()
    if (presencaForm.userId) params.set("userId", presencaForm.userId)
    if (presencaForm.teamId) params.set("teamId", presencaForm.teamId)
    params.set("year", presencaForm.year)
    params.set("month", presencaForm.month)
    window.location.href = `/api/reports/attendance?${params}`
  }

  function exportRdo() {
    window.location.href = `/api/reports/rdo?year=${presencaForm.year}&month=${presencaForm.month}`
  }

  const REPORT_CARDS = [
    {
      title: t('rep_attendance_title'),
      description: t('rep_attendance_desc'),
      icon: CalendarDays,
      color: "bg-blue-50 text-[#0059A0]",
      action: (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <select value={presencaForm.year} onChange={(e) => setPresencaForm(p => ({ ...p, year: e.target.value }))}
              className="h-9 px-2 border border-[#E5E7EB] rounded-lg text-sm text-[#1F2937] focus:outline-none focus:border-[#0059A0]">
              {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
            <select value={presencaForm.month} onChange={(e) => setPresencaForm(p => ({ ...p, month: e.target.value }))}
              className="h-9 px-2 border border-[#E5E7EB] rounded-lg text-sm text-[#1F2937] focus:outline-none focus:border-[#0059A0]">
              {MONTHS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </div>
          <select value={presencaForm.userId} onChange={(e) => setPresencaForm(p => ({ ...p, userId: e.target.value }))}
            className="w-full h-9 px-2 border border-[#E5E7EB] rounded-lg text-sm text-[#1F2937] focus:outline-none focus:border-[#0059A0]">
            <option value="">{t('filter_all_employees')}</option>
            {employees.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>
          <select value={presencaForm.teamId} onChange={(e) => setPresencaForm(p => ({ ...p, teamId: e.target.value }))}
            className="w-full h-9 px-2 border border-[#E5E7EB] rounded-lg text-sm text-[#1F2937] focus:outline-none focus:border-[#0059A0]">
            <option value="">{t('filter_all_teams')}</option>
            {teams.map((t) => <option key={t.id} value={t.id}>{t.name} ({t.code})</option>)}
          </select>
          <button onClick={exportPresenca}
            className="w-full flex items-center justify-center gap-2 h-9 bg-[#0059A0] text-white text-sm font-medium rounded-lg hover:bg-[#1F4E87] transition-colors">
            <Download className="w-4 h-4" />
            {t('action_export_excel')}
          </button>
        </div>
      ),
    },
    {
      title: t('rep_rdo_title'),
      description: t('rep_rdo_desc'),
      icon: FileText,
      color: "bg-orange-50 text-[#FF7A2F]",
      action: (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <select value={presencaForm.year} onChange={(e) => setPresencaForm(p => ({ ...p, year: e.target.value }))}
              className="h-9 px-2 border border-[#E5E7EB] rounded-lg text-sm text-[#1F2937] focus:outline-none focus:border-[#0059A0]">
              {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
            <select value={presencaForm.month} onChange={(e) => setPresencaForm(p => ({ ...p, month: e.target.value }))}
              className="h-9 px-2 border border-[#E5E7EB] rounded-lg text-sm text-[#1F2937] focus:outline-none focus:border-[#0059A0]">
              {MONTHS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </div>
          <button onClick={exportRdo}
            className="w-full flex items-center justify-center gap-2 h-9 bg-[#FF7A2F] text-white text-sm font-medium rounded-lg hover:bg-[#FF9A4A] transition-colors">
            <Download className="w-4 h-4" />
            {t('action_export_excel')}
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: t('rep_employees'), value: employees.length, icon: Users, color: "bg-blue-50 text-[#0059A0]" },
          { label: t('rep_active_teams'), value: teams.length, icon: BarChart3, color: "bg-purple-50 text-purple-600" },
        ].map((card) => {
          const Icon = card.icon
          return (
            <div key={card.label} className="bg-white rounded-xl border border-[#E5E7EB] p-5">
              <div className={`w-10 h-10 rounded-xl ${card.color} flex items-center justify-center mb-3`}>
                <Icon className="w-5 h-5" />
              </div>
              <p className="text-2xl font-bold text-[#1F2937]">{card.value}</p>
              <p className="text-xs text-[#6B7280] mt-0.5">{card.label}</p>
            </div>
          )
        })}
      </div>

      {/* Report generators */}
      <div className="grid sm:grid-cols-2 gap-6">
        {REPORT_CARDS.map((card) => {
          const Icon = card.icon
          return (
            <div key={card.title} className="bg-white rounded-xl border border-[#E5E7EB] p-6">
              <div className="flex items-start gap-4 mb-5">
                <div className={`w-10 h-10 rounded-xl ${card.color} flex items-center justify-center flex-shrink-0`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#1F2937]">{card.title}</h3>
                  <p className="text-xs text-[#6B7280] mt-0.5">{card.description}</p>
                </div>
              </div>
              {card.action}
            </div>
          )
        })}
      </div>
    </div>
  )
}
