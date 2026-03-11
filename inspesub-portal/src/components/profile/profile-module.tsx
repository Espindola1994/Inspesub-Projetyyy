"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { getInitials, formatDate } from "@/lib/utils"
import { ROLE_LABELS } from "@/lib/permissions"
import { User, Mail, Phone, Building, Calendar, Edit2, Save, X, MapPin, Baby, Camera } from "lucide-react"
import { useAvatar } from "@/components/providers/avatar-provider"
import { useLanguage } from "@/components/providers/language-provider"
import type { User as UserType, EmployeeProfile, Team } from "@prisma/client"

interface ProfileModuleProps {
  user: UserType & { profile: EmployeeProfile | null }
  teamMembership: { team: Team & { supervisor: { name: string } | null } } | null
}

export function ProfileModule({ user, teamMembership }: ProfileModuleProps) {
  const router = useRouter()
  const { t } = useLanguage()
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const { avatarUrl, setAvatarUrl } = useAvatar()
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [form, setForm] = useState({
    name: user.name,
    phone: user.profile?.phone ?? "",
    position: user.profile?.position ?? "",
    bio: user.profile?.bio ?? "",
    birthDate: user.profile?.birthDate
      ? new Date(user.profile.birthDate).toISOString().split("T")[0]
      : "",
    addressStreet: (user.profile as any)?.addressStreet ?? "",
    addressNumber: (user.profile as any)?.addressNumber ?? "",
    addressNeighborhood: (user.profile as any)?.addressNeighborhood ?? "",
    addressCity: (user.profile as any)?.addressCity ?? "",
    addressState: (user.profile as any)?.addressState ?? "",
    addressCountry: (user.profile as any)?.addressCountry ?? "",
  })

  async function handleSave() {
    setSaving(true)
    try {
      const res = await fetch("/api/users/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        setEditing(false)
        router.refresh()
      }
    } finally {
      setSaving(false)
    }
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingAvatar(true)
    try {
      const fd = new FormData()
      fd.append("file", file)
      const res = await fetch("/api/users/avatar", { method: "POST", body: fd })
      const json = await res.json()
      if (res.ok) {
        // Instant local preview, context updates header + sidebar immediately
        const objectUrl = URL.createObjectURL(file)
        setAvatarUrl(objectUrl)
      } else {
        alert(json.error ?? "Erro ao enviar foto")
      }
    } finally {
      setUploadingAvatar(false)
      e.target.value = ""
    }
  }

  const role = ROLE_LABELS[user.role]
  const statusColors = {
    active: "bg-emerald-50 text-emerald-700",
    pending: "bg-amber-50 text-amber-700",
    inactive: "bg-gray-50 text-gray-600",
    rejected: "bg-red-50 text-red-700",
    suspended: "bg-orange-50 text-orange-700",
  }

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Profile card */}
      <div className="lg:col-span-1 space-y-4">
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
          <div className="flex flex-col items-center text-center">
            <div className="relative group mb-4">
              <div className="w-20 h-20 rounded-full bg-[#0059A0] flex items-center justify-center overflow-hidden">
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={avatarUrl}
                    src={avatarUrl}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-white text-2xl font-bold">{getInitials(user.name)}</span>
                )}
              </div>
              <label className={`
                absolute inset-0 rounded-full flex items-center justify-center
                bg-black/50 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity
                ${uploadingAvatar ? "opacity-100" : ""}
              `}>
                {uploadingAvatar ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Camera className="w-5 h-5 text-white" />
                )}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleAvatarChange}
                  disabled={uploadingAvatar}
                />
              </label>
            </div>
            <h2 className="text-lg font-bold text-[#1F2937]">{user.name}</h2>
            <p className="text-sm text-[#6B7280]">{user.profile?.position ?? role}</p>
            <span className={`mt-2 text-xs px-3 py-1 rounded-full font-medium ${statusColors[user.status]}`}>
              {user.status === "active" ? t('account_active') : t('account_pending')}
            </span>
          </div>

          <div className="mt-5 pt-5 border-t border-[#F3F4F6] space-y-3">
            <div className="flex items-center gap-2.5 text-sm">
              <Mail className="w-4 h-4 text-[#9CA3AF] flex-shrink-0" />
              <span className="text-[#6B7280] truncate">{user.email}</span>
            </div>
            {user.profile?.phone && (
              <div className="flex items-center gap-2.5 text-sm">
                <Phone className="w-4 h-4 text-[#9CA3AF] flex-shrink-0" />
                <span className="text-[#6B7280]">{user.profile.phone}</span>
              </div>
            )}
            {teamMembership && (
              <div className="flex items-center gap-2.5 text-sm">
                <Building className="w-4 h-4 text-[#9CA3AF] flex-shrink-0" />
                <span className="text-[#6B7280]">{teamMembership.team.name}</span>
              </div>
            )}
            <div className="flex items-center gap-2.5 text-sm">
              <Calendar className="w-4 h-4 text-[#9CA3AF] flex-shrink-0" />
              <span className="text-[#6B7280]">Desde {formatDate(user.createdAt)}</span>
            </div>
            {user.profile?.birthDate && (
              <div className="flex items-center gap-2.5 text-sm">
                <Baby className="w-4 h-4 text-[#9CA3AF] flex-shrink-0" />
                <span className="text-[#6B7280]">{new Date(user.profile.birthDate).toLocaleDateString("pt-BR", { timeZone: "UTC" })}</span>
              </div>
            )}
            {user.profile?.registration && (
              <div className="flex items-center gap-2.5 text-sm">
                <User className="w-4 h-4 text-[#9CA3AF] flex-shrink-0" />
                <span className="text-[#6B7280]">Mat. {user.profile.registration}</span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
          <h3 className="text-sm font-semibold text-[#1F2937] mb-3">{t('profile_system_role')}</h3>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <User className="w-4 h-4 text-[#0059A0]" />
            </div>
            <p className="text-sm font-medium text-[#0059A0]">{role}</p>
          </div>
        </div>
      </div>

      {/* Edit form */}
      <div className="lg:col-span-2 space-y-4">
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-semibold text-[#1F2937]">{t('profile_personal_info')}</h3>
            {!editing ? (
              <button onClick={() => setEditing(true)}
                className="flex items-center gap-1.5 text-xs text-[#0059A0] hover:underline">
                <Edit2 className="w-3.5 h-3.5" />
                {t('action_edit')}
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button onClick={() => setEditing(false)}
                  className="flex items-center gap-1 text-xs text-[#6B7280] hover:text-[#1F2937]">
                  <X className="w-3.5 h-3.5" />
                  {t('action_cancel')}
                </button>
                <button onClick={handleSave} disabled={saving}
                  className="flex items-center gap-1.5 text-xs text-emerald-600 hover:underline disabled:opacity-60">
                  <Save className="w-3.5 h-3.5" />
                  {saving ? t('action_saving') : t('action_save')}
                </button>
              </div>
            )}
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            {[
              { label: t('profile_full_name'), key: "name", type: "text", placeholder: t('profile_full_name_ph') },
              { label: t('profile_phone'), key: "phone", type: "tel", placeholder: t('profile_phone_ph') },
              { label: t('profile_position'), key: "position", type: "text", placeholder: t('profile_position_ph') },
              { label: t('profile_birthdate'), key: "birthDate", type: "date", placeholder: "" },
            ].map((field) => (
              <div key={field.key}>
                <label className="block text-xs font-medium text-[#6B7280] mb-1.5 uppercase tracking-wide">
                  {field.label}
                </label>
                {editing ? (
                  <input
                    type={field.type}
                    value={form[field.key as keyof typeof form]}
                    onChange={(e) => setForm(p => ({ ...p, [field.key]: e.target.value }))}
                    placeholder={field.placeholder}
                    className="w-full h-10 px-3 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:border-[#0059A0] text-[#1F2937] placeholder:text-[#9CA3AF]"
                  />
                ) : (
                  <p className="text-sm text-[#1F2937]">
                    {field.key === "birthDate" && form.birthDate
                      ? new Date(form.birthDate + "T12:00:00").toLocaleDateString("pt-BR")
                      : form[field.key as keyof typeof form] || <span className="text-[#9CA3AF]">{t('profile_not_informed')}</span>}
                  </p>
                )}
              </div>
            ))}

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-[#6B7280] mb-1.5 uppercase tracking-wide">{t('profile_bio')}</label>
              {editing ? (
                <textarea
                  value={form.bio}
                  onChange={(e) => setForm(p => ({ ...p, bio: e.target.value }))}
                  rows={3}
                  placeholder={t('profile_bio_ph')}
                  className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:border-[#0059A0] resize-none text-[#1F2937] placeholder:text-[#9CA3AF]"
                />
              ) : (
                <p className="text-sm text-[#1F2937]">
                  {form.bio || <span className="text-[#9CA3AF]">{t('profile_not_informed')}</span>}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Address section */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
          <div className="flex items-center gap-2 mb-5">
            <MapPin className="w-4 h-4 text-[#0059A0]" />
            <h3 className="text-base font-semibold text-[#1F2937]">{t('profile_address')}</h3>
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            {[
              { label: t('profile_country'), key: "addressCountry", placeholder: t('profile_country_ph') },
              { label: t('profile_state'), key: "addressState", placeholder: t('profile_state_ph') },
              { label: t('profile_city'), key: "addressCity", placeholder: t('profile_city_ph') },
              { label: t('profile_neighborhood'), key: "addressNeighborhood", placeholder: t('profile_neighborhood_ph') },
              { label: t('profile_street'), key: "addressStreet", placeholder: t('profile_street_ph') },
              { label: t('profile_number'), key: "addressNumber", placeholder: t('profile_number_ph') },
            ].map((field) => (
              <div key={field.key} className={field.key === "addressStreet" ? "sm:col-span-2" : ""}>
                <label className="block text-xs font-medium text-[#6B7280] mb-1.5 uppercase tracking-wide">
                  {field.label}
                </label>
                {editing ? (
                  <input
                    type="text"
                    value={form[field.key as keyof typeof form]}
                    onChange={(e) => setForm(p => ({ ...p, [field.key]: e.target.value }))}
                    placeholder={field.placeholder}
                    className="w-full h-10 px-3 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:border-[#0059A0] text-[#1F2937] placeholder:text-[#9CA3AF]"
                  />
                ) : (
                  <p className="text-sm text-[#1F2937]">
                    {form[field.key as keyof typeof form] || <span className="text-[#9CA3AF]">{t('profile_not_informed')}</span>}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Team info */}
        {teamMembership && (
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
            <h3 className="text-base font-semibold text-[#1F2937] mb-4">{t('profile_current_team')}</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-[#6B7280] uppercase tracking-wide mb-1">{t('profile_team')}</p>
                <p className="text-sm font-medium text-[#1F2937]">{teamMembership.team.name}</p>
              </div>
              {teamMembership.team.operation && (
                <div>
                  <p className="text-xs text-[#6B7280] uppercase tracking-wide mb-1">{t('profile_operation')}</p>
                  <p className="text-sm font-medium text-[#1F2937]">{teamMembership.team.operation}</p>
                </div>
              )}
              {teamMembership.team.supervisor && (
                <div>
                  <p className="text-xs text-[#6B7280] uppercase tracking-wide mb-1">{t('profile_supervisor')}</p>
                  <p className="text-sm font-medium text-[#1F2937]">{teamMembership.team.supervisor.name}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
