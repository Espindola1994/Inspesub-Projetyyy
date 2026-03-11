"use client"

import Link from "next/link"
import { formatDate, getMonthName, MONTH_NAMES } from "@/lib/utils"
import type { EmployeeProfile, Team, Payslip, Announcement } from "@prisma/client"
import { useLanguage } from "@/components/providers/language-provider"
import {
  CalendarDays,
  FileText,
  Bell,
  Megaphone,
  ArrowRight,
  Users,
  CheckCircle2,
  Coffee,
  Anchor,
  BookOpen,
  Clock,
} from "lucide-react"

interface MemberDashboardProps {
  user: { id: string; name: string; email: string; role: string }
  profile: EmployeeProfile | null
  team: Team | null
  attendanceSummary: {
    worked: number
    dayOff: number
    embarked: number
    vacation: number
    notInformed: number
    total: number
  }
  latestPayslip: Payslip | null
  unreadNotifications: number
  announcements: (Announcement & { author: { name: string } })[]
}

const now = new Date()

export function MemberDashboard({
  user,
  profile,
  team,
  attendanceSummary,
  latestPayslip,
  unreadNotifications,
  announcements,
}: MemberDashboardProps) {
  const { t } = useLanguage()
  const currentMonthName = MONTH_NAMES[now.getMonth()]

  const QUICK_LINKS = [
    { label: t('dash_mark_attendance'), href: "/presenca", icon: CalendarDays, color: "text-[#0059A0] bg-blue-50" },
    { label: t('nav_payslips'), href: "/contracheques", icon: FileText, color: "text-emerald-600 bg-emerald-50" },
    { label: t('nav_notifications'), href: "/notificacoes", icon: Bell, color: "text-amber-600 bg-amber-50", badge: unreadNotifications },
    { label: t('nav_announcements'), href: "/comunicados", icon: Megaphone, color: "text-purple-600 bg-purple-50" },
  ]

  const ATTENDANCE_ITEMS = [
    { label: t('att_sum_worked'), value: attendanceSummary.worked, icon: CheckCircle2, color: "text-emerald-600" },
    { label: t('att_sum_day_off'), value: attendanceSummary.dayOff, icon: Coffee, color: "text-[#6B7280]" },
    { label: t('att_sum_embarked'), value: attendanceSummary.embarked, icon: Anchor, color: "text-[#0059A0]" },
    { label: t('att_sum_vacation'), value: attendanceSummary.vacation, icon: BookOpen, color: "text-pink-500" },
    { label: t('att_sum_not_informed'), value: attendanceSummary.notInformed, icon: Clock, color: "text-amber-500" },
  ]

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1F2937] tracking-tight">
            {t('dash_hi')}, {user.name.split(" ")[0]}!
          </h1>
          <p className="text-sm text-[#6B7280] mt-0.5">
            {new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" }).format(now)}
          </p>
        </div>
        {profile?.position && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-full text-xs font-medium text-[#0059A0]">
            {profile.position}
          </div>
        )}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {QUICK_LINKS.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className="bg-white rounded-xl p-5 border border-[#E5E7EB] hover:shadow-md hover:-translate-y-0.5 transition-all group"
            >
              <div className={`w-10 h-10 rounded-xl ${item.color} flex items-center justify-center mb-3 relative`}>
                <Icon className="w-5 h-5" />
                {item.badge ? (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#FF7A2F] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {item.badge}
                  </span>
                ) : null}
              </div>
              <p className="text-sm font-semibold text-[#1F2937] group-hover:text-[#0059A0] transition-colors">
                {item.label}
              </p>
            </Link>
          )
        })}
      </div>

      {/* Main content grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Presença do mês */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-[#E5E7EB] p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-semibold text-[#1F2937]">{t('att_attendance_label')} {currentMonthName}</h2>
              <p className="text-xs text-[#6B7280] mt-0.5">{now.getFullYear()}</p>
            </div>
            <Link
              href="/presenca"
              className="text-xs text-[#0059A0] hover:underline flex items-center gap-1"
            >
              {t('action_see_calendar')}
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid grid-cols-5 gap-3">
            {ATTENDANCE_ITEMS.map((item) => {
              const Icon = item.icon
              return (
                <div key={item.label} className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Icon className={`w-5 h-5 ${item.color}`} />
                  </div>
                  <p className="text-2xl font-bold text-[#1F2937]">{item.value}</p>
                  <p className="text-xs text-[#6B7280] mt-0.5">{item.label}</p>
                </div>
              )
            })}
          </div>

          {/* Progress bar */}
          <div className="mt-5 pt-5 border-t border-[#F3F4F6]">
            <div className="flex items-center justify-between text-xs text-[#6B7280] mb-2">
              <span>{t('dash_progress_month')}</span>
              <span>{attendanceSummary.total} {t('dash_days_registered')}</span>
            </div>
            <div className="h-2 bg-[#F3F4F6] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#0059A0] to-[#0B7FC1] rounded-full transition-all"
                style={{ width: `${Math.min(100, (attendanceSummary.total / 22) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Sidebar info */}
        <div className="space-y-4">
          {/* Team */}
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-4 h-4 text-[#0059A0]" />
              <h3 className="text-sm font-semibold text-[#1F2937]">{t('dash_my_team')}</h3>
            </div>
            {team ? (
              <div>
                <p className="text-base font-bold text-[#0059A0]">{team.name}</p>
                {team.operation && (
                  <p className="text-xs text-[#6B7280] mt-1">{team.operation}</p>
                )}
              </div>
            ) : (
              <p className="text-sm text-[#6B7280]">{t('dash_no_team')}</p>
            )}
          </div>

          {/* Latest payslip */}
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-semibold text-[#1F2937]">{t('dash_last_payslip')}</h3>
            </div>
            {latestPayslip ? (
              <div>
                <p className="text-base font-bold text-[#1F2937]">
                  {getMonthName(latestPayslip.month)} / {latestPayslip.year}
                </p>
                <Link
                  href="/contracheques"
                  className="mt-2 inline-flex items-center gap-1 text-xs text-[#0059A0] hover:underline"
                >
                  {t('action_view')}
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            ) : (
              <p className="text-sm text-[#6B7280]">{t('dash_no_payslip')}</p>
            )}
          </div>
        </div>
      </div>

      {/* Announcements */}
      {announcements.length > 0 && (
        <div className="bg-white rounded-xl border border-[#E5E7EB]">
          <div className="flex items-center justify-between p-5 border-b border-[#F3F4F6]">
            <div className="flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-[#0059A0]" />
              <h2 className="text-sm font-semibold text-[#1F2937]">{t('dash_recent_announcements')}</h2>
            </div>
            <Link href="/comunicados" className="text-xs text-[#0059A0] hover:underline flex items-center gap-1">
              {t('action_see_all')}
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-[#F3F4F6]">
            {announcements.map((ann) => (
              <div key={ann.id} className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#1F2937] truncate">{ann.title}</p>
                    <p className="text-xs text-[#6B7280] mt-0.5 line-clamp-2">{ann.content}</p>
                  </div>
                  <span className="text-xs text-[#9CA3AF] flex-shrink-0">
                    {formatDate(ann.createdAt)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
