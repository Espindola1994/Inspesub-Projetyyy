"use client"

import { useState } from "react"
import { createPortal } from "react-dom"
import { useRouter } from "next/navigation"
import { formatDate } from "@/lib/utils"
import { FolderOpen, Plus, Search, Filter, Eye, Download, AlertTriangle, X, FileText } from "lucide-react"
import { cn } from "@/lib/utils"
import type { DocumentCategory } from "@prisma/client"
import { useLanguage } from "@/components/providers/language-provider"

type Document = {
  id: string
  title: string
  description: string | null
  category: DocumentCategory
  fileUrl: string
  fileName: string
  fileSize: number | null
  mimeType: string | null
  issuedAt: string | null
  expiresAt: string | null
  isExpired: boolean
  tags: string[]
  createdAt: string
  user: { id: string; name: string }
}

interface DocumentsModuleProps {
  documents: Document[]
  isAdmin: boolean
  employees: { id: string; name: string }[]
  currentUserId: string
}

const CATEGORY_COLORS: Record<DocumentCategory, string> = {
  certificate: "bg-blue-50 text-[#0059A0]",
  training: "bg-amber-50 text-amber-700",
  aso: "bg-emerald-50 text-emerald-700",
  internal: "bg-purple-50 text-purple-700",
  contract: "bg-indigo-50 text-indigo-700",
  identification: "bg-pink-50 text-pink-700",
  other: "bg-gray-50 text-[#6B7280]",
}

