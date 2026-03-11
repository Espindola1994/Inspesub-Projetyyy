import { Metadata } from "next"
import Link from "next/link"
import { Building2, Target, Eye, Heart, Users, Award, Shield, Zap } from "lucide-react"

export const metadata: Metadata = { title: "Sobre a INSPESUB – Tecnologia em Inspeções" }

const VALUES = [
  {
    icon: Shield,
    title: "Segurança",
    description: "Priorizamos a segurança em todas as operações, com protocolos rigorosos e equipamentos homologados.",
  },
  {
    icon: Award,
    title: "Excelência",
    description: "Comprometidos com a mais alta qualidade técnica em cada inspeção e laudo emitido.",
  },
  {
    icon: Zap,
    title: "Inovação",
    description: "Utilizamos as mais avançadas tecnologias, incluindo ROVs e drones subaquáticos de última geração.",
  },
  {
    icon: Heart,
    title: "Responsabilidade",
    description: "Atuamos com responsabilidade socioambiental, respeitando os ecossistemas aquáticos.",
  },
]

const NUMBERS = [
  { value: "15+", label: "Anos de experiência" },
  { value: "500+", label: "Projetos concluídos" },
  { value: "50+", label: "Especialistas técnicos" },
  { value: "8", label: "Estados atendidos" },
]

export default function SobrePage() {
  return (
    <div className="pt-16">
      {/* Hero */}
      <section className="relative bg-[#0059A0] py-24 overflow-hidden">
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
            <Building2 className="w-4 h-4 text-white" />
            <span className="text-sm font-medium text-white">Nossa história</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Sobre a <span className="text-[#FF7A2F]">INSPESUB</span>
          </h1>
          <p className="text-lg text-white/80 max-w-3xl mx-auto">
            Há mais de 15 anos transformando a segurança de estruturas subaquáticas no Brasil
            com tecnologia de ponta e equipes altamente qualificadas.
          </p>
        </div>
      </section>

      {/* Mission / Vision / Values */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="bg-[#F5F8FB] rounded-2xl p-8 border border-[#E5E7EB]">
              <div className="w-12 h-12 bg-[#0059A0] rounded-xl flex items-center justify-center mb-5">
                <Target className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl font-bold text-[#1F2937] mb-3">Missão</h2>
              <p className="text-[#4B5563] leading-relaxed">
                Prover serviços de inspeção subaquática e em altura com máxima segurança,
                precisão técnica e agilidade, garantindo a integridade de ativos críticos
                e contribuindo para a segurança operacional de nossos clientes.
              </p>
            </div>
            <div className="bg-[#0059A0] rounded-2xl p-8">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-5">
                <Eye className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl font-bold text-white mb-3">Visão</h2>
              <p className="text-white/80 leading-relaxed">
                Ser a empresa de referência nacional em inspeção de infraestrutura aquática
                e industrial, reconhecida pela excelência técnica, inovação tecnológica
                e compromisso com a sustentabilidade.
              </p>
            </div>
            <div className="bg-[#F5F8FB] rounded-2xl p-8 border border-[#E5E7EB]">
              <div className="w-12 h-12 bg-[#FF7A2F] rounded-xl flex items-center justify-center mb-5">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl font-bold text-[#1F2937] mb-3">Valores</h2>
              <p className="text-[#4B5563] leading-relaxed">
                Segurança acima de tudo, excelência técnica, inovação contínua, ética
                e transparência nas relações, responsabilidade socioambiental e valorização
                das pessoas que compõem nossa equipe.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Numbers */}
      <section className="py-16 bg-[#F5F8FB] border-y border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {NUMBERS.map((item) => (
              <div key={item.label} className="text-center">
                <p className="text-4xl font-bold text-[#0059A0] mb-2">{item.value}</p>
                <p className="text-sm text-[#6B7280]">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* History */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold text-[#1F2937] mb-6">
                Uma trajetória de <span className="text-[#0059A0]">excelência</span>
              </h2>
              <div className="space-y-5 text-[#4B5563] leading-relaxed">
                <p>
                  Fundada em 2009, a INSPESUB nasceu da visão de engenheiros especializados
                  que identificaram a necessidade de serviços de inspeção subaquática mais
                  seguros e tecnologicamente avançados no mercado brasileiro.
                </p>
                <p>
                  Ao longo dos anos, investimos continuamente em tecnologia e capacitação,
                  sendo pioneiros na introdução de ROVs (Veículos Operados Remotamente) para
                  inspeção de estruturas portuárias e hidrelétricas no Brasil.
                </p>
                <p>
                  Hoje, atendemos clientes nos setores de energia, petróleo e gás, saneamento,
                  portos e obras civis, com uma equipe multidisciplinar de mergulhadores
                  profissionais, engenheiros e técnicos certificados.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#F5F8FB] rounded-2xl p-6 border border-[#E5E7EB]">
                <Users className="w-8 h-8 text-[#0059A0] mb-3" />
                <h3 className="font-semibold text-[#1F2937] mb-2">Equipe Especializada</h3>
                <p className="text-sm text-[#6B7280]">
                  Profissionais certificados em mergulho profissional, inspeção NR-35 e operação de ROV.
                </p>
              </div>
              <div className="bg-[#FF7A2F]/10 rounded-2xl p-6 border border-[#FF7A2F]/20">
                <Award className="w-8 h-8 text-[#FF7A2F] mb-3" />
                <h3 className="font-semibold text-[#1F2937] mb-2">Certificações</h3>
                <p className="text-sm text-[#6B7280]">
                  ISO 9001, ABNT NBR 7481, certificações IMCA para mergulho profissional.
                </p>
              </div>
              <div className="bg-[#0059A0]/10 rounded-2xl p-6 border border-[#0059A0]/20 col-span-2">
                <Shield className="w-8 h-8 text-[#0059A0] mb-3" />
                <h3 className="font-semibold text-[#1F2937] mb-2">Segurança em Primeiro Lugar</h3>
                <p className="text-sm text-[#6B7280]">
                  Zero acidentes graves em mais de 15 anos de operação. Nosso programa de HSE
                  é reconhecido como referência no setor.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-[#F5F8FB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#1F2937] mb-4">Nossos valores</h2>
            <p className="text-[#6B7280] max-w-2xl mx-auto">
              Os princípios que guiam cada decisão e cada operação da INSPESUB.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALUES.map((value) => {
              const Icon = value.icon
              return (
                <div key={value.title} className="bg-white rounded-xl p-6 border border-[#E5E7EB] text-center">
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-6 h-6 text-[#0059A0]" />
                  </div>
                  <h3 className="font-semibold text-[#1F2937] mb-2">{value.title}</h3>
                  <p className="text-sm text-[#6B7280] leading-relaxed">{value.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-[#0059A0]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Quer fazer parte da nossa equipe?
          </h2>
          <p className="text-white/80 mb-8">
            Acesse nosso portal e solicite seu cadastro para colaboradores.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contato"
              className="px-8 py-3 border-2 border-white text-white font-semibold rounded-xl hover:bg-white/10 transition-all"
            >
              Fale Conosco
            </Link>
            <Link
              href="/cadastro"
              className="px-8 py-3 bg-[#FF7A2F] text-white font-semibold rounded-xl hover:bg-[#FF9A4A] transition-all"
            >
              Solicitar Acesso ao Portal
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
