"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Settings, Save } from "lucide-react"
import { useLanguage } from "@/components/providers/language-provider"

type Setting = {
  id: string
  key: string
  value: string
  group: string
  label: string | null
}

interface SettingsModuleProps {
  settings: Setting[]
}

export function SettingsModule({ settings }: SettingsModuleProps) {
  const router = useRouter()
  const { t } = useLanguage()
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(settings.map((s) => [s.key, s.value]))
  )
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const GROUP_LABELS: Record<string, string> = {
    company: t('set_company'),
    attendance: t('set_attendance'),
    files: t('set_files'),
    documents: t('set_documents'),
  }

  const grouped = settings.reduce((acc, setting) => {
    if (!acc[setting.group]) acc[setting.group] = []
    acc[setting.group].push(setting)
    return acc
  }, {} as Record<string, Setting[]>)

  async function handleSave() {
    setSaving(true)
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings: values }),
      })
      if (res.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
        router.refresh()
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 h-9 px-4 bg-[#0059A0] text-white text-sm font-medium rounded-lg hover:bg-[#1F4E87] transition-colors disabled:opacity-60"
        >
          <Save className="w-4 h-4" />
          {saving ? t('set_saving') : saved ? t('set_saved') : t('set_save')}
        </button>
      </div>

      {Object.entries(grouped).map(([group, items]) => (
        <div key={group} className="bg-white rounded-xl border border-[#E5E7EB] p-6">
          <h3 className="text-sm font-semibold text-[#1F2937] mb-5 flex items-center gap-2">
            <Settings className="w-4 h-4 text-[#0059A0]" />
            {GROUP_LABELS[group] ?? group}
          </h3>
          <div className="grid sm:grid-cols-2 gap-4">
            {items.map((setting) => (
              <div key={setting.key}>
                <label className="block text-xs font-medium text-[#6B7280] mb-1.5 uppercase tracking-wide">
                  {setting.label ?? setting.key}
                </label>
                <input
                  type="text"
                  value={values[setting.key] ?? ""}
                  onChange={(e) => setValues(p => ({ ...p, [setting.key]: e.target.value }))}
                  className="w-full h-10 px-3 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:border-[#0059A0] text-[#1F2937]"
                />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
