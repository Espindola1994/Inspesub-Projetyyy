"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { getInitials } from "@/lib/utils"
import { Users, Plus, Search, Building, UserPlus, X, ChevronDown, ChevronUp, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/components/providers/language-provider"

type TeamMember = {
  id: string
  user: { id: string; name: string; email: string; profile: { position: string | null } | null }
}

type Team = {
  id: string
  name: string
  code: string
  description: string | null
  operation: string | null
  isActive: boolean
  supervisor: { id: string; name: string } | null
  members: TeamMember[]
  _count: { members: number; rdoRecords: number }
}

interface TeamsModuleProps {
  teams: Team[]
  isAdmin: boolean
  supervisors: { id: string; name: string }[]
  employees: { id: string; name: string; email: string; profile: { position: string | null } | null }[]
  currentUserId: string
}

export function TeamsModule({ teams: initialTeams, isAdmin, supervisors, employees, currentUserId }: TeamsModuleProps) {
  const router = useRouter()
  const { t } = useLanguage()
  const [localTeams, setLocalTeams] = useState<Team[]>(initialTeams)
  const [search, setSearch] = useState("")
  const [createOpen, setCreateOpen] = useState(false)
  const [expandedTeam, setExpandedTeam] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [addMemberTeam, setAddMemberTeam] = useState<string | null>(null)
  const [newMemberId, setNewMemberId] = useState("")
  const [form, setForm] = useState({
    name: "",
    code: "",
    description: "",
    operation: "",
    supervisorId: "",
  })

  const filtered = localTeams.filter((t) =>
    !search || t.name.toLowerCase().includes(search.toLowerCase()) || t.code.toLowerCase().includes(search.toLowerCase())
  )

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch("/api/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        setCreateOpen(false)
        setForm({ name: "", code: "", description: "", operation: "", supervisorId: "" })
        router.refresh()
      }
    } finally {
      setSaving(false)
    }
  }

  async function handleAddMember(teamId: string) {
    if (!newMemberId) return
    await fetch(`/api/teams/${teamId}/members`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: newMemberId }),
    })
    const emp = employees.find((e) => e.id === newMemberId)
    if (emp) {
      setLocalTeams((prev) =>
        prev.map((t) =>
          t.id !== teamId ? t : {
            ...t,
            members: [...t.members, { id: newMemberId, user: emp }],
            _count: { ...t._count, members: t._count.members + 1 },
          }
        )
      )
    }
    setAddMemberTeam(null)
    setNewMemberId("")
    router.refresh()
  }

  async function handleRemoveMember(teamId: string, userId: string) {
    if (!confirm("Remover este membro da equipe?")) return
    await fetch(`/api/teams/${teamId}/members/${userId}`, { method: "DELETE" })
    setLocalTeams((prev) =>
      prev.map((t) =>
        t.id !== teamId ? t : {
          ...t,
          members: t.members.filter((m) => m.user.id !== userId),
          _count: { ...t._count, members: t._count.members - 1 },
        }
      )
    )
    router.refresh()
  }

  async function handleDelete(teamId: string, teamName: string) {
    if (!confirm(`Excluir a equipe "${teamName}"? Esta ação não pode ser desfeita.`)) return
    await fetch(`/api/teams/${teamId}`, { method: "DELETE" })
    setLocalTeams((prev) => prev.filter((t) => t.id !== teamId))
    router.refresh()
  }

  async function toggleActive(teamId: string, isActive: boolean) {
    await fetch(`/api/teams/${teamId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !isActive }),
    })
    setLocalTeams((prev) =>
      prev.map((t) => t.id !== teamId ? t : { ...t, isActive: !isActive })
    )
    router.refresh()
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] p-4 flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9CA3AF]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('team_search')}
            className="w-full h-9 pl-9 pr-3 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:border-[#0059A0] text-[#1F2937]"
          />
        </div>
        {isAdmin && (
          <button
            onClick={() => setCreateOpen(true)}
            className="flex items-center gap-2 h-9 px-4 bg-[#0059A0] text-white text-sm font-medium rounded-lg hover:bg-[#1F4E87] transition-colors ml-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            {t('action_new_team')}
          </button>
        )}
      </div>

      {/* Teams */}
      <div className="grid gap-4">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-12 text-center">
            <Building className="w-10 h-10 text-[#D1D5DB] mx-auto mb-3" />
            <p className="text-[#6B7280]">{t('empty_teams')}</p>
          </div>
        ) : (
          filtered.map((team) => (
            <div
              key={team.id}
              className={cn(
                "bg-white rounded-xl border transition-all",
                team.isActive ? "border-[#E5E7EB]" : "border-[#E5E7EB] opacity-70"
              )}
            >
              <div className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-xl bg-[#0059A0] flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-bold">{team.code}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-semibold text-[#1F2937]">{team.name}</h3>
                        <span className={cn(
                          "text-xs px-2 py-0.5 rounded-full font-medium",
                          team.isActive ? "bg-emerald-50 text-emerald-700" : "bg-[#F1F5F9] text-[#6B7280]"
                        )}>
                          {team.isActive ? t('status_active_label') : t('status_inactive_label')}
                        </span>
                      </div>
                      {team.operation && (
                        <p className="text-sm text-[#0059A0] mt-0.5">{team.operation}</p>
                      )}
                      {team.description && (
                        <p className="text-xs text-[#6B7280] mt-1">{team.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isAdmin && (
                      <>
                        <button
                          onClick={() => toggleActive(team.id, team.isActive)}
                          className="text-xs px-3 py-1.5 border border-[#E5E7EB] rounded-lg text-[#6B7280] hover:bg-[#F5F8FB] transition-colors"
                        >
                          {team.isActive ? t('action_deactivate') : t('action_activate')}
                        </button>
                        <button
                          onClick={() => setAddMemberTeam(addMemberTeam === team.id ? null : team.id)}
                          className="flex items-center gap-1 text-xs px-3 py-1.5 bg-blue-50 text-[#0059A0] border border-blue-100 rounded-lg hover:bg-blue-100 transition-colors"
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                          {t('action_add')}
                        </button>
                        <button
                          onClick={() => handleDelete(team.id, team.name)}
                          className="flex items-center gap-1 text-xs px-3 py-1.5 bg-red-50 text-red-600 border border-red-100 rounded-lg hover:bg-red-100 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          {t('action_delete')}
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => setExpandedTeam(expandedTeam === team.id ? null : team.id)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center border border-[#E5E7EB] hover:bg-[#F5F8FB] transition-colors"
                    >
                      {expandedTeam === team.id
                        ? <ChevronUp className="w-4 h-4 text-[#6B7280]" />
                        : <ChevronDown className="w-4 h-4 text-[#6B7280]" />}
                    </button>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-5 mt-4 pt-4 border-t border-[#F3F4F6]">
                  <div className="flex items-center gap-1.5 text-xs text-[#6B7280]">
                    <Users className="w-3.5 h-3.5" />
                    <span><strong className="text-[#1F2937]">{team._count.members}</strong> {t('team_members_count')}</span>
                  </div>
                  {team.supervisor && (
                    <div className="flex items-center gap-1.5 text-xs text-[#6B7280]">
                      <span>{t('team_supervisor_label')}: <strong className="text-[#1F2937]">{team.supervisor.name}</strong></span>
                    </div>
                  )}
                </div>

                {/* Add member */}
                {addMemberTeam === team.id && (
                  <div className="mt-4 pt-4 border-t border-[#F3F4F6] flex gap-2">
                    <select
                      value={newMemberId}
                      onChange={(e) => setNewMemberId(e.target.value)}
                      className="flex-1 h-9 px-3 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:border-[#0059A0] text-[#1F2937]"
                    >
                      <option value="">{t('team_add_member_ph')}</option>
                      {employees
                        .filter((e) => !team.members.some((m) => m.user.id === e.id))
                        .map((emp) => (
                          <option key={emp.id} value={emp.id}>{emp.name}</option>
                        ))}
                    </select>
                    <button
                      onClick={() => handleAddMember(team.id)}
                      disabled={!newMemberId}
                      className="h-9 px-4 bg-[#0059A0] text-white text-sm rounded-lg hover:bg-[#1F4E87] disabled:opacity-50 transition-colors"
                    >
                      {t('action_add')}
                    </button>
                  </div>
                )}
              </div>

              {/* Members expanded */}
              {expandedTeam === team.id && (
                <div className="border-t border-[#F3F4F6] px-5 py-4">
                  <h4 className="text-xs font-semibold text-[#6B7280] uppercase mb-3">{t('team_members_title')}</h4>
                  {team.members.length === 0 ? (
                    <p className="text-sm text-[#9CA3AF]">{t('team_no_members')}</p>
                  ) : (
                    <div className="space-y-2">
                      {team.members.map((member) => (
                        <div key={member.id} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-[#F9FAFB] transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#0059A0] flex items-center justify-center text-white text-xs font-semibold">
                              {getInitials(member.user.name)}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-[#1F2937]">{member.user.name}</p>
                              {member.user.profile?.position && (
                                <p className="text-xs text-[#6B7280]">{member.user.profile.position}</p>
                              )}
                            </div>
                          </div>
                          {isAdmin && (
                            <button
                              onClick={() => handleRemoveMember(team.id, member.user.id)}
                              className="w-7 h-7 rounded-lg flex items-center justify-center text-[#9CA3AF] hover:bg-red-50 hover:text-red-500 transition-colors"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Create Team Modal */}
      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setCreateOpen(false)}>
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>

            {/* Header */}
            <div className="shrink-0 bg-gradient-to-r from-[#0059A0] to-[#1F4E87] px-6 py-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                    <Building className="w-4.5 h-4.5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-white">{t('team_create_title')}</h3>
                    <p className="text-xs text-blue-200">{t('team_create_subtitle')}</p>
                  </div>
                </div>
                <button
                  onClick={() => setCreateOpen(false)}
                  className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto min-h-0 p-6">
              <form id="team-form" onSubmit={handleCreate} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#374151] mb-1.5 uppercase tracking-wide">{t('team_name_req')}</label>
                    <input required value={form.name} onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))}
                      placeholder={t('team_name_ph')}
                      className="w-full h-10 px-3 border border-[#E5E7EB] rounded-lg text-sm text-[#1F2937] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#0059A0] focus:ring-2 focus:ring-[#0059A0]/10 transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#374151] mb-1.5 uppercase tracking-wide">{t('team_code_req')}</label>
                    <input required value={form.code} onChange={(e) => setForm(p => ({ ...p, code: e.target.value.toUpperCase() }))}
                      placeholder={t('team_code_ph')}
                      className="w-full h-10 px-3 border border-[#E5E7EB] rounded-lg text-sm text-[#1F2937] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#0059A0] focus:ring-2 focus:ring-[#0059A0]/10 transition-all" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#374151] mb-1.5 uppercase tracking-wide">{t('team_operation')}</label>
                  <input value={form.operation} onChange={(e) => setForm(p => ({ ...p, operation: e.target.value }))}
                    placeholder={t('team_operation_ph')}
                    className="w-full h-10 px-3 border border-[#E5E7EB] rounded-lg text-sm text-[#1F2937] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#0059A0] focus:ring-2 focus:ring-[#0059A0]/10 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#374151] mb-1.5 uppercase tracking-wide">{t('team_supervisor')}</label>
                  <select value={form.supervisorId} onChange={(e) => setForm(p => ({ ...p, supervisorId: e.target.value }))}
                    className="w-full h-10 px-3 border border-[#E5E7EB] rounded-lg text-sm text-[#1F2937] focus:outline-none focus:border-[#0059A0] focus:ring-2 focus:ring-[#0059A0]/10 transition-all bg-white">
                    <option value="">{t('team_supervisor_ph')}</option>
                    {supervisors.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#374151] mb-1.5 uppercase tracking-wide">{t('team_description')}</label>
                  <textarea value={form.description} onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))}
                    rows={3} placeholder={t('team_description_ph')}
                    className="w-full px-3 py-2.5 border border-[#E5E7EB] rounded-lg text-sm text-[#1F2937] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#0059A0] focus:ring-2 focus:ring-[#0059A0]/10 transition-all resize-none" />
                </div>
              </form>
            </div>

            {/* Footer */}
            <div className="shrink-0 p-6 pt-0 flex gap-3">
              <button type="button" onClick={() => setCreateOpen(false)}
                className="flex-1 h-10 border border-[#E5E7EB] text-sm text-[#6B7280] rounded-xl hover:bg-[#F5F8FB] transition-colors font-medium">
                {t('action_cancel')}
              </button>
              <button type="submit" form="team-form" disabled={saving}
                className="flex-1 h-10 bg-[#0059A0] text-white text-sm font-semibold rounded-xl hover:bg-[#1F4E87] disabled:opacity-60 transition-colors shadow-sm">
                {saving ? t('action_creating') : t('action_create_team')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
