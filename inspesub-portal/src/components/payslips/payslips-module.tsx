"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { formatDate, getMonthName, MONTH_NAMES } from "@/lib/utils"
import { FileText, Upload, Download, Eye, Search, Filter, X } from "lucide-react"
import { useLanguage } from "@/components/providers/language-provider"

type Payslip = {
  id: string
  year: number
  month: number
  fileName: string
  fileUrl: string
  fileSize: number | null
  description: string | null
  readAt: string | null
  uploadedAt: string
  employee: { id: string; name: string; email: string }
  uploadedBy: { name: string }
}

interface PayslipsModuleProps {
  payslips: Payslip[]
  isAdmin: boolean
  employees: { id: string; name: string }[]
  currentUserId: string
}

const MONTHS = MONTH_NAMES.map((name, i) => ({ value: i + 1, label: name }))
const CURRENT_YEAR = new Date().getFullYear()
const YEARS = Array.from({ length: 5 }, (_, i) => CURRENT_YEAR - i)

export function PayslipsModule({ payslips, isAdmin, employees, currentUserId }: PayslipsModuleProps) {
  const router = useRouter()
  const { t } = useLanguage()
  const [search, setSearch] = useState("")
  const [filterYear, setFilterYear] = useState<number | "">("")
  const [filterMonth, setFilterMonth] = useState<number | "">("")
  const [uploadOpen, setUploadOpen] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadForm, setUploadForm] = useState({
    employeeId: "",
    year: String(CURRENT_YEAR),
    month: String(new Date().getMonth() + 1),
    description: "",
    file: null as File | null,
  })

  const filtered = payslips.filter((p) => {
    if (search && !p.employee.name.toLowerCase().includes(search.toLowerCase())) return false
    if (filterYear && p.year !== filterYear) return false
    if (filterMonth && p.month !== filterMonth) return false
    return true
  })

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault()
    if (!uploadForm.file || !uploadForm.employeeId) return
    setUploading(true)

    const fd = new FormData()
    fd.append("file", uploadForm.file)
    fd.append("employeeId", uploadForm.employeeId)
    fd.append("year", uploadForm.year)
    fd.append("month", uploadForm.month)
    fd.append("description", uploadForm.description)

    try {
      const res = await fetch("/api/payslips", { method: "POST", body: fd })
      if (res.ok) {
        setUploadOpen(false)
        setUploadForm({ employeeId: "", year: String(CURRENT_YEAR), month: String(new Date().getMonth() + 1), description: "", file: null })
        router.refresh()
      }
    } finally {
      setUploading(false)
    }
  }

  async function markAsRead(id: string) {
    await fetch(`/api/payslips/${id}/read`, { method: "POST" })
    router.refresh()
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] p-4 flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9CA3AF]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('payslip_search')}
            className="w-full h-9 pl-9 pr-3 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:border-[#0059A0] text-[#1F2937]"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-[#6B7280]" />
          <select
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value ? parseInt(e.target.value) : "")}
            className="h-9 px-2 border border-[#E5E7EB] rounded-lg text-sm text-[#1F2937] focus:outline-none focus:border-[#0059A0]"
          >
            <option value="">{t('filter_all_years')}</option>
            {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
          <select
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value ? parseInt(e.target.value) : "")}
            className="h-9 px-2 border border-[#E5E7EB] rounded-lg text-sm text-[#1F2937] focus:outline-none focus:border-[#0059A0]"
          >
            <option value="">{t('filter_all_months')}</option>
            {MONTHS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
        </div>

        {isAdmin && (
          <button
            onClick={() => setUploadOpen(true)}
            className="flex items-center gap-2 h-9 px-4 bg-[#0059A0] text-white text-sm font-medium rounded-lg hover:bg-[#1F4E87] transition-colors ml-auto"
          >
            <Upload className="w-3.5 h-3.5" />
            {t('action_new_payslip')}
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
              {isAdmin && <th className="text-left px-5 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wide">{t('col_employee')}</th>}
              <th className="text-left px-5 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wide">{t('col_period')}</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wide">{t('col_file')}</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wide">{t('col_sent_at')}</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wide">{t('col_status')}</th>
              <th className="px-5 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wide text-right">{t('col_actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F3F4F6]">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={isAdmin ? 6 : 5} className="px-5 py-10 text-center text-sm text-[#6B7280]">
                  {t('empty_payslips')}
                </td>
              </tr>
            ) : (
              filtered.map((p) => (
                <tr key={p.id} className="hover:bg-[#F8FAFC] transition-colors">
                  {isAdmin && (
                    <td className="px-5 py-4">
                      <div>
                        <p className="font-medium text-[#1F2937]">{p.employee.name}</p>
                        <p className="text-xs text-[#6B7280]">{p.employee.email}</p>
                      </div>
                    </td>
                  )}
                  <td className="px-5 py-4">
                    <span className="font-medium text-[#1F2937]">
                      {getMonthName(p.month)} / {p.year}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-4 h-4 text-red-500" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-[#1F2937] max-w-[150px] truncate">{p.fileName}</p>
                        {p.description && (
                          <p className="text-xs text-[#6B7280] truncate max-w-[150px]">{p.description}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-[#6B7280]">
                    {formatDate(p.uploadedAt)}
                  </td>
                  <td className="px-5 py-4">
                    {p.readAt ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs rounded-full">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        {t('status_read')}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-700 text-xs rounded-full">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                        {t('status_unread')}
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2 justify-end">
                      <a
                        href={`/api/payslips/${p.id}/download`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => !p.readAt && p.employee.id === currentUserId && markAsRead(p.id)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-[#0059A0] hover:bg-blue-50 transition-colors"
                        title={t('action_view')}
                      >
                        <Eye className="w-4 h-4" />
                      </a>
                      <a
                        href={`/api/payslips/${p.id}/download`}
                        download={p.fileName}
                        onClick={() => !p.readAt && p.employee.id === currentUserId && markAsRead(p.id)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-[#6B7280] hover:bg-[#F5F8FB] transition-colors"
                        title={t('action_download')}
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Upload modal */}
      {uploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setUploadOpen(false)}>
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="shrink-0 flex items-center justify-between p-6 pb-4">
              <h3 className="text-base font-semibold text-[#1F2937]">{t('payslip_upload_title')}</h3>
              <button onClick={() => setUploadOpen(false)} className="p-1 hover:bg-[#F5F8FB] rounded-lg transition-colors">
                <X className="w-4 h-4 text-[#6B7280]" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto min-h-0 p-6 pt-0">
              <form id="payslip-form" onSubmit={handleUpload} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#1F2937] mb-1.5">{t('payslip_employee_req')}</label>
                  <select
                    required
                    value={uploadForm.employeeId}
                    onChange={(e) => setUploadForm(p => ({ ...p, employeeId: e.target.value }))}
                    className="w-full h-10 px-3 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:border-[#0059A0] text-[#1F2937]"
                  >
                    <option value="">{t('select_placeholder')}</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>{emp.name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-[#1F2937] mb-1.5">{t('payslip_year_req')}</label>
                    <select
                      required
                      value={uploadForm.year}
                      onChange={(e) => setUploadForm(p => ({ ...p, year: e.target.value }))}
                      className="w-full h-10 px-3 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:border-[#0059A0] text-[#1F2937]"
                    >
                      {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#1F2937] mb-1.5">{t('payslip_month_req')}</label>
                    <select
                      required
                      value={uploadForm.month}
                      onChange={(e) => setUploadForm(p => ({ ...p, month: e.target.value }))}
                      className="w-full h-10 px-3 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:border-[#0059A0] text-[#1F2937]"
                    >
                      {MONTHS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#1F2937] mb-1.5">{t('payslip_file_req')}</label>
                  <input
                    type="file"
                    required
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={(e) => setUploadForm(p => ({ ...p, file: e.target.files?.[0] ?? null }))}
                    className="w-full text-sm text-[#6B7280] file:mr-3 file:h-8 file:px-3 file:text-xs file:font-medium file:bg-[#0059A0] file:text-white file:border-0 file:rounded-lg"
                  />
                  <p className="text-xs text-[#9CA3AF] mt-1">{t('payslip_file_hint')}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#1F2937] mb-1.5">{t('payslip_description')}</label>
                  <input
                    type="text"
                    value={uploadForm.description}
                    onChange={(e) => setUploadForm(p => ({ ...p, description: e.target.value }))}
                    placeholder={t('payslip_description_placeholder')}
                    className="w-full h-10 px-3 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:border-[#0059A0] text-[#1F2937] placeholder:text-[#9CA3AF]"
                  />
                </div>
              </form>
            </div>

            <div className="shrink-0 p-6 pt-0 flex gap-3">
              <button
                type="button"
                onClick={() => setUploadOpen(false)}
                className="flex-1 h-10 border border-[#E5E7EB] text-sm text-[#6B7280] rounded-xl hover:bg-[#F5F8FB] transition-colors"
              >
                {t('action_cancel')}
              </button>
              <button
                type="submit"
                form="payslip-form"
                disabled={uploading}
                className="flex-1 h-10 bg-[#0059A0] text-white text-sm font-medium rounded-xl hover:bg-[#1F4E87] disabled:opacity-60 transition-colors"
              >
                {uploading ? t('action_sending') : t('action_send')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
