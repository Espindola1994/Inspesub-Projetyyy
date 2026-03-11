"use client"

import { useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { formatDate, getInitials } from "@/lib/utils"
import { ROLE_LABELS } from "@/lib/permissions"
import { Users, UserCheck, UserX, Search, Filter, CheckCircle, XCircle, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { UserRole, AccountStatus } from "@prisma/client"
import Link from "next/link"
import { useLanguage } from "@/components/providers/language-provider"

type UserWithDetails = {
  id: string
  name: string
  email: string
  role: UserRole
  status: AccountStatus
  createdAt: string
  profile: { position: string | null; registration: string | null } | null
  teamMemberships: { team: { id: string; name: string; code: string } }[]
  approvals: { status: AccountStatus; requestedAt: string }[]
}

interface UsersModuleProps {
  users: UserWithDetails[]
  isAdmin: boolean
  currentFilter?: string
}

const STATUS_COLORS: Record<AccountStatus, string> = {
  active: "bg-emerald-50 text-emerald-700",
  pending: "bg-amber-50 text-amber-700",
  inactive: "bg-gray-50 text-[#6B7280]",
  rejected: "bg-red-50 text-red-700",
  suspended: "bg-orange-50 text-orange-700",
}

export function UsersModule({ users, isAdmin, currentFilter }: UsersModuleProps) {
  const router = useRouter()
  const { t } = useLanguage()
  const [search, setSearch] = useState("")
  const [filterStatus, setFilterStatus] = useState<AccountStatus | "">(
    (currentFilter as AccountStatus) ?? ""
  )
  const [processingId, setProcessingId] = useState<string | null>(null)

  const STATUS_CONFIG: Record<AccountStatus, { label: string; color: string }> = {
    active: { label: t('status_active'), color: STATUS_COLORS.active },
    pending: { label: t('status_pending'), color: STATUS_COLORS.pending },
    inactive: { label: t('status_inactive'), color: STATUS_COLORS.inactive },
    rejected: { label: t('status_rejected'), color: STATUS_COLORS.rejected },
    suspended: { label: t('status_suspended'), color: STATUS_COLORS.suspended },
  }

  const filtered = users.filter((u) => {
    if (search && !u.name.toLowerCase().includes(search.toLowerCase()) &&
        !u.email.toLowerCase().includes(search.toLowerCase())) return false
    if (filterStatus && u.status !== filterStatus) return false
    return true
  })

  const pendingCount = users.filter((u) => u.status === "pending").length

  const statusCounts = {
    "": users.length,
    active: users.filter((u) => u.status === "active").length,
    pending: users.filter((u) => u.status === "pending").length,
    suspended: users.filter((u) => u.status === "suspended").length,
    inactive: users.filter((u) => u.status === "inactive").length,
    rejected: users.filter((u) => u.status === "rejected").length,
  }

  const STATUS_SUMMARY = [
    { key: "",          label: "Total",                  value: statusCounts[""],        color: "text-[#0059A0]",    bg: "bg-blue-50 border-blue-200",     dot: "bg-[#0059A0]" },
    { key: "active",    label: t('status_active'),       value: statusCounts.active,     color: "text-emerald-700",  bg: "bg-emerald-50 border-emerald-200", dot: "bg-emerald-500" },
    { key: "pending",   label: t('status_pending'),      value: statusCounts.pending,    color: "text-amber-700",    bg: "bg-amber-50 border-amber-200",   dot: "bg-amber-500" },
    { key: "suspended", label: t('status_suspended'),    value: statusCounts.suspended,  color: "text-orange-700",   bg: "bg-orange-50 border-orange-200", dot: "bg-orange-500" },
    { key: "inactive",  label: t('status_inactive'),     value: statusCounts.inactive,   color: "text-[#6B7280]",    bg: "bg-gray-50 border-gray-200",     dot: "bg-gray-400" },
    { key: "rejected",  label: t('status_rejected'),     value: statusCounts.rejected,   color: "text-red-700",      bg: "bg-red-50 border-red-200",       dot: "bg-red-500" },
  ]

  async function handleApprove(userId: string) {
    setProcessingId(userId)
    try {
      const res = await fetch(`/api/users/${userId}/approve`, { method: "POST" })
      if (res.ok) router.refresh()
    } finally {
      setProcessingId(null)
    }
  }

  async function handleReject(userId: string) {
    const notes = prompt("Motivo da rejeição (opcional):")
    if (notes === null) return
    setProcessingId(userId)
    try {
      const res = await fetch(`/api/users/${userId}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
      })
      if (res.ok) router.refresh()
    } finally {
      setProcessingId(null)
    }
  }

  async function handleChangeRole(userId: string, role: UserRole) {
    if (!isAdmin) return
    await fetch(`/api/users/${userId}/role`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    })
    router.refresh()
  }

  async function handleDelete(userId: string) {
    if (!isAdmin) return
    if (!confirm("Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.")) return
    
    setProcessingId(userId)
    try {
      const res = await fetch(`/api/users/${userId}`, { method: "DELETE" })
      if (!res.ok) {
        const error = await res.json()
        alert(error.error || "Erro ao excluir usuário")
        return
      }
      router.refresh()
    } catch (error) {
      alert("Erro ao excluir usuário")
    } finally {
      setProcessingId(null)
    }
  }

  return (
    <div className="space-y-4">
      {/* Status summary cards */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {STATUS_SUMMARY.map(({ key, label, value, color, bg, dot }) => (
          <button
            key={key}
            onClick={() => setFilterStatus(key as AccountStatus | "")}
            className={cn(
              "rounded-xl border p-3 text-left transition-all hover:shadow-sm",
              filterStatus === key ? `${bg} ring-2 ring-offset-1 ring-current` : "bg-white border-[#E5E7EB] hover:border-[#CBD5E1]",
              color
            )}
          >
            <div className="flex items-center gap-2 mb-1">
              <div className={cn("w-2 h-2 rounded-full flex-shrink-0", dot)} />
              <p className="text-[11px] font-medium text-[#6B7280]">{label}</p>
            </div>
            <p className={cn("text-2xl font-bold", color)}>{value}</p>
          </button>
        ))}
      </div>

      {/* Pending alert */}
      {pendingCount > 0 && (
        <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <UserCheck className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <p className="text-sm text-amber-800">
            <strong>{pendingCount} {t('users_pending_banner')}</strong>
          </p>
          <button
            onClick={() => setFilterStatus("pending")}
            className="ml-auto text-xs text-amber-700 underline"
          >
            {t('action_see_pending')}
          </button>
        </div>
      )}

      {/* Toolbar */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] p-4 flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9CA3AF]" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder={t('users_search')}
            className="w-full h-9 pl-9 pr-3 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:border-[#0059A0] text-[#1F2937]" />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-[#6B7280]" />
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as AccountStatus | "")}
            className="h-9 px-2 border border-[#E5E7EB] rounded-lg text-sm text-[#1F2937] focus:outline-none focus:border-[#0059A0]">
            <option value="">{t('status_all')}</option>
            {Object.entries(STATUS_CONFIG).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
        </div>
        <p className="ml-auto text-xs text-[#6B7280]">{filtered.length} {t('users_count')}</p>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
              <th className="text-left px-5 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wide">{t('col_employee')}</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wide">{t('col_role')}</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wide">{t('col_team')}</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wide">{t('col_status')}</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wide">{t('col_registration')}</th>
              <th className="px-5 py-3 text-right text-xs font-semibold text-[#6B7280] uppercase tracking-wide">{t('col_actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F3F4F6]">
            {filtered.length === 0 ? (
              <tr><td colSpan={6} className="px-5 py-10 text-center text-sm text-[#6B7280]">
                <Users className="w-10 h-10 text-[#D1D5DB] mx-auto mb-2" />
                {t('empty_users')}
              </td></tr>
            ) : filtered.map((user) => {
              const statusConfig = STATUS_CONFIG[user.status]
              const isProcessing = processingId === user.id

              return (
                <tr key={user.id} className="hover:bg-[#F8FAFC] transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#0059A0] flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                        {getInitials(user.name)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#1F2937]">{user.name}</p>
                        <p className="text-xs text-[#6B7280]">{user.email}</p>
                        {user.profile?.position && (
                          <p className="text-xs text-[#9CA3AF]">{user.profile.position}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    {isAdmin ? (
                      <select
                        value={user.role}
                        onChange={(e) => handleChangeRole(user.id, e.target.value as UserRole)}
                        className="h-7 px-2 border border-[#E5E7EB] rounded-lg text-xs text-[#1F2937] focus:outline-none focus:border-[#0059A0]"
                      >
                        {Object.entries(ROLE_LABELS).map(([k, v]) => (
                          <option key={k} value={k}>{v}</option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-sm text-[#6B7280]">{ROLE_LABELS[user.role]}</span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    {user.teamMemberships.length > 0 ? (
                      <span className="text-xs px-2 py-0.5 bg-blue-50 text-[#0059A0] rounded-full font-medium">
                        {user.teamMemberships[0].team.code}
                      </span>
                    ) : (
                      <span className="text-xs text-[#9CA3AF]">{t('users_no_team')}</span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", statusConfig.color)}>
                      {statusConfig.label}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-xs text-[#6B7280]">
                    {formatDate(user.createdAt)}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap items-center gap-2 justify-end">
                      {user.status === "pending" && (
                        <>
                          <button
                            onClick={() => handleApprove(user.id)}
                            disabled={isProcessing}
                            className="flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs rounded-lg hover:bg-emerald-100 transition-colors disabled:opacity-50"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            {t('action_approve')}
                          </button>
                          <button
                            onClick={() => handleReject(user.id)}
                            disabled={isProcessing}
                            className="flex items-center gap-1 px-2.5 py-1 bg-red-50 text-red-700 border border-red-200 text-xs rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            {t('action_reject')}
                          </button>
                        </>
                      )}
                      
                      {isAdmin && (
                        <button
                          onClick={() => handleDelete(user.id)}
                          disabled={isProcessing}
                          title="Excluir usuário"
                          className="flex items-center gap-1 px-2.5 py-1 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700 transition-colors shadow-sm ml-2"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          EXCLUIR
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
