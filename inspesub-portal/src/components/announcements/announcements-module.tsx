"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { formatDateTime } from "@/lib/utils"
import { Megaphone, Plus, Pin, X } from "lucide-react"
import { cn } from "@/lib/utils"
import type { AnnouncementCategory } from "@prisma/client"
import { useLanguage } from "@/components/providers/language-provider"

type Announcement = {
  id: string
  title: string
  content: string
  category: AnnouncementCategory
  isPinned: boolean
  createdAt: string
  author: { id: string; name: string; role: string }
}

interface AnnouncementsModuleProps {
  announcements: Announcement[]
  isAdmin: boolean
  currentUserId: string
}

const CATEGORY_COLORS: Record<AnnouncementCategory, string> = {
  hr: "bg-blue-50 text-[#0059A0] border-blue-200",
  operational: "bg-orange-50 text-[#FF7A2F] border-orange-200",
  training: "bg-amber-50 text-amber-700 border-amber-200",
  safety: "bg-red-50 text-red-700 border-red-200",
  general: "bg-gray-50 text-[#6B7280] border-gray-200",
}

export function AnnouncementsModule({ announcements, isAdmin, currentUserId }: AnnouncementsModuleProps) {
  const router = useRouter()
  const { t } = useLanguage()
  const [createOpen, setCreateOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [form, setForm] = useState({
    title: "",
    content: "",
    category: "general" as AnnouncementCategory,
    isPinned: false,
  })

  const CATEGORY_CONFIG: Record<AnnouncementCategory, { label: string; color: string }> = {
    hr: { label: t('ann_cat_rh'), color: CATEGORY_COLORS.hr },
    operational: { label: t('ann_cat_operational'), color: CATEGORY_COLORS.operational },
    training: { label: t('ann_cat_training'), color: CATEGORY_COLORS.training },
    safety: { label: t('ann_cat_safety'), color: CATEGORY_COLORS.safety },
    general: { label: t('ann_cat_general'), color: CATEGORY_COLORS.general },
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch("/api/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        setCreateOpen(false)
        setForm({ title: "", content: "", category: "general", isPinned: false })
        router.refresh()
      }
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Excluir comunicado?")) return
    await fetch(`/api/announcements/${id}`, { method: "DELETE" })
    router.refresh()
  }

  return (
    <div className="space-y-4">
      {isAdmin && (
        <div className="flex justify-end">
          <button onClick={() => setCreateOpen(true)}
            className="flex items-center gap-2 h-9 px-4 bg-[#0059A0] text-white text-sm font-medium rounded-lg hover:bg-[#1F4E87] transition-colors">
            <Plus className="w-3.5 h-3.5" />
            {t('action_new_announcement')}
          </button>
        </div>
      )}

      {announcements.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-12 text-center">
          <Megaphone className="w-10 h-10 text-[#D1D5DB] mx-auto mb-3" />
          <p className="text-[#6B7280]">{t('empty_announcements')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {announcements.map((ann) => {
            const catConfig = CATEGORY_CONFIG[ann.category]
            const isExpanded = expandedId === ann.id

            return (
              <div key={ann.id} className={cn(
                "bg-white rounded-xl border transition-all",
                ann.isPinned ? "border-[#0059A0]/30 shadow-sm" : "border-[#E5E7EB]"
              )}>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      {ann.isPinned && (
                        <Pin className="w-4 h-4 text-[#0059A0] mt-0.5 flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h3 className="text-sm font-semibold text-[#1F2937]">{ann.title}</h3>
                          <span className={cn("text-xs px-2 py-0.5 border rounded-full font-medium", catConfig.color)}>
                            {catConfig.label}
                          </span>
                        </div>
                        <p className={cn("text-sm text-[#6B7280]", !isExpanded && "line-clamp-2")}>
                          {ann.content}
                        </p>
                        {ann.content.length > 150 && (
                          <button onClick={() => setExpandedId(isExpanded ? null : ann.id)}
                            className="text-xs text-[#0059A0] mt-1 hover:underline">
                            {isExpanded ? t('action_see_less') : t('action_see_more')}
                          </button>
                        )}
                        <p className="text-xs text-[#9CA3AF] mt-2">
                          {t('ann_by')} {ann.author.name} • {formatDateTime(ann.createdAt)}
                        </p>
                      </div>
                    </div>
                    {isAdmin && (
                      <button onClick={() => handleDelete(ann.id)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-[#9CA3AF] hover:bg-red-50 hover:text-red-500 transition-colors flex-shrink-0">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Create Modal */}
      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setCreateOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-semibold text-[#1F2937]">{t('ann_create_title')}</h3>
              <button onClick={() => setCreateOpen(false)} className="p-1 hover:bg-[#F5F8FB] rounded-lg">
                <X className="w-4 h-4 text-[#6B7280]" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#1F2937] mb-1.5">{t('ann_title_req')}</label>
                <input required value={form.title} onChange={(e) => setForm(p => ({ ...p, title: e.target.value }))}
                  placeholder={t('ann_title_ph')}
                  className="w-full h-10 px-3 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:border-[#0059A0] placeholder:text-[#9CA3AF] text-[#1F2937]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1F2937] mb-1.5">{t('ann_category')}</label>
                <select value={form.category} onChange={(e) => setForm(p => ({ ...p, category: e.target.value as AnnouncementCategory }))}
                  className="w-full h-10 px-3 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:border-[#0059A0] text-[#1F2937]">
                  {Object.entries(CATEGORY_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1F2937] mb-1.5">{t('ann_content_req')}</label>
                <textarea required value={form.content} onChange={(e) => setForm(p => ({ ...p, content: e.target.value }))}
                  rows={4} placeholder={t('ann_content_ph')}
                  className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:border-[#0059A0] resize-none placeholder:text-[#9CA3AF] text-[#1F2937]" />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isPinned} onChange={(e) => setForm(p => ({ ...p, isPinned: e.target.checked }))}
                  className="w-4 h-4 rounded border-[#E5E7EB] accent-[#0059A0]" />
                <span className="text-sm text-[#1F2937]">{t('ann_pin')}</span>
              </label>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setCreateOpen(false)}
                  className="flex-1 h-10 border border-[#E5E7EB] text-sm text-[#6B7280] rounded-xl hover:bg-[#F5F8FB]">{t('action_cancel')}</button>
                <button type="submit" disabled={saving}
                  className="flex-1 h-10 bg-[#0059A0] text-white text-sm font-medium rounded-xl hover:bg-[#1F4E87] disabled:opacity-60">
                  {saving ? t('action_publishing') : t('action_publish')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
