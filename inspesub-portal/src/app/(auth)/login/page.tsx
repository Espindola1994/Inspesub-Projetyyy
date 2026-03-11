"use client"

import { useState, Suspense } from "react"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff, Building2, AlertCircle, Clock } from "lucide-react"

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const status = searchParams.get("status")

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        const errorMessages: Record<string, string> = {
          "Conta aguardando aprovação": "Sua conta está aguardando aprovação do administrador.",
          "Conta rejeitada": "Sua conta foi rejeitada. Entre em contato com o RH.",
          "Conta inativa ou suspensa": "Sua conta está inativa ou suspensa.",
          "Senha incorreta": "Email ou senha incorretos.",
          "Usuário não encontrado": "Email ou senha incorretos.",
          "Credenciais inválidas": "Preencha email e senha.",
        }
        setError(errorMessages[result.error] ?? "Erro ao fazer login. Tente novamente.")
      } else {
        router.push("/dashboard")
        router.refresh()
      }
    } catch {
      setError("Erro inesperado. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-8">
      {/* Logo */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-14 h-14 rounded-2xl bg-[#0059A0] flex items-center justify-center mb-4 shadow-lg">
          <Building2 className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-[#1F2937] tracking-tight">INSPESUB</h1>
        <p className="text-sm text-[#6B7280] mt-1">Portal Corporativo</p>
      </div>

      {/* Status alerts */}
      {status === "pending" && (
        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl mb-6">
          <Clock className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-amber-800">Conta em análise</p>
            <p className="text-xs text-amber-700 mt-0.5">
              Seu cadastro está aguardando aprovação. Você será notificado por email.
            </p>
          </div>
        </div>
      )}

      {status === "rejected" && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl mb-6">
          <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-red-800">Conta rejeitada</p>
            <p className="text-xs text-red-700 mt-0.5">
              Entre em contato com o RH para mais informações.
            </p>
          </div>
        </div>
      )}

      {status === "approved" && (
        <div className="flex items-start gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl mb-6">
          <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-white text-[10px] font-bold">✓</span>
          </div>
          <div>
            <p className="text-sm font-medium text-emerald-800">Conta aprovada!</p>
            <p className="text-xs text-emerald-700 mt-0.5">
              Sua conta foi aprovada. Faça login para acessar o portal.
            </p>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
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
            className="w-full h-11 px-4 border border-[#E5E7EB] rounded-xl text-sm text-[#1F2937] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#0059A0] focus:ring-2 focus:ring-[#0059A0]/10 transition-all"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-sm font-medium text-[#1F2937]">Senha</label>
            <Link
              href="/esqueci-senha"
              className="text-xs text-[#0059A0] hover:underline"
            >
              Esqueci minha senha
            </Link>
          </div>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full h-11 px-4 pr-11 border border-[#E5E7EB] rounded-xl text-sm text-[#1F2937] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#0059A0] focus:ring-2 focus:ring-[#0059A0]/10 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#6B7280] transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
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
          className="w-full h-11 bg-[#0059A0] hover:bg-[#1F4E87] text-white font-semibold text-sm rounded-xl transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm hover:shadow-[0_4px_14px_0_rgba(0,89,160,0.3)]"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Entrando...
            </>
          ) : (
            "Entrar no Portal"
          )}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-[#6B7280]">
          Não tem conta?{" "}
          <Link href="/cadastro" className="text-[#0059A0] font-medium hover:underline">
            Solicitar acesso
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="bg-white rounded-2xl p-8 text-center text-[#6B7280]">Carregando...</div>}>
      <LoginForm />
    </Suspense>
  )
}
