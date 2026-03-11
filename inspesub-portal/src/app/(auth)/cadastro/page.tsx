"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Building2, Eye, EyeOff, CheckCircle, AlertCircle } from "lucide-react"

export default function CadastroPage() {
  const router = useRouter()
  const [step, setStep] = useState<"form" | "success">("form")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    position: "",
    phone: "",
  })

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setError("")
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (formData.password.length < 8) {
      setError("A senha deve ter pelo menos 8 caracteres.")
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError("As senhas não coincidem.")
      return
    }

    setLoading(true)

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          position: formData.position,
          phone: formData.phone,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? "Erro ao criar conta. Tente novamente.")
      } else {
        setStep("success")
      }
    } catch {
      setError("Erro inesperado. Verifique sua conexão.")
    } finally {
      setLoading(false)
    }
  }

  if (step === "success") {
    return (
      <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-5">
          <CheckCircle className="w-8 h-8 text-emerald-500" />
        </div>
        <h2 className="text-xl font-bold text-[#1F2937] mb-2">Solicitação enviada!</h2>
        <p className="text-sm text-[#6B7280] mb-6 leading-relaxed">
          Seu cadastro foi recebido e está aguardando aprovação do administrador.
          Você receberá uma notificação quando sua conta for aprovada.
        </p>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#0059A0] text-white text-sm font-medium rounded-xl hover:bg-[#1F4E87] transition-colors"
        >
          Voltar ao login
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-8">
      {/* Logo */}
      <div className="flex flex-col items-center mb-7">
        <div className="w-12 h-12 rounded-2xl bg-[#0059A0] flex items-center justify-center mb-3 shadow-lg">
          <Building2 className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-xl font-bold text-[#1F2937]">Solicitar Acesso</h1>
        <p className="text-xs text-[#6B7280] mt-1">INSPESUB Portal Corporativo</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#1F2937] mb-1.5">
              Nome completo <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Seu nome completo"
              required
              className="w-full h-10 px-3 border border-[#E5E7EB] rounded-lg text-sm text-[#1F2937] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#0059A0] focus:ring-2 focus:ring-[#0059A0]/10"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1F2937] mb-1.5">
              Email corporativo <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="seu@email.com"
              required
              className="w-full h-10 px-3 border border-[#E5E7EB] rounded-lg text-sm text-[#1F2937] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#0059A0] focus:ring-2 focus:ring-[#0059A0]/10"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-1.5">
                Cargo
              </label>
              <input
                type="text"
                name="position"
                value={formData.position}
                onChange={handleChange}
                placeholder="Ex: Técnico ROV"
                className="w-full h-10 px-3 border border-[#E5E7EB] rounded-lg text-sm text-[#1F2937] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#0059A0] focus:ring-2 focus:ring-[#0059A0]/10"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-1.5">
                Telefone
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="(00) 00000-0000"
                className="w-full h-10 px-3 border border-[#E5E7EB] rounded-lg text-sm text-[#1F2937] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#0059A0] focus:ring-2 focus:ring-[#0059A0]/10"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1F2937] mb-1.5">
              Senha <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Mínimo 8 caracteres"
                required
                minLength={8}
                className="w-full h-10 px-3 pr-10 border border-[#E5E7EB] rounded-lg text-sm text-[#1F2937] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#0059A0] focus:ring-2 focus:ring-[#0059A0]/10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#6B7280]"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1F2937] mb-1.5">
              Confirmar senha <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Repita a senha"
              required
              className="w-full h-10 px-3 border border-[#E5E7EB] rounded-lg text-sm text-[#1F2937] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#0059A0] focus:ring-2 focus:ring-[#0059A0]/10"
            />
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-red-700">{error}</p>
          </div>
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
            "Solicitar Acesso"
          )}
        </button>
      </form>

      <p className="text-center text-sm text-[#6B7280] mt-5">
        Já tem conta?{" "}
        <Link href="/login" className="text-[#0059A0] font-medium hover:underline">
          Fazer login
        </Link>
      </p>
    </div>
  )
}