export function DocumentsModule({ documents, isAdmin, employees, currentUserId }: DocumentsModuleProps) {
  const router = useRouter()
  const { t } = useLanguage()
  const [search, setSearch] = useState("")
  const [filterCategory, setFilterCategory] = useState<DocumentCategory | "">("")
  const [filterExpiring, setFilterExpiring] = useState(false)
  const [uploadOpen, setUploadOpen] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [previewDoc, setPreviewDoc] = useState<Document | null>(null)
  const [form, setForm] = useState({
    userId: currentUserId,
    title: "",
    description: "",
    category: "other" as DocumentCategory,
    issuedAt: "",
    expiresAt: "",
    tags: "",
    file: null as File | null,
  })

  const CATEGORY_CONFIG: Record<DocumentCategory, { label: string; color: string }> = {
    certificate: { label: t('doc_cat_certificate'), color: CATEGORY_COLORS.certificate },
    training: { label: t('doc_cat_training'), color: CATEGORY_COLORS.training },
    aso: { label: t('doc_cat_aso'), color: CATEGORY_COLORS.aso },
    internal: { label: t('doc_cat_internal'), color: CATEGORY_COLORS.internal },
    contract: { label: t('doc_cat_contract'), color: CATEGORY_COLORS.contract },
    identification: { label: t('doc_cat_id'), color: CATEGORY_COLORS.identification },
    other: { label: t('doc_cat_other'), color: CATEGORY_COLORS.other },
  }

  const CATEGORIES = Object.entries(CATEGORY_CONFIG) as [DocumentCategory, { label: string; color: string }][]

  const now = new Date()
  const thirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

  const filtered = documents.filter((d) => {
    if (search && !d.title.toLowerCase().includes(search.toLowerCase()) &&
        !d.user.name.toLowerCase().includes(search.toLowerCase())) return false
    if (filterCategory && d.category !== filterCategory) return false
    if (filterExpiring) {
      const exp = d.expiresAt ? new Date(d.expiresAt) : null
      if (!exp || exp > thirtyDays) return false
    }
    return true
  })

  const expiringCount = documents.filter((d) => {
    const exp = d.expiresAt ? new Date(d.expiresAt) : null
    return exp && exp <= thirtyDays && exp >= now
  }).length

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault()
    if (!form.file) return
    setUploading(true)

    const fd = new FormData()
    fd.append("file", form.file)
    fd.append("userId", form.userId)
    fd.append("title", form.title)
    fd.append("description", form.description)
    fd.append("category", form.category)
    if (form.issuedAt) fd.append("issuedAt", form.issuedAt)
    if (form.expiresAt) fd.append("expiresAt", form.expiresAt)
    if (form.tags) fd.append("tags", form.tags)

    try {
      const res = await fetch("/api/documents", { method: "POST", body: fd })
      if (res.ok) {
        setUploadOpen(false)
        router.refresh()
      }
    } finally {
      setUploading(false)
    }
  }

  async function handleDownload(doc: Document) {
    const res = await fetch(`/api/documents/${doc.id}/download`)
    if (!res.ok) { alert("Erro ao baixar arquivo"); return }
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = window.document.createElement("a")
    a.href = url
    a.download = doc.fileName
    a.click()
    URL.revokeObjectURL(url)
  }

  function isExpiringSoon(expiresAt: string | null) {
    if (!expiresAt) return false
    const exp = new Date(expiresAt)
    return exp <= thirtyDays && exp >= now
  }

  return (
    <div className="space-y-4">
      {/* Expiring alert */}
      {expiringCount > 0 && (
        <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <p className="text-sm text-amber-800">
            <strong>{expiringCount} {t('doc_expiring_banner')}</strong>
          </p>
          <button onClick={() => setFilterExpiring(true)}
            className="ml-auto text-xs text-amber-700 underline hover:no-underline">
            {t('action_see_all')}
          </button>
        </div>
      )}

      {/* Toolbar */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] p-4 flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9CA3AF]" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder={t('doc_search')}
            className="w-full h-9 pl-9 pr-3 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:border-[#0059A0] text-[#1F2937]" />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-[#6B7280]" />
          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value as DocumentCategory | "")}
            className="h-9 px-2 border border-[#E5E7EB] rounded-lg text-sm text-[#1F2937] focus:outline-none">
            <option value="">{t('filter_all_categories')}</option>
            {CATEGORIES.map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
          <button onClick={() => setFilterExpiring(!filterExpiring)}
            className={cn("h-9 px-3 text-xs rounded-lg border transition-colors",
              filterExpiring ? "bg-amber-50 text-amber-700 border-amber-200" : "border-[#E5E7EB] text-[#6B7280] hover:bg-[#F5F8FB]")}>
            {t('filter_expiring')}
          </button>
        </div>

        <button onClick={() => setUploadOpen(true)}
          className="flex items-center gap-2 h-9 px-4 bg-[#0059A0] text-white text-sm font-medium rounded-lg hover:bg-[#1F4E87] transition-colors ml-auto">
          <Plus className="w-3.5 h-3.5" />
          {t('action_add_document')}
        </button>
      </div>

      {/* Documents grid */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-12 text-center">
          <FolderOpen className="w-10 h-10 text-[#D1D5DB] mx-auto mb-3" />
          <p className="text-[#6B7280]">{t('empty_documents')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((doc) => {
            const catConfig = CATEGORY_CONFIG[doc.category]
            const expiringSoon = isExpiringSoon(doc.expiresAt)
            const expired = doc.isExpired || (doc.expiresAt ? new Date(doc.expiresAt) < now : false)

            return (
              <div key={doc.id} className={cn(
                "bg-white rounded-xl border p-5 transition-all hover:shadow-md",
                expired ? "border-red-200 bg-red-50/20" : expiringSoon ? "border-amber-200 bg-amber-50/20" : "border-[#E5E7EB]"
              )}>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-[#F5F8FB] flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-[#0059A0]" />
                  </div>
                  <div className="flex items-center gap-1">
                    {expired && <AlertTriangle className="w-4 h-4 text-red-500" />}
                    {expiringSoon && !expired && <AlertTriangle className="w-4 h-4 text-amber-500" />}
                    <button
                      onClick={() => setPreviewDoc(doc)}
                      title="Pré-visualizar"
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-[#0059A0] hover:bg-blue-50 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDownload(doc)}
                      title="Baixar"
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-[#6B7280] hover:bg-[#F5F8FB] transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h4 className="text-sm font-semibold text-[#1F2937] mb-1 line-clamp-1">{doc.title}</h4>
                {doc.description && (
                  <p className="text-xs text-[#6B7280] mb-2 line-clamp-2">{doc.description}</p>
                )}

                <div className="flex flex-wrap gap-1.5 mb-3">
                  <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", catConfig.color)}>
                    {catConfig.label}
                  </span>
                </div>

                <div className="text-xs text-[#9CA3AF] space-y-0.5">
                  {isAdmin && <p>{t('doc_added_by')}: {doc.user.name}</p>}
                  {doc.expiresAt && (
                    <p className={cn(expired ? "text-red-500 font-medium" : expiringSoon ? "text-amber-600 font-medium" : "")}>
                      {t('doc_expires')}: {formatDate(doc.expiresAt)}
                      {expired ? ` (${t('doc_expired')})` : expiringSoon ? ` (${t('doc_expiring_soon')})` : ""}
                    </p>
                  )}
                  <p>{t('doc_added_on')}: {formatDate(doc.createdAt)}</p>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Upload Modal */}
      {uploadOpen && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50" onClick={() => setUploadOpen(false)}>
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="shrink-0 flex items-center justify-between p-6 pb-4">
              <h3 className="text-base font-semibold text-[#1F2937]">{t('doc_add_title')}</h3>
              <button onClick={() => setUploadOpen(false)} className="p-1 hover:bg-[#F5F8FB] rounded-lg transition-colors">
                <X className="w-4 h-4 text-[#6B7280]" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto min-h-0 p-6 pt-0">
              <form id="doc-form" onSubmit={handleUpload} className="space-y-4">
                {isAdmin && (
                  <div>
                    <label className="block text-sm font-medium text-[#1F2937] mb-1.5">{t('doc_employee_req')}</label>
                    <select required value={form.userId} onChange={(e) => setForm(p => ({ ...p, userId: e.target.value }))}
                      className="w-full h-10 px-3 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:border-[#0059A0] text-[#1F2937]">
                      <option value={currentUserId}>{t('doc_my_profile')}</option>
                      {employees.filter(e => e.id !== currentUserId).map((emp) => (
                        <option key={emp.id} value={emp.id}>{emp.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-[#1F2937] mb-1.5">{t('doc_title_req')}</label>
                  <input required value={form.title} onChange={(e) => setForm(p => ({ ...p, title: e.target.value }))}
                    placeholder={t('doc_title_ph')}
                    className="w-full h-10 px-3 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:border-[#0059A0] placeholder:text-[#9CA3AF] text-[#1F2937]" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#1F2937] mb-1.5">{t('doc_category_req')}</label>
                  <select required value={form.category} onChange={(e) => setForm(p => ({ ...p, category: e.target.value as DocumentCategory }))}
                    className="w-full h-10 px-3 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:border-[#0059A0] text-[#1F2937]">
                    {CATEGORIES.map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-[#1F2937] mb-1.5">{t('doc_issue_date')}</label>
                    <input type="date" value={form.issuedAt} onChange={(e) => setForm(p => ({ ...p, issuedAt: e.target.value }))}
                      className="w-full h-10 px-3 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:border-[#0059A0] text-[#1F2937]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#1F2937] mb-1.5">{t('doc_expiry_date')}</label>
                    <input type="date" value={form.expiresAt} onChange={(e) => setForm(p => ({ ...p, expiresAt: e.target.value }))}
                      className="w-full h-10 px-3 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:border-[#0059A0] text-[#1F2937]" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#1F2937] mb-1.5">{t('doc_file_req')}</label>
                  <input type="file" required accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                    onChange={(e) => setForm(p => ({ ...p, file: e.target.files?.[0] ?? null }))}
                    className="w-full text-sm text-[#6B7280] file:mr-3 file:h-8 file:px-3 file:text-xs file:font-medium file:bg-[#0059A0] file:text-white file:border-0 file:rounded-lg" />
                </div>
              </form>
            </div>

            <div className="shrink-0 p-6 pt-0 flex gap-3">
              <button type="button" onClick={() => setUploadOpen(false)}
                className="flex-1 h-10 border border-[#E5E7EB] text-sm text-[#6B7280] rounded-xl hover:bg-[#F5F8FB] transition-colors font-medium">{t('action_cancel')}</button>
              <button type="submit" form="doc-form" disabled={uploading}
                className="flex-1 h-10 bg-[#0059A0] text-white text-sm font-medium rounded-xl hover:bg-[#1F4E87] disabled:opacity-60 transition-colors shadow-sm">
                {uploading ? t('action_sending') : t('action_add')}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
      {/* PDF Preview Modal */}
      {previewDoc && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex flex-col bg-black/80"
          onClick={() => setPreviewDoc(null)}
        >
          <div className="flex items-center justify-between px-5 py-3 bg-white border-b" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#0059A0]" />
              <span className="text-sm font-semibold text-[#1F2937] truncate max-w-[60vw]">{previewDoc.title}</span>
              <span className="text-xs text-[#9CA3AF]">{previewDoc.fileName}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleDownload(previewDoc)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#0059A0] border border-[#0059A0] rounded-lg hover:bg-blue-50 transition-colors"
              >
                <Download className="w-3.5 h-3.5" /> Baixar
              </button>
              <button
                onClick={() => setPreviewDoc(null)}
                className="p-1.5 hover:bg-[#F5F8FB] rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-[#6B7280]" />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-hidden" onClick={e => e.stopPropagation()}>
            {previewDoc.mimeType === "application/pdf" || previewDoc.fileName.toLowerCase().endsWith(".pdf") ? (
              <iframe
                src={`/api/documents/${previewDoc.id}/preview`}
                className="w-full h-full border-0"
                title={previewDoc.title}
              />
            ) : previewDoc.mimeType?.startsWith("image/") || /\.(png|jpe?g|webp|gif)$/i.test(previewDoc.fileName) ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={`/api/documents/${previewDoc.id}/preview`}
                alt={previewDoc.title}
                className="max-w-full max-h-full object-contain mx-auto mt-8"
              />
            ) : previewDoc.mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || previewDoc.mimeType === "application/msword" || /\.(docx?|DOCX?)$/.test(previewDoc.fileName) ? (
              <iframe
                src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(window.location.origin + "/api/documents/" + previewDoc.id + "/download")}`}
                className="w-full h-full border-0"
                title={previewDoc.title}
                allowFullScreen
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-4">
                <FileText className="w-16 h-16 text-white/40" />
                <p className="text-white/70 text-sm">Pré-visualização não disponível para este tipo de arquivo.</p>
                <button
                  onClick={() => handleDownload(previewDoc)}
                  className="flex items-center gap-2 px-4 py-2 bg-[#0059A0] text-white text-sm rounded-lg hover:bg-[#1F4E87]"
                >
                  <Download className="w-4 h-4" /> Baixar arquivo
                </button>
              </div>
            )}
          </div>
        </div>,
        window.document.body
      )}
    </div>
  )
}
