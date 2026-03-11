"use client"

import { useSession, signOut } from "next-auth/react"
import { Bell, Search, Menu, LogOut, User, Settings, ChevronDown, Users, Megaphone, ClipboardList, FolderOpen, FileText, Globe } from "lucide-react"
import { useState, useRef, useEffect, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { useAvatar } from "@/components/providers/avatar-provider"
import { useLanguage } from "@/components/providers/language-provider"
import { useNotifications } from "@/components/providers/notification-provider"
import type { Locale } from "@/lib/i18n"

interface HeaderProps {
  onMenuToggle?: () => void
  pageTitle?: string
}

type SearchResult = { type: string; label: string; description: string; href: string }

export function Header({ onMenuToggle, pageTitle }: HeaderProps) {
  const { data: session } = useSession()
  const { avatarUrl } = useAvatar()
  const { t, locale, setLocale } = useLanguage()
  const { unreadCount } = useNotifications()
  const router = useRouter()
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [langMenuOpen, setLangMenuOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const langRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Map search result types to translated labels dynamically
  const TYPE_ICON: Record<string, React.ElementType> = {
    [t("search_type_user")]: Users,
    [t("search_type_team")]: Users,
    [t("search_type_announcement")]: Megaphone,
    [t("search_type_document")]: FolderOpen,
    [t("search_type_rdo")]: ClipboardList,
    // fallback for API-returned PT-BR keys regardless of locale
    "Usuário": Users, "User": Users,
    "Equipe": Users, "Team": Users,
    "Comunicado": Megaphone, "Announcement": Megaphone,
    "Documento": FolderOpen, "Document": FolderOpen,
    "RDO": ClipboardList, "DWR": ClipboardList,
  }
  const TYPE_COLOR: Record<string, string> = {
    "Usuário": "text-[#0059A0] bg-blue-50", "User": "text-[#0059A0] bg-blue-50",
    "Equipe": "text-purple-700 bg-purple-50", "Team": "text-purple-700 bg-purple-50",
    "Comunicado": "text-amber-700 bg-amber-50", "Announcement": "text-amber-700 bg-amber-50",
    "Documento": "text-emerald-700 bg-emerald-50", "Document": "text-emerald-700 bg-emerald-50",
    "RDO": "text-orange-700 bg-orange-50", "DWR": "text-orange-700 bg-orange-50",
  }

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setSearchOpen(false)
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangMenuOpen(false)
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  const search = useCallback(async (q: string) => {
    if (q.length < 2) { setResults([]); setSearchOpen(false); return }
    setSearching(true)
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`)
      const json = await res.json()
      setResults(json.results ?? [])
      setSearchOpen(true)
    } finally {
      setSearching(false)
    }
  }, [])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value
    setQuery(v)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => search(v), 300)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") { setSearchOpen(false); setQuery("") }
  }

  function handleResultClick(href: string) {
    setSearchOpen(false); setQuery(""); router.push(href)
  }

  const grouped = results.reduce<Record<string, SearchResult[]>>((acc, r) => {
    if (!acc[r.type]) acc[r.type] = []
    acc[r.type].push(r)
    return acc
  }, {})

  const LOCALES: { value: Locale; flag: string; label: string }[] = [
    { value: "pt-BR", flag: "🇧🇷", label: "Português (BR)" },
    { value: "en",    flag: "🇺🇸", label: "English" },
  ]

  return (
    <header className="h-14 bg-white border-b border-[#E5E7EB] flex items-center px-4 gap-4 sticky top-0 z-30">
      <button onClick={onMenuToggle} className="lg:hidden p-2 rounded-lg hover:bg-[#F5F8FB] text-[#6B7280] transition-colors">
        <Menu className="w-5 h-5" />
      </button>

      {pageTitle && (
        <h1 className="text-sm font-semibold text-[#1F2937] hidden sm:block">{pageTitle}</h1>
      )}

      {/* Search */}
      <div ref={searchRef} className="flex-1 max-w-xs hidden md:block relative">
        <div className="relative">
          <Search className={cn("absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 transition-colors", searching ? "text-[#0059A0]" : "text-[#9CA3AF]")} />
          <input
            type="text"
            value={query}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onFocus={() => results.length > 0 && setSearchOpen(true)}
            placeholder={t("search_placeholder")}
            className="w-full h-8 pl-8 pr-3 text-xs bg-[#F5F8FB] border border-[#E5E7EB] rounded-lg focus:outline-none focus:border-[#0B7FC1] focus:ring-1 focus:ring-[#0B7FC1]/20 text-[#1F2937] placeholder:text-[#9CA3AF]"
          />
          {searching && (
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 border border-[#0059A0] border-t-transparent rounded-full animate-spin" />
          )}
        </div>

        {searchOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#E5E7EB] rounded-xl shadow-xl z-50 overflow-hidden max-h-80 overflow-y-auto">
            {results.length === 0 ? (
              <div className="px-4 py-5 text-center text-xs text-[#9CA3AF]">
                {t("search_no_results")} &ldquo;{query}&rdquo;
              </div>
            ) : (
              Object.entries(grouped).map(([type, items]) => {
                const Icon = TYPE_ICON[type] ?? FileText
                const colorClass = TYPE_COLOR[type] ?? "text-[#6B7280] bg-gray-50"
                return (
                  <div key={type}>
                    <div className="px-3 py-1.5 text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wide bg-[#F9FAFB] border-b border-[#F3F4F6]">
                      {type}
                    </div>
                    {items.map((item, i) => (
                      <button
                        key={i}
                        onClick={() => handleResultClick(item.href)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-[#F5F8FB] transition-colors text-left border-b border-[#F9FAFB] last:border-0"
                      >
                        <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0", colorClass)}>
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-[#1F2937] truncate">{item.label}</p>
                          <p className="text-[11px] text-[#9CA3AF] truncate">{item.description}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )
              })
            )}
          </div>
        )}
      </div>

      <div className="flex-1" />

      {/* Language switcher */}
      <div ref={langRef} className="relative">
        <button
          onClick={() => setLangMenuOpen(!langMenuOpen)}
          title={t("lang_label")}
          className="flex items-center gap-1.5 p-2 rounded-lg hover:bg-[#F5F8FB] text-[#6B7280] transition-colors"
        >
          <Globe className="w-4 h-4" />
          <span className="hidden sm:inline text-xs font-medium">{locale === "pt-BR" ? "PT" : "EN"}</span>
        </button>

        {langMenuOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setLangMenuOpen(false)} />
            <div className="absolute right-0 mt-1 w-44 bg-white border border-[#E5E7EB] rounded-xl shadow-lg z-50 overflow-hidden p-1">
              {LOCALES.map((l) => (
                <button
                  key={l.value}
                  onClick={() => { setLocale(l.value); setLangMenuOpen(false) }}
                  className={cn(
                    "w-full flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg transition-colors text-left",
                    locale === l.value
                      ? "bg-[#EFF6FF] text-[#0059A0] font-medium"
                      : "text-[#1F2937] hover:bg-[#F5F8FB]"
                  )}
                >
                  <span className="text-base">{l.flag}</span>
                  <span>{l.label}</span>
                  {locale === l.value && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#0059A0]" />
                  )}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Notifications */}
      <Link href="/notificacoes" className="relative p-2 rounded-lg hover:bg-[#F5F8FB] text-[#6B7280] transition-colors">
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 bg-[#FF7A2F] text-white text-[9px] font-bold rounded-full flex items-center justify-center px-0.5 leading-none">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </Link>

      {/* User menu */}
      <div className="relative">
        <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-[#F5F8FB] transition-colors">
          <div className="w-7 h-7 rounded-full bg-[#0059A0] flex items-center justify-center text-white text-xs font-semibold overflow-hidden flex-shrink-0">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              session?.user?.name?.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase() ?? "U"
            )}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-medium text-[#1F2937] leading-tight">{session?.user?.name?.split(" ")[0]}</p>
          </div>
          <ChevronDown className={cn("w-3 h-3 text-[#6B7280] transition-transform hidden sm:block", userMenuOpen && "rotate-180")} />
        </button>

        {userMenuOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
            <div className="absolute right-0 mt-1 w-52 bg-white border border-[#E5E7EB] rounded-xl shadow-lg z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-[#E5E7EB]">
                <p className="text-xs font-semibold text-[#1F2937]">{session?.user?.name}</p>
                <p className="text-xs text-[#6B7280] truncate">{session?.user?.email}</p>
              </div>
              <div className="p-1">
                <Link href="/perfil" className="flex items-center gap-2 px-3 py-2 text-sm text-[#1F2937] rounded-lg hover:bg-[#F5F8FB] transition-colors" onClick={() => setUserMenuOpen(false)}>
                  <User className="w-4 h-4 text-[#6B7280]" />
                  {t("menu_my_profile")}
                </Link>
                <Link href="/configuracoes" className="flex items-center gap-2 px-3 py-2 text-sm text-[#1F2937] rounded-lg hover:bg-[#F5F8FB] transition-colors" onClick={() => setUserMenuOpen(false)}>
                  <Settings className="w-4 h-4 text-[#6B7280]" />
                  {t("menu_settings")}
                </Link>
                <div className="border-t border-[#E5E7EB] mt-1 pt-1">
                  <button onClick={() => signOut({ callbackUrl: "/login" })} className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 rounded-lg hover:bg-red-50 transition-colors">
                    <LogOut className="w-4 h-4" />
                    {t("menu_sign_out")}
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  )
}
