import { PublicNav } from "@/components/layout/public-nav"
import { PublicFooter } from "@/components/layout/public-footer"
import Link from "next/link"
import {
  ArrowRight,
  Shield,
  Zap,
  Eye,
  Anchor,
  Waves,
  CheckCircle2,
  Award,
  Users,
  Globe,
  ChevronRight,
} from "lucide-react"

const SERVICES = [
  {
    icon: Waves,
    title: "Inspeções Subaquáticas",
    description:
      "Inspeções técnicas de estruturas subaquáticas com equipamentos de última geração e equipe certificada.",
    color: "bg-blue-50 text-[#0059A0]",
  },
  {
    icon: Eye,
    title: "Operação ROV",
    description:
      "Operação de Veículos Operados Remotamente (ROV) para inspeções em profundidades extremas e ambientes hostis.",
    color: "bg-orange-50 text-[#FF7A2F]",
  },
  {
    icon: Anchor,
    title: "Suporte Offshore",
    description:
      "Suporte técnico especializado para operações offshore, garantindo segurança e eficiência nas atividades.",
    color: "bg-indigo-50 text-indigo-600",
  },
  {
    icon: Shield,
    title: "Inspeção de Integridade",
    description:
      "Avaliação completa de integridade estrutural de dutos, plataformas e demais instalações submarinas.",
    color: "bg-emerald-50 text-emerald-600",
  },
  {
    icon: Zap,
    title: "Inspeções Onshore",
    description:
      "Serviços de inspeção em instalações onshore com metodologias avançadas e laudos técnicos detalhados.",
    color: "bg-amber-50 text-amber-600",
  },
  {
    icon: Globe,
    title: "Consultoria Técnica",
    description:
      "Consultoria especializada em projetos de inspeção, engenharia submarina e gestão de ativos.",
    color: "bg-purple-50 text-purple-600",
  },
]

const STATS = [
  { value: "+500", label: "Inspeções realizadas" },
  { value: "+15", label: "Anos de experiência" },
  { value: "+50", label: "Profissionais qualificados" },
  { value: "100%", label: "Compromisso com segurança" },
]

