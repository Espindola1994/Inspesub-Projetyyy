"use client"

import { useState } from "react"
import Link from "next/link"
import { MapPin, Phone, Mail, Clock, Send, CheckCircle, Building2 } from "lucide-react"

const CONTACT_INFO = [
  {
    icon: MapPin,
    label: "Endereço",
    value: "Av. Atlântica, 1234 – Sala 501\nNiterói, RJ – 24020-001",
  },
  {
    icon: Phone,
    label: "Telefone",
    value: "(21) 3456-7890\n(21) 98765-4321 (WhatsApp)",
  },
  {
    icon: Mail,
    label: "E-mail",
    value: "contato@inspesub.com.br\ncomercial@inspesub.com.br",
  },
  {
    icon: Clock,
    label: "Horário de Atendimento",
    value: "Segunda a Sexta: 08h – 18h\nSábado: 08h – 12h",
  },
]

const SUBJECTS = [
  "Orçamento de serviços",
  "Inspeção subaquática",
  "Trabalhos em altura",
  "Tecnologia ROV",
  "Parceria comercial",
  "Outros",
]

export default function ContatoPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    subject: "",
    message: "",
  })
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    // Simulate submission
    await new Promise((resolve) => setTimeout(resolve, 1200))
    setLoading(false)
    setSent(true)
  }

  return (
    <div className="pt-16">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-[#0059A0] to-[#1F4E87] py-24 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
              backgroundSize: "40px 40px",
            }}
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 mb-6">
            <Mail className="w-4 h-4 text-white" />
            <span className="text-sm font-medium text-white">Entre em contato</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Fale com a <span className="text-[#FF7A2F]">INSPESUB</span>
          </h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            Estamos prontos para atender sua demanda. Preencha o formulário
            ou entre em contato pelos nossos canais de atendimento.
          </p>
        </div>
      </section>

      <section className="py-20 bg-[#F5F8FB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-10">
            {/* Contact info */}
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-[#1F2937] mb-2">Informações de contato</h2>
                <p className="text-sm text-[#6B7280]">
                  Atendemos todo o Brasil. Nossa sede fica no Rio de Janeiro.
                </p>
              </div>

              {CONTACT_INFO.map((item) => {
                const Icon = item.icon
                return (
                  <div key={item.label} className="flex gap-4">
                    <div className="w-10 h-10 bg-[#0059A0]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-[#0059A0]" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-1">
                        {item.label}
                      </p>
                      {item.value.split("\n").map((line) => (
                        <p key={line} className="text-sm text-[#1F2937]">{line}</p>
                      ))}
                    </div>
                  </div>
                )
              })}

              <div className="pt-4 border-t border-[#E5E7EB]">
                <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-3">
                  Acesso ao Portal Colaborador
                </p>
                <div className="flex flex-col gap-2">
                  <Link
                    href="/login"
                    className="flex items-center justify-center gap-2 py-2.5 border border-[#0059A0] text-[#0059A0] text-sm font-medium rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    <Building2 className="w-4 h-4" />
                    Acessar Portal
                  </Link>
                  <Link
                    href="/cadastro"
                    className="flex items-center justify-center gap-2 py-2.5 bg-[#FF7A2F] text-white text-sm font-semibold rounded-lg hover:bg-[#FF9A4A] transition-colors"
                  >
                    Solicitar Acesso
                  </Link>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl border border-[#E5E7EB] p-8">
                {sent ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
                      <CheckCircle className="w-8 h-8 text-green-500" />
                    </div>
                    <h3 className="text-xl font-bold text-[#1F2937] mb-2">
                      Mensagem enviada com sucesso!
                    </h3>
                    <p className="text-[#6B7280] mb-6">
                      Recebemos sua mensagem e retornaremos em até 1 dia útil.
                    </p>
                    <button
                      onClick={() => { setSent(false); setForm({ name: "", email: "", phone: "", company: "", subject: "", message: "" }) }}
                      className="px-6 py-2.5 border border-[#E5E7EB] text-[#6B7280] text-sm font-medium rounded-lg hover:bg-[#F5F8FB] transition-colors"
                    >
                      Enviar outra mensagem
                    </button>
                  </div>
                ) : (
                  <>
                    <h2 className="text-xl font-bold text-[#1F2937] mb-6">Envie uma mensagem</h2>
                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-1.5">
                            Nome *
                          </label>
                          <input
                            required
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            placeholder="Seu nome completo"
                            className="w-full h-10 px-3 border border-[#E5E7EB] rounded-lg text-sm text-[#1F2937] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#0059A0] focus:ring-1 focus:ring-[#0059A0]"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-1.5">
                            E-mail *
                          </label>
                          <input
                            required
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            placeholder="seu@email.com"
                            className="w-full h-10 px-3 border border-[#E5E7EB] rounded-lg text-sm text-[#1F2937] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#0059A0] focus:ring-1 focus:ring-[#0059A0]"
                          />
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-1.5">
                            Telefone
                          </label>
                          <input
                            name="phone"
                            value={form.phone}
                            onChange={handleChange}
                            placeholder="(00) 00000-0000"
                            className="w-full h-10 px-3 border border-[#E5E7EB] rounded-lg text-sm text-[#1F2937] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#0059A0] focus:ring-1 focus:ring-[#0059A0]"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-1.5">
                            Empresa
                          </label>
                          <input
                            name="company"
                            value={form.company}
                            onChange={handleChange}
                            placeholder="Nome da empresa"
                            className="w-full h-10 px-3 border border-[#E5E7EB] rounded-lg text-sm text-[#1F2937] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#0059A0] focus:ring-1 focus:ring-[#0059A0]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-1.5">
                          Assunto *
                        </label>
                        <select
                          required
                          name="subject"
                          value={form.subject}
                          onChange={handleChange}
                          className="w-full h-10 px-3 border border-[#E5E7EB] rounded-lg text-sm text-[#1F2937] focus:outline-none focus:border-[#0059A0] focus:ring-1 focus:ring-[#0059A0] bg-white"
                        >
                          <option value="">Selecione o assunto</option>
                          {SUBJECTS.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-1.5">
                          Mensagem *
                        </label>
                        <textarea
                          required
                          name="message"
                          value={form.message}
                          onChange={handleChange}
                          rows={5}
                          placeholder="Descreva sua necessidade ou projeto..."
                          className="w-full px-3 py-2.5 border border-[#E5E7EB] rounded-lg text-sm text-[#1F2937] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#0059A0] focus:ring-1 focus:ring-[#0059A0] resize-none"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 h-11 bg-[#0059A0] text-white text-sm font-semibold rounded-xl hover:bg-[#1F4E87] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                      >
                        {loading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Enviando...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            Enviar Mensagem
                          </>
                        )}
                      </button>
                    </form>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
