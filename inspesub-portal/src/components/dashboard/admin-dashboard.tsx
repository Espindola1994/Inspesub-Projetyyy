"use client"

import Link from "next/link"
import { formatDateTime } from "@/lib/utils"
import type { AdminDashboardData } from "@/types"
import { useLanguage } from "@/components/providers/language-provider"
import {
  Users,
  ClipboardList,
  UserCheck,
  AlertTriangle,
  Activity,
  ArrowRight,
  TrendingUp,
  FileText,
  Bell,
  Building,
} from "lucide-react"

interface AdminDashboardProps {
  data: AdminDashboardData
}

export function AdminDashboard({ data }: AdminDashboardProps) {
  const { t } = useLanguage()
  const now = new Date()

  const AUDIT_ACTION_LABELS: Record<string, string> = {
    account_created: t('audit_account_created'),
    account_approved: t('audit_account_approved'),
    account_rejected: t('audit_account_rejected'),
    login: t('audit_login'),
    upload: t('audit_upload'),
    download: t('audit_download'),
    attendance_marked: t('audit_attendance'),
    rdo_submitted: t('audit_rdo_sent'),
    rdo_approved: t('audit_rdo_approved'),
    document_uploaded: t('audit_document_sent'),
    announcement_created: t('audit_announcement'),
  }

  const METRICS = [
    {
      label: t('dash_total_employees'),
      value: data.totalEmployees,
      icon: Users,
      color: "bg-blue-50 text-[#0059A0]",
      href: "/usuarios",
      trend: "+2 este mês",
    },
    {
      label: t('dash_pending_approvals'),
      value: data.pendingApprovals,
      icon: UserCheck,
      color: data.pendingApprovals > 0 ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600",
      href: "/usuarios?filter=pending",
      alert: data.pendingApprovals > 0,
    },
    {
      label: t('dash_active_teams'),
      value: data.activeTeams,
      icon: Building,
      color: "bg-purple-50 text-purple-600",
      href: "/equipes",
    },
    {
      label: t('dash_pending_rdos'),
      value: data.rdoPending,
      icon: ClipboardList,
      color: data.rdoPending > 0 ? "bg-orange-50 text-[#FF7A2F]" : "bg-emerald-50 text-emerald-600",
      href: "/rdo?filter=pending",
    },
    {
      label: t('dash_expiring_docs'),
      value: data.expiringDocuments,
      icon: AlertTriangle,
      color: data.expiringDocuments > 0 ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600",
      href: "/documentos?filter=expiring",
    },
    {
      label: t('dash_payslips_month'),
      value: data.payslipsThisMonth,
      icon: FileText,
      color: "bg-teal-50 text-teal-600",
      href: "/contracheques",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1F2937] tracking-tight">{t('dash_admin_title')}</h1>
          <p className="text-sm text-[#6B7280] mt-0.5">
            {new Intl.DateTimeFormat("pt-BR", {
              weekday: "long",
              day: "2-digit",
              month: "long",
              year: "numeric",
            }).format(now)}
          </p>
        </div>
        <Link
          href="/usuarios?filter=pending"
          className="flex items-center gap-2 px-4 py-2 bg-[#0059A0] text-white text-sm font-medium rounded-xl hover:bg-[#1F4E87] transition-colors"
        >
          <UserCheck className="w-4 h-4" />
          {t('dash_approve_accounts')}
          {data.pendingApprovals > 0 && (
            <span className="ml-1 px-1.5 py-0.5 bg-[#FF7A2F] text-white text-[10px] font-bold rounded-full">
              {data.pendingApprovals}
            </span>
          )}
        </Link>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {METRICS.map((metric) => {
          const Icon = metric.icon
          return (
            <Link
              key={metric.label}
              href={metric.href}
              className="bg-white rounded-xl p-5 border border-[#E5E7EB] hover:shadow-md hover:-translate-y-0.5 transition-all group relative overflow-hidden"
            >
              {metric.alert && (
                <div className="absolute top-0 right-0 w-16 h-16 bg-amber-400/10 rounded-full -mr-6 -mt-6" />
              )}
              <div className={`w-12 h-12 rounded-xl ${metric.color} flex items-center justify-center mb-4`}>
                <Icon className="w-6 h-6" />
              </div>
              <p className="text-3xl font-bold text-[#1F2937]">{metric.value}</p>
              <p className="text-sm font-medium text-[#6B7280] mt-1 leading-tight">{metric.label}</p>
              {metric.trend && (
                <p className="text-xs text-emerald-600 mt-1.5 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  {metric.trend}
                </p>
              )}
            </Link>
          )
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent audit logs */}
        <div className="bg-white rounded-xl border border-[#E5E7EB]">
          <div className="flex items-center justify-between p-5 border-b border-[#F3F4F6]">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#0059A0]" />
              <h2 className="text-sm font-semibold text-[#1F2937]">{t('dash_recent_activity')}</h2>
            </div>
            <Link href="/auditoria" className="text-xs text-[#0059A0] hover:underline flex items-center gap-1">
              {t('action_see_logs')}
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-[#F3F4F6]">
            {data.recentAuditLogs.length === 0 ? (
              <p className="p-5 text-sm text-[#6B7280]">{t('empty_activity')}</p>
            ) : (
              data.recentAuditLogs.slice(0, 5).map((log) => (
                <div key={log.id} className="px-5 py-3 flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-[#F5F8FB] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Activity className="w-3.5 h-3.5 text-[#6B7280]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#1F2937]">
                      {AUDIT_ACTION_LABELS[log.action] ?? log.action}
                    </p>
                    <p className="text-sm text-[#6B7280] truncate">{log.description}</p>
                    <p className="text-xs text-[#9CA3AF] mt-0.5">
                      {formatDateTime(log.createdAt)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Announcements */}
        <div className="bg-white rounded-xl border border-[#E5E7EB]">
          <div className="flex items-center justify-between p-5 border-b border-[#F3F4F6]">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-[#0059A0]" />
              <h2 className="text-sm font-semibold text-[#1F2937]">{t('nav_announcements')}</h2>
            </div>
            <Link href="/comunicados" className="text-xs text-[#0059A0] hover:underline flex items-center gap-1">
              Gerenciar
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-[#F3F4F6]">
            {data.announcements.length === 0 ? (
              <p className="p-5 text-sm text-[#6B7280]">{t('empty_announcements')}</p>
            ) : (
              data.announcements.map((ann) => (
                <div key={ann.id} className="p-5">
                  <p className="text-base font-medium text-[#1F2937]">{ann.title}</p>
                  <p className="text-sm text-[#6B7280] mt-1 line-clamp-2">{ann.content}</p>
                  <p className="text-xs text-[#9CA3AF] mt-1.5">{formatDateTime(ann.createdAt)}</p>
                </div>
              ))
            )}
          </div>
          <div className="p-4 border-t border-[#F3F4F6]">
            <Link
              href="/comunicados/novo"
              className="block w-full text-center py-2 text-sm text-[#0059A0] border border-[#0059A0] rounded-lg hover:bg-blue-50 transition-colors"
            >
              + {t('action_new_announcement')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
