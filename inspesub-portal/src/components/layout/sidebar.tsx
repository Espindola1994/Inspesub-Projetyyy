"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import { cn } from "@/lib/utils"
import { ROLE_LABELS } from "@/lib/permissions"
import { useAvatar } from "@/components/providers/avatar-provider"
import { useLanguage } from "@/components/providers/language-provider"
import type { UserRole } from "@prisma/client"
import {
  LayoutDashboard,
  CalendarDays,
  FileText,
  Users,
  UserCog,
  ClipboardList,
  FolderOpen,
  Megaphone,
  Bell,
  BarChart3,
  Settings,
  ShieldCheck,
  UserCircle,
  Building2,
  ChevronRight,
} from "lucide-react"

type NavItem = {
  labelKey: string
  href: string
  icon: React.ElementType
  roles: UserRole[]
  badge?: string | number
}

const NAV_ITEMS: NavItem[] = [
  {
    labelKey: "nav_dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["admin_master", "rh", "supervisor", "member"],
  },
  {
    labelKey: "nav_attendance",
    href: "/presenca",
    icon: CalendarDays,
    roles: ["admin_master", "rh", "supervisor", "member"],
  },
  {
    labelKey: "nav_payslips",
    href: "/contracheques",
    icon: FileText,
    roles: ["admin_master", "rh", "supervisor", "member"],
  },
  {
    labelKey: "nav_teams",
    href: "/equipes",
    icon: Users,
    roles: ["admin_master", "rh", "supervisor", "member"],
  },
  {
    labelKey: "nav_rdo",
    href: "/rdo",
    icon: ClipboardList,
    roles: ["admin_master", "rh", "supervisor", "member"],
  },
  {
    labelKey: "nav_documents",
    href: "/documentos",
    icon: FolderOpen,
    roles: ["admin_master", "rh", "supervisor", "member"],
  },
  {
    labelKey: "nav_announcements",
    href: "/comunicados",
    icon: Megaphone,
    roles: ["admin_master", "rh", "supervisor", "member"],
  },
  {
    labelKey: "nav_notifications",
    href: "/notificacoes",
    icon: Bell,
    roles: ["admin_master", "rh", "supervisor", "member"],
  },
  {
    labelKey: "nav_reports",
    href: "/relatorios",
    icon: BarChart3,
    roles: ["admin_master", "rh", "supervisor"],
  },
  {
    labelKey: "nav_users",
    href: "/usuarios",
    icon: UserCog,
    roles: ["admin_master", "rh"],
  },
  {
    labelKey: "nav_audit",
    href: "/auditoria",
    icon: ShieldCheck,
    roles: ["admin_master"],
  },
  {
    labelKey: "nav_settings",
    href: "/configuracoes",
    icon: Settings,
    roles: ["admin_master"],
  },
]

interface SidebarProps {
  collapsed?: boolean
}

export function Sidebar({ collapsed = false }: SidebarProps) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const userRole = session?.user?.role as UserRole | undefined

  const { avatarUrl } = useAvatar()
  const { t } = useLanguage()
  const filteredNav = NAV_ITEMS.filter(
    (item) => userRole && item.roles.includes(userRole)
  )

  return (
    <aside
      className={cn(
        "flex flex-col h-full bg-white border-r border-[#E5E7EB] transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-[#E5E7EB]">
        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-[#0059A0] flex items-center justify-center">
          <Building2 className="w-4 h-4 text-white" />
        </div>
        {!collapsed && (
          <div>
            <p className="text-sm font-bold text-[#0059A0] leading-tight">INSPESUB</p>
            <p className="text-[10px] text-[#6B7280] leading-tight">{t('sidebar_subtitle')}</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {filteredNav.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
          const label = t(item.labelKey as any)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "sidebar-item group relative",
                isActive && "active",
                collapsed && "justify-center px-2"
              )}
              title={collapsed ? label : undefined}
            >
              <Icon
                className={cn(
                  "w-4 h-4 flex-shrink-0 transition-colors",
                  isActive ? "text-[#0059A0]" : "text-[#9CA3AF] group-hover:text-[#0059A0]"
                )}
              />
              {!collapsed && (
                <>
                  <span className="flex-1">{label}</span>
                  {item.badge && (
                    <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-[#FF7A2F] text-[10px] font-semibold text-white">
                      {item.badge}
                    </span>
                  )}
                  {isActive && (
                    <ChevronRight className="w-3 h-3 text-[#0059A0] ml-auto" />
                  )}
                </>
              )}

              {/* Active indicator */}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-[#0059A0] rounded-r-full" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* User info */}
      {!collapsed && session?.user && (
        <div className="border-t border-[#E5E7EB] p-4">
          <Link
            href="/perfil"
            className="flex items-center gap-3 rounded-lg p-2 hover:bg-[#F5F8FB] transition-colors group"
          >
            <div className="w-8 h-8 rounded-full bg-[#0059A0] flex items-center justify-center flex-shrink-0 overflow-hidden">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <UserCircle className="w-4 h-4 text-white" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-[#1F2937] truncate">
                {session.user.name}
              </p>
              <p className="text-[10px] text-[#6B7280] truncate">
                {userRole ? ROLE_LABELS[userRole] : ""}
              </p>
            </div>
          </Link>
        </div>
      )}
    </aside>
  )
}
