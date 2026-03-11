"use client"

import { useState } from "react"
import Link from "next/link"
import { Building2, ArrowLeft, Mail, CheckCircle } from "lucide-react"

export default function EsqueciSenhaPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      if (res.ok) {
        setSent(true)
      } else {
        const data = await res.json()
        setError(data.error ?? "Erro ao processar solicitação.")
      }
    } catch {
      setError("Erro inesperado. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-5">
          <Mail className="w-8 h-8 text-[#0059A0]" />
        </div>
        <h2 className="text-xl font-bold text-[#1F2937] mb-2">Email enviado!</h2>
        <p className="text-sm text-[#6B7280] mb-6 leading-relaxed">
          Se o email <strong>{email}</strong> estiver cadastrado, você receberá
          as instruções para redefinir sua senha em breve.
        </p>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-sm text-[#0059A0] hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar ao login
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-8">
      <div className="flex flex-col items-center mb-7">
        <div className="w-12 h-12 rounded-2xl bg-[#0059A0] flex items-center justify-center mb-3 shadow-lg">
          <Building2 className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-xl font-bold text-[#1F2937]">Recuperar Senha</h1>
        <p className="text-xs text-[#6B7280] mt-1 text-center">
          Digite seu email para receber as instruções
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[#1F2937] mb-1.5">
            Email corporativo
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            required
            className="w-full h-11 px-4 border border-[#E5E7EB] rounded-xl text-sm text-[#1F2937] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#0059A0] focus:ring-2 focus:ring-[#0059A0]/10"
          />
        </div>

        {error && (
          <p className="text-xs text-red-600">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full h-11 bg-[#0059A0] hover:bg-[#1F4E87] text-white font-semibold text-sm rounded-xl transition-all disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Enviando...
            </>
          ) : (
            "Enviar instruções"
          )}
        </button>
      </form>

      <div className="mt-5 text-center">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-sm text-[#6B7280] hover:text-[#0059A0] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar ao login
        </Link>
      </div>
    </div>
  )
}
