"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Send, Pin } from "lucide-react"

const CATEGORIES = [
  { value: "general", label: "Geral" },
  { value: "hr", label: "RH" },
  { value: "operational", label: "Operacional" },
  { value: "training", label: "Treinamento" },
  { value: "safety", label: "Segurança" },
]

export function NewAnnouncementForm() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    title: "",
    content: "",
    category: "general",
    isPinned: false,
  })

  function set(key: string, value: string | boolean) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim() || !form.content.trim()) return
    setSaving(true)
    try {
      const res = await fetch("/api/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        router.push("/comunicados")
        router.refresh()
      } else {
        const err = await res.json().catch(() => ({}))
        alert(err.error ?? "Erro ao criar comunicado")
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {/* Back */}
      <Link
        href="/comunicados"
        className="inline-flex items-center gap-1.5 text-sm text-[#6B7280] hover:text-[#1F2937] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar para Comunicados
      </Link>

      <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 space-y-5">
        {/* Title */}
        <div>
          <label className="block text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-1.5">
            Título *
          </label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder="Ex: Reunião de equipe – março 2026"
            required
            className="w-full h-10 px-3 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:border-[#0059A0] focus:ring-1 focus:ring-[#0059A0]/20 text-[#1F2937] placeholder:text-[#9CA3AF]"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-1.5">
            Categoria
          </label>
          <select
            value={form.category}
            onChange={(e) => set("category", e.target.value)}
            className="w-full h-10 px-3 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:border-[#0059A0] text-[#1F2937] bg-white"
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        {/* Content */}
        <div>
          <label className="block text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-1.5">
            Conteúdo *
          </label>
          <textarea
            value={form.content}
            onChange={(e) => set("content", e.target.value)}
            placeholder="Escreva o comunicado aqui..."
            rows={6}
            required
            className="w-full px-3 py-2.5 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:border-[#0059A0] focus:ring-1 focus:ring-[#0059A0]/20 resize-none text-[#1F2937] placeholder:text-[#9CA3AF]"
          />
        </div>

        {/* Pin toggle */}
        <label className="flex items-center gap-3 cursor-pointer select-none">
          <div
            onClick={() => set("isPinned", !form.isPinned)}
            className={`w-9 h-5 rounded-full transition-colors flex items-center px-0.5 ${
              form.isPinned ? "bg-[#0059A0]" : "bg-[#D1D5DB]"
            }`}
          >
            <div
              className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${
                form.isPinned ? "translate-x-4" : "translate-x-0"
              }`}
            />
          </div>
          <div className="flex items-center gap-1.5 text-sm text-[#1F2937]">
            <Pin className="w-3.5 h-3.5 text-[#6B7280]" />
            Fixar comunicado no topo
          </div>
        </label>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <Link
          href="/comunicados"
          className="px-4 py-2 text-sm text-[#6B7280] border border-[#E5E7EB] rounded-lg hover:bg-[#F5F8FB] transition-colors"
        >
          Cancelar
        </Link>
        <button
          type="submit"
          disabled={saving || !form.title.trim() || !form.content.trim()}
          className="flex items-center gap-2 px-5 py-2 bg-[#0059A0] text-white text-sm font-medium rounded-lg hover:bg-[#1F4E87] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          <Send className="w-4 h-4" />
          {saving ? "Publicando..." : "Publicar Comunicado"}
        </button>
      </div>
    </form>
  )
}