const DIFFERENTIALS = [
  "Equipe técnica certificada internacionalmente",
  "Equipamentos ROV de última geração",
  "Conformidade com normas ABNT, API e DNV",
  "Relatórios técnicos detalhados e rastreáveis",
  "Presença em projetos offshore e onshore",
  "Suporte 24/7 para operações críticas",
]

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <PublicNav />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-[#0F2540] via-[#0059A0] to-[#0B7FC1]">
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
              backgroundSize: "40px 40px",
            }}
          />
          <div className="absolute top-20 right-10 w-96 h-96 rounded-full bg-[#0B7FC1]/20 blur-3xl" />
          <div className="absolute bottom-20 left-10 w-64 h-64 rounded-full bg-[#FF7A2F]/10 blur-3xl" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 border border-white/20 rounded-full text-white text-sm font-medium mb-8 backdrop-blur-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-[#FF7A2F]" />
                Tecnologia em Inspeções Submarinas
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.1] tracking-tight mb-6">
                Precisão e tecnologia em{" "}
                <span className="text-[#FF7A2F]">cada operação</span>
              </h1>

              <p className="text-lg text-white/75 leading-relaxed mb-10 max-w-2xl">
                A INSPESUB é referência em inspeções técnicas subaquáticas, operações ROV
                e suporte offshore/onshore. Levamos expertise e tecnologia de ponta para os
                ambientes mais desafiadores.
              </p>

              <div className="flex flex-wrap items-center gap-4">
                <Link
                  href="/servicos"
                  className="inline-flex items-center gap-2 px-7 py-3.5 bg-[#FF7A2F] text-white font-semibold rounded-xl hover:bg-[#FF9A4A] transition-all shadow-lg shadow-orange-900/30"
                >
                  Nossos Serviços
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/contato"
                  className="inline-flex items-center gap-2 px-7 py-3.5 bg-white/10 border border-white/30 text-white font-medium rounded-xl hover:bg-white/20 backdrop-blur-sm transition-all"
                >
                  Fale Conosco
                </Link>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-16 pt-12 border-t border-white/10">
                {STATS.map((stat) => (
                  <div key={stat.label}>
                    <p className="text-3xl font-bold text-white">{stat.value}</p>
                    <p className="text-xs text-white/60 mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0">
            <svg viewBox="0 0 1440 80" fill="none">
              <path
                d="M0 80L1440 80L1440 40C1200 0 960 60 720 40C480 20 240 60 0 40L0 80Z"
                fill="#F5F8FB"
              />
            </svg>
          </div>
        </section>

        {/* Services */}
        <section className="py-24 bg-[#F5F8FB]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 border border-blue-100 rounded-full text-[#0059A0] text-sm font-medium mb-4">
                <Zap className="w-3.5 h-3.5" />
                Nossas Soluções
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-[#1F2937] mb-4">
                Serviços especializados para{" "}
                <span className="text-[#0059A0]">operações críticas</span>
              </h2>
              <p className="text-[#6B7280] max-w-2xl mx-auto">
                Combinamos tecnologia avançada, equipe qualificada e metodologias rigorosas
                para entregar resultados de excelência.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {SERVICES.map((service) => {
                const Icon = service.icon
                return (
                  <div
                    key={service.title}
                    className="bg-white rounded-2xl p-7 border border-[#E5E7EB] hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 group"
                  >
                    <div
                      className={`w-12 h-12 rounded-xl ${service.color} flex items-center justify-center mb-5`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-semibold text-[#1F2937] mb-2 group-hover:text-[#0059A0] transition-colors">
                      {service.title}
                    </h3>
                    <p className="text-sm text-[#6B7280] leading-relaxed">
                      {service.description}
                    </p>
                  </div>
                )
              })}
            </div>

            <div className="text-center mt-10">
              <Link
                href="/servicos"
                className="inline-flex items-center gap-2 text-[#0059A0] font-medium text-sm hover:gap-3 transition-all"
              >
                Ver todos os serviços
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* Differentials */}
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-orange-50 border border-orange-100 rounded-full text-[#FF7A2F] text-sm font-medium mb-5">
                  <Award className="w-3.5 h-3.5" />
                  Por que escolher a INSPESUB?
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold text-[#1F2937] mb-5 leading-tight">
                  Excelência técnica em{" "}
                  <span className="text-[#0059A0]">cada detalhe</span>
                </h2>
                <p className="text-[#6B7280] mb-8 leading-relaxed">
                  A INSPESUB foi fundada com a missão de oferecer serviços de inspeção
                  subaquática e operações ROV com o mais alto padrão de qualidade,
                  segurança e tecnologia do mercado.
                </p>
                <ul className="space-y-3">
                  {DIFFERENTIALS.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-[#0059A0] mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-[#1F2937]">{item}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/sobre"
                  className="inline-flex items-center gap-2 mt-8 px-6 py-3 bg-[#0059A0] text-white font-medium text-sm rounded-xl hover:bg-[#1F4E87] transition-colors"
                >
                  Conheça nossa história
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="relative">
                <div className="rounded-2xl bg-gradient-to-br from-[#0059A0] to-[#0B7FC1] p-10 text-white">
                  <Users className="w-12 h-12 text-white/40 mb-6" />
                  <h3 className="text-2xl font-bold mb-3">Portal Corporativo</h3>
                  <p className="text-white/75 text-sm leading-relaxed mb-6">
                    Acesse o portal interno da INSPESUB para gerenciar equipes, presenças,
                    documentos e relatórios operacionais em um único lugar.
                  </p>
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-[#0059A0] font-semibold text-sm rounded-xl hover:bg-[#F5F8FB] transition-colors"
                  >
                    Acessar Portal
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
                <div className="absolute -top-4 -right-4 w-24 h-24 rounded-2xl bg-[#FF7A2F]/10 -z-10" />
                <div className="absolute -bottom-4 -left-4 w-32 h-32 rounded-2xl bg-[#0059A0]/5 -z-10" />
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-gradient-to-r from-[#0059A0] to-[#0B7FC1]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Pronto para trabalhar com a INSPESUB?
            </h2>
            <p className="text-white/75 text-lg mb-8">
              Entre em contato com nossa equipe e descubra como podemos apoiar suas operações.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/contato"
                className="px-8 py-3.5 bg-[#FF7A2F] text-white font-semibold rounded-xl hover:bg-[#FF9A4A] transition-all shadow-lg"
              >
                Falar com a equipe
              </Link>
              <Link
                href="/servicos"
                className="px-8 py-3.5 bg-white/10 border border-white/30 text-white font-medium rounded-xl hover:bg-white/20 transition-all"
              >
                Ver serviços
              </Link>
            </div>
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  )
}
