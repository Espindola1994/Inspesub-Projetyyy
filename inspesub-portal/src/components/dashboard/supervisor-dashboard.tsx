"use client"

import Link from "next/link"
import type { Team } from "@prisma/client"
import { ClipboardList, CalendarDays, Users, ArrowRight, FileText } from "lucide-react"
import { useLanguage } from "@/components/providers/language-provider"

interface SupervisorDashboardProps {
  team: Team | null
}

export function SupervisorDashboard({ team }: SupervisorDashboardProps) {
  const { t } = useLanguage()

  const ACTIONS = [
    { label: t('action_new_rdo'), href: "/rdo/novo", icon: ClipboardList, color: "bg-orange-50 text-[#FF7A2F]" },
    { label: t('nav_attendance'), href: "/presenca", icon: CalendarDays, color: "bg-blue-50 text-[#0059A0]" },
    { label: t('dash_team_members'), href: "/equipes", icon: Users, color: "bg-purple-50 text-purple-600" },
    { label: t('dash_rdo_report'), href: "/relatorios/rdo", icon: FileText, color: "bg-emerald-50 text-emerald-600" },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1F2937]">{t('dash_supervisor_title')}</h1>
        {team && <p className="text-sm text-[#6B7280] mt-0.5">{t('profile_team')}: <span className="font-medium text-[#0059A0]">{team.name}</span></p>}
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
              <div className="flex items-center gap-1 mt-3 text-xs text-[#0059A0]">
                {t('action_access')} <ArrowRight className="w-3 h-3" />
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
