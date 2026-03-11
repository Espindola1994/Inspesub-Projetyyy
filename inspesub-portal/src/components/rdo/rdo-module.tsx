"use client"

import { useState } from "react"
import { createPortal } from "react-dom"
import { useRouter } from "next/navigation"
import { formatDate } from "@/lib/utils"
import { ClipboardList, Plus, Eye, CheckCircle, X, Filter, Search, FileText, Clock, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import type { RdoStatus } from "@prisma/client"
import { useLanguage } from "@/components/providers/language-provider"

type RdoRecord = {
  id: string
  date: string
  status: RdoStatus
  location: string
  vessel: string | null
  serviceDescription: string
  workedHours: number
  responsibleName: string
  reviewNotes: string | null
  team: { id: string; name: string; code: string }
  author: { id: string; name: string }
  reviewer: { id: string; name: string } | null
  files: { id: string; fileName: string; fileUrl: string }[]
}

interface RdoModuleProps {
  rdos: RdoRecord[]
  teams: { id: string; name: string; code: string }[]
  isAdmin: boolean
  isSupervisor: boolean
  currentUserId: string
  currentUserName: string
}

export function RdoModule({ rdos, teams, isAdmin, isSupervisor, currentUserId, currentUserName }: RdoModuleProps) {
  const router = useRouter()
  const { t } = useLanguage()
  const [search, setSearch] = useState("")
  const [filterStatus, setFilterStatus] = useState<RdoStatus | "">("")
  const [filterTeam, setFilterTeam] = useState("")
  const [createOpen, setCreateOpen] = useState(false)
  const [selectedRdo, setSelectedRdo] = useState<RdoRecord | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    teamId: "",
    date: new Date().toISOString().split("T")[0],
    location: "",
    vessel: "",
    serviceDescription: "",
    workedHours: "8",
    operationalConditions: "",
    equipmentUsed: "",
    occurrences: "",
    responsibleName: currentUserName,
  })

  const STATUS_CONFIG: Record<RdoStatus, { label: string; color: string; icon: React.ElementType }> = {
    pending: { label: t('status_pending'), color: "bg-amber-50 text-amber-700 border-amber-200", icon: Clock },
    submitted: { label: t('status_sent'), color: "bg-blue-50 text-[#0059A0] border-blue-200", icon: FileText },
    under_review: { label: t('status_in_review'), color: "bg-purple-50 text-purple-700 border-purple-200", icon: Eye },
    approved: { label: t('status_approved'), color: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: CheckCircle },
    rejected: { label: t('status_rejected'), color: "bg-red-50 text-red-700 border-red-200", icon: AlertCircle },
  }

  const canReview = isAdmin || isSupervisor

  const filtered = rdos.filter((r) => {
    if (search && !r.location.toLowerCase().includes(search.toLowerCase()) &&
        !r.team.name.toLowerCase().includes(search.toLowerCase())) return false
    if (filterStatus && r.status !== filterStatus) return false
    if (filterTeam && r.team.id !== filterTeam) return false
    return true
  })

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch("/api/rdo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, workedHours: parseFloat(form.workedHours) }),
      })
      if (res.ok) {
        setCreateOpen(false)
        router.refresh()
      }
    } finally {
      setSaving(false)
    }
  }

  async function handleStatusChange(rdoId: string, newStatus: RdoStatus, notes?: string) {
    await fetch(`/api/rdo/${rdoId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus, reviewNotes: notes }),
    })
    setSelectedRdo(null)
    router.refresh()
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] p-4 flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9CA3AF]" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder={t('rdo_search')}
            className="w-full h-9 pl-9 pr-3 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:border-[#0059A0] text-[#1F2937]" />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-[#6B7280]" />
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as RdoStatus | "")}
            className="h-9 px-2 border border-[#E5E7EB] rounded-lg text-sm text-[#1F2937] focus:outline-none focus:border-[#0059A0]">
            <option value="">{t('status_all')}</option>
            {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
          {teams.length > 0 && (
            <select value={filterTeam} onChange={(e) => setFilterTeam(e.target.value)}
              className="h-9 px-2 border border-[#E5E7EB] rounded-lg text-sm text-[#1F2937] focus:outline-none focus:border-[#0059A0]">
              <option value="">{t('filter_all_teams')}</option>
              {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          )}
        </div>

        <button onClick={() => setCreateOpen(true)}
          className="flex items-center gap-2 h-9 px-4 bg-[#0059A0] text-white text-sm font-medium rounded-lg hover:bg-[#1F4E87] transition-colors ml-auto">
          <Plus className="w-3.5 h-3.5" />
          {t('action_new_rdo')}
        </button>
      </div>

      {/* RDO List */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
              <th className="text-left px-5 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wide">{t('col_date')}</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wide">{t('col_team')}</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wide">{t('col_location')}</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wide">{t('col_hours')}</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wide">{t('col_responsible')}</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wide">{t('col_status')}</th>
              <th className="px-5 py-3 text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F3F4F6]">
            {filtered.length === 0 ? (
              <tr><td colSpan={7} className="px-5 py-10 text-center text-sm text-[#6B7280]">
                <ClipboardList className="w-10 h-10 text-[#D1D5DB] mx-auto mb-2" />
                {t('empty_rdos')}
              </td></tr>
            ) : filtered.map((rdo) => {
              const statusConfig = STATUS_CONFIG[rdo.status]
              const StatusIcon = statusConfig.icon
              return (
                <tr key={rdo.id} className="hover:bg-[#F8FAFC] transition-colors">
                  <td className="px-5 py-4 font-medium text-[#1F2937]">{formatDate(rdo.date)}</td>
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-blue-50 text-[#0059A0] text-xs font-medium rounded-full">
                      {rdo.team.code}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-[#6B7280] max-w-[200px] truncate">{rdo.location}</td>
                  <td className="px-5 py-4 text-[#1F2937]">{rdo.workedHours}h</td>
                  <td className="px-5 py-4 text-[#6B7280]">{rdo.responsibleName}</td>
                  <td className="px-5 py-4">
                    <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 border rounded-full text-xs font-medium", statusConfig.color)}>
                      <StatusIcon className="w-3 h-3" />
                      {statusConfig.label}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button onClick={() => setSelectedRdo(rdo)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center ml-auto text-[#0059A0] hover:bg-blue-50 transition-colors">
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Create RDO Modal */}
      {createOpen && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50" onClick={() => setCreateOpen(false)}>
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="shrink-0 flex items-center justify-between p-6 pb-4">
              <h3 className="text-base font-semibold text-[#1F2937]">{t('rdo_new_title')}</h3>
              <button onClick={() => setCreateOpen(false)} className="p-1 hover:bg-[#F5F8FB] rounded-lg transition-colors">
                <X className="w-4 h-4 text-[#6B7280]" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto min-h-0 p-6 pt-0">
              <form id="rdo-form" onSubmit={handleCreate} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-[#1F2937] mb-1.5">{t('rdo_team_req')}</label>
                    <select required value={form.teamId} onChange={(e) => setForm(p => ({ ...p, teamId: e.target.value }))}
                      className="w-full h-10 px-3 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:border-[#0059A0] text-[#1F2937]">
                      <option value="">{t('select_placeholder')}</option>
                      {teams.map((t) => <option key={t.id} value={t.id}>{t.name} ({t.code})</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#1F2937] mb-1.5">{t('rdo_date_req')}</label>
                    <input required type="date" value={form.date} onChange={(e) => setForm(p => ({ ...p, date: e.target.value }))}
                      className="w-full h-10 px-3 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:border-[#0059A0] text-[#1F2937]" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-[#1F2937] mb-1.5">{t('rdo_location_req')}</label>
                    <input required value={form.location} onChange={(e) => setForm(p => ({ ...p, location: e.target.value }))}
                      placeholder={t('rdo_location_ph')}
                      className="w-full h-10 px-3 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:border-[#0059A0] placeholder:text-[#9CA3AF] text-[#1F2937]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#1F2937] mb-1.5">{t('rdo_vessel')}</label>
                    <input value={form.vessel} onChange={(e) => setForm(p => ({ ...p, vessel: e.target.value }))}
                      placeholder={t('rdo_vessel_ph')}
                      className="w-full h-10 px-3 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:border-[#0059A0] placeholder:text-[#9CA3AF] text-[#1F2937]" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#1F2937] mb-1.5">{t('rdo_description_req')}</label>
                  <textarea required value={form.serviceDescription} onChange={(e) => setForm(p => ({ ...p, serviceDescription: e.target.value }))}
                    rows={3} placeholder={t('rdo_description_ph')}
                    className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:border-[#0059A0] resize-none placeholder:text-[#9CA3AF] text-[#1F2937]" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-[#1F2937] mb-1.5">{t('rdo_hours_req')}</label>
                    <input required type="number" min="0" max="24" step="0.5" value={form.workedHours} onChange={(e) => setForm(p => ({ ...p, workedHours: e.target.value }))}
                      className="w-full h-10 px-3 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:border-[#0059A0] text-[#1F2937]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#1F2937] mb-1.5">{t('rdo_responsible_req')}</label>
                    <input required value={form.responsibleName} onChange={(e) => setForm(p => ({ ...p, responsibleName: e.target.value }))}
                      className="w-full h-10 px-3 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:border-[#0059A0] text-[#1F2937]" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#1F2937] mb-1.5">{t('rdo_conditions')}</label>
                  <textarea value={form.operationalConditions} onChange={(e) => setForm(p => ({ ...p, operationalConditions: e.target.value }))}
                    rows={2} placeholder={t('rdo_conditions_ph')}
                    className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:border-[#0059A0] resize-none placeholder:text-[#9CA3AF] text-[#1F2937]" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#1F2937] mb-1.5">{t('rdo_equipment')}</label>
                  <textarea value={form.equipmentUsed} onChange={(e) => setForm(p => ({ ...p, equipmentUsed: e.target.value }))}
                    rows={2} placeholder={t('rdo_equipment_ph')}
                    className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:border-[#0059A0] resize-none placeholder:text-[#9CA3AF] text-[#1F2937]" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#1F2937] mb-1.5">{t('rdo_occurrences')}</label>
                  <textarea value={form.occurrences} onChange={(e) => setForm(p => ({ ...p, occurrences: e.target.value }))}
                    rows={2} placeholder={t('rdo_occurrences_ph')}
                    className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:border-[#0059A0] resize-none placeholder:text-[#9CA3AF] text-[#1F2937]" />
                </div>
              </form>
            </div>

            <div className="shrink-0 p-6 pt-0 flex gap-3">
              <button type="button" onClick={() => setCreateOpen(false)}
                className="flex-1 h-10 border border-[#E5E7EB] text-sm text-[#6B7280] rounded-xl hover:bg-[#F5F8FB] transition-colors font-medium">{t('action_cancel')}</button>
              <button type="submit" form="rdo-form" disabled={saving}
                className="flex-1 h-10 bg-[#0059A0] text-white text-sm font-medium rounded-xl hover:bg-[#1F4E87] disabled:opacity-60 transition-colors shadow-sm">
                {saving ? t('action_creating_rdo') : t('action_create_rdo')}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* View RDO Modal */}
      {selectedRdo && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50" onClick={() => setSelectedRdo(null)}>
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="shrink-0 flex items-center justify-between p-6 pb-4 border-b border-[#F3F4F6]">
              <div>
                <h3 className="text-base font-semibold text-[#1F2937]">RDO — {formatDate(selectedRdo.date)}</h3>
                <p className="text-xs text-[#6B7280] mt-0.5">{selectedRdo.team.name} ({selectedRdo.team.code})</p>
              </div>
              <button onClick={() => setSelectedRdo(null)} className="p-1 hover:bg-[#F5F8FB] rounded-lg transition-colors">
                <X className="w-4 h-4 text-[#6B7280]" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto min-h-0 p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-[#6B7280] mb-0.5">{t('col_location')}</p>
                  <p className="text-sm text-[#1F2937] font-medium">{selectedRdo.location}</p>
                </div>
                {selectedRdo.vessel && (
                  <div>
                    <p className="text-xs text-[#6B7280] mb-0.5">{t('rdo_vessel_label')}</p>
                    <p className="text-sm text-[#1F2937] font-medium">{selectedRdo.vessel}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-[#6B7280] mb-0.5">{t('rdo_hours_label')}</p>
                  <p className="text-sm text-[#1F2937] font-medium">{selectedRdo.workedHours}h</p>
                </div>
                <div>
                  <p className="text-xs text-[#6B7280] mb-0.5">{t('col_responsible')}</p>
                  <p className="text-sm text-[#1F2937] font-medium">{selectedRdo.responsibleName}</p>
                </div>
              </div>

              <div>
                <p className="text-xs text-[#6B7280] mb-1">{t('rdo_description_req')}</p>
                <p className="text-sm text-[#1F2937] bg-[#F9FAFB] rounded-lg p-3">{selectedRdo.serviceDescription}</p>
              </div>

              {selectedRdo.files.length > 0 && (
                <div>
                  <p className="text-xs text-[#6B7280] mb-2">{t('rdo_attachments')}</p>
                  <div className="space-y-1">
                    {selectedRdo.files.map((f) => (
                      <a key={f.id} href={f.fileUrl} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 p-2 rounded-lg border border-[#E5E7EB] hover:bg-[#F5F8FB] transition-colors">
                        <FileText className="w-4 h-4 text-[#6B7280]" />
                        <span className="text-sm text-[#0059A0]">{f.fileName}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Review actions / Status Actions */}
            {((canReview && selectedRdo.status === "submitted") || (selectedRdo.status === "pending" && selectedRdo.author.id === currentUserId)) && (
              <div className="shrink-0 p-6 pt-4 border-t border-[#F3F4F6] bg-[#F9FAFB]">
                {canReview && selectedRdo.status === "submitted" && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-[#6B7280] uppercase">{t('rdo_review')}</p>
                    <div className="flex gap-2">
                      <button onClick={() => handleStatusChange(selectedRdo.id, "approved")}
                        className="flex-1 h-9 bg-emerald-500 text-white text-sm font-medium rounded-lg hover:bg-emerald-600 transition-colors flex items-center justify-center gap-1.5 shadow-sm">
                        <CheckCircle className="w-4 h-4" /> {t('action_approve')}
                      </button>
                      <button onClick={() => handleStatusChange(selectedRdo.id, "rejected")}
                        className="flex-1 h-9 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center gap-1.5 shadow-sm">
                        <X className="w-4 h-4" /> {t('action_reject')}
                      </button>
                    </div>
                  </div>
                )}

                {selectedRdo.status === "pending" && selectedRdo.author.id === currentUserId && (
                  <button onClick={() => handleStatusChange(selectedRdo.id, "submitted")}
                    className="w-full h-9 bg-[#0059A0] text-white text-sm font-medium rounded-lg hover:bg-[#1F4E87] transition-colors shadow-sm">
                    {t('action_send_review')}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
