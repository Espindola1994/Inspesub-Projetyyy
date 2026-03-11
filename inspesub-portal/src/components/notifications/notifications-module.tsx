"use client"

import { useRouter } from "next/navigation"
import { formatDateTime } from "@/lib/utils"
import { Bell, FileText, CalendarDays, UserCheck, ClipboardList, AlertTriangle, Megaphone, Check, CheckCheck } from "lucide-react"
import { cn } from "@/lib/utils"
import type { NotificationType } from "@prisma/client"
import Link from "next/link"
import { useLanguage } from "@/components/providers/language-provider"

type Notification = {
  id: string
  type: NotificationType
  title: string
  message: string
  link: string | null
  isRead: boolean
  createdAt: string
}

const TYPE_CONFIG: Record<NotificationType, { icon: React.ElementType; color: string }> = {
  new_payslip: { icon: FileText, color: "text-emerald-600 bg-emerald-50" },
  pending_attendance: { icon: CalendarDays, color: "text-amber-600 bg-amber-50" },
  account_approved: { icon: UserCheck, color: "text-[#0059A0] bg-blue-50" },
  account_rejected: { icon: UserCheck, color: "text-red-600 bg-red-50" },
  pending_rdo: { icon: ClipboardList, color: "text-[#FF7A2F] bg-orange-50" },
  document_expiring: { icon: AlertTriangle, color: "text-red-600 bg-red-50" },
  new_announcement: { icon: Megaphone, color: "text-purple-600 bg-purple-50" },
  team_change: { icon: Bell, color: "text-indigo-600 bg-indigo-50" },
  general: { icon: Bell, color: "text-[#6B7280] bg-[#F5F8FB]" },
}

interface NotificationsModuleProps {
  notifications: Notification[]
}

export function NotificationsModule({ notifications }: NotificationsModuleProps) {
  const router = useRouter()
  const { t } = useLanguage()

  const unreadCount = notifications.filter((n) => !n.isRead).length

  async function markAllRead() {
    await fetch("/api/notifications/read-all", { method: "POST" })
    router.refresh()
  }

  async function markRead(id: string) {
    await fetch(`/api/notifications/${id}/read`, { method: "POST" })
    router.refresh()
  }

  return (
    <div className="space-y-4">
      {unreadCount > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-[#6B7280]">
            <strong className="text-[#1F2937]">{unreadCount}</strong> {t('notif_unread')}
          </p>
          <button onClick={markAllRead}
            className="flex items-center gap-1.5 text-xs text-[#0059A0] hover:underline">
            <CheckCheck className="w-3.5 h-3.5" />
            {t('action_mark_all_read')}
          </button>
        </div>
      )}

      <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
        {notifications.length === 0 ? (
          <div className="p-12 text-center">
            <Bell className="w-10 h-10 text-[#D1D5DB] mx-auto mb-3" />
            <p className="text-[#6B7280]">{t('empty_notifications')}</p>
          </div>
        ) : (
          <div className="divide-y divide-[#F3F4F6]">
            {notifications.map((notif) => {
              const config = TYPE_CONFIG[notif.type]
              const Icon = config.icon

              const content = (
                <div
                  className={cn(
                    "flex items-start gap-4 px-5 py-4 transition-colors",
                    !notif.isRead ? "bg-[#F0F7FF]" : "hover:bg-[#F9FAFB]",
                    notif.link && "cursor-pointer"
                  )}
                  onClick={() => !notif.isRead && markRead(notif.id)}
                >
                  <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5", config.color)}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={cn("text-sm", !notif.isRead ? "font-semibold text-[#1F2937]" : "font-medium text-[#1F2937]")}>
                        {notif.title}
                      </p>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {!notif.isRead && (
                          <div className="w-2 h-2 rounded-full bg-[#0059A0]" />
                        )}
                        <span className="text-xs text-[#9CA3AF]">{formatDateTime(notif.createdAt)}</span>
                      </div>
                    </div>
                    <p className="text-xs text-[#6B7280] mt-0.5">{notif.message}</p>
                  </div>
                  {!notif.isRead && (
                    <button
                      onClick={(e) => { e.stopPropagation(); markRead(notif.id) }}
                      className="w-6 h-6 rounded-lg flex items-center justify-center text-[#9CA3AF] hover:bg-[#F5F8FB] hover:text-[#0059A0] transition-colors flex-shrink-0"
                      title={t('action_mark_read')}
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              )

              return notif.link ? (
                <Link key={notif.id} href={notif.link}>{content}</Link>
              ) : (
                <div key={notif.id}>{content}</div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
