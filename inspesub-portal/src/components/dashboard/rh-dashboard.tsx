"use client"

import Link from "next/link"
import { Users, UserCheck, Building, FileText, ArrowRight, CalendarDays } from "lucide-react"
import { useLanguage } from "@/components/providers/language-provider"

interface RhDashboardProps {
  data: {
    totalEmployees: number
    pendingApprovals: number
    totalTeams: number
  }
}

export function RhDashboard({ data }: RhDashboardProps) {
  const { t } = useLanguage()

  const ACTIONS = [
    {
      label: t('dash_approve_accounts'),
      description: `${data.pendingApprovals} ${t('dash_pending_label')}`,
      href: "/usuarios?filter=pending",
      icon: UserCheck,
      color: "bg-amber-50 text-amber-600",
      urgent: data.pendingApprovals > 0,
    },
    {
      label: t('dash_send_payslip'),
      description: t('dash_upload_label'),
      href: "/contracheques/upload",
      icon: FileText,
      color: "bg-blue-50 text-[#0059A0]",
    },
    {
      label: t('dash_team_management'),
      description: `${data.totalTeams} ${t('dash_active_teams_label')}`,
      href: "/equipes",
      icon: Building,
      color: "bg-purple-50 text-purple-600",
    },
    {
      label: t('dash_attendance_report'),
      description: t('dash_export_monthly'),
      href: "/relatorios/presenca",
      icon: CalendarDays,
      color: "bg-emerald-50 text-emerald-600",
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1F2937]">{t('dash_rh_title')}</h1>
        <p className="text-sm text-[#6B7280] mt-0.5">{t('dash_rh_subtitle')}</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: t('dash_total_employees'), value: data.totalEmployees, icon: Users },
          { label: t('dash_pending_approvals'), value: data.pendingApprovals, icon: UserCheck, alert: data.pendingApprovals > 0 },
          { label: t('dash_active_teams'), value: data.totalTeams, icon: Building },
        ].map((metric) => {
          const Icon = metric.icon
          return (
            <div key={metric.label} className="bg-white rounded-xl p-5 border border-[#E5E7EB]">
              <div className={`w-10 h-10 rounded-xl ${metric.alert ? "bg-amber-50" : "bg-blue-50"} flex items-center justify-center mb-3`}>
                <Icon className={`w-5 h-5 ${metric.alert ? "text-amber-600" : "text-[#0059A0]"}`} />
              </div>
              <p className="text-2xl font-bold text-[#1F2937]">{metric.value}</p>
              <p className="text-xs text-[#6B7280] mt-0.5">{metric.label}</p>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {ACTIONS.map((action) => {
          const Icon = action.icon
          return (
            <Link
              key={action.label}
              href={action.href}
              className="bg-white rounded-xl p-6 border border-[#E5E7EB] hover:shadow-md hover:-translate-y-0.5 transition-all group"
            >
              <div className={`w-10 h-10 rounded-xl ${action.color} flex items-center justify-center mb-4`}>
                <Icon className="w-5 h-5" />
              </div>
              <p className="text-sm font-semibold text-[#1F2937] group-hover:text-[#0059A0] transition-colors">
                {action.label}
              </p>
              <p className="text-xs text-[#6B7280] mt-1">{action.description}</p>
              <div className="flex items-center gap-1 mt-3 text-xs text-[#0059A0]">
                {t('action_access')}
                <ArrowRight className="w-3 h-3" />
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
