import { Metadata } from "next"
import Link from "next/link"
import {
  Zap,
  Droplets,
  Ship,
  Factory,
  Building2,
  Leaf,
  ArrowRight,
  CheckCircle,
  Phone,
} from "lucide-react"

export const metadata: Metadata = { title: "Soluções – INSPESUB" }

const SOLUTIONS = [
  {
    icon: Zap,
    sector: "Energia Elétrica",
    title: "Usinas Hidrelétricas e PCHs",
    description:
      "Inspeção de barragens, tomadas d'água, túneis de adução, câmaras de carga e estruturas de concreto submerso. Identificação precoce de erosão, cavitação e infiltrações.",
    items: [
      "Inspeção de comportas e grades",
      "Inspeção de bueiros e galerias",
      "Monitoramento de recalques em fundações",
      "Inspeção de tubulações de pressão",
    ],
    color: "#0059A0",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
  },
  {
    icon: Droplets,
    sector: "Saneamento",
    title: "Abastecimento e Tratamento de Água",
    description:
      "Inspeção de captações, adutoras, reservatórios e emissários submarinos. Garantia da integridade das estruturas responsáveis pelo abastecimento público.",
    items: [
      "Inspeção de emissários submarinos",
      "Limpeza de tomadas d'água",
      "Inspeção de represas e barragens",
      "Inspeção de tubulações e adutoras",
    ],
    color: "#0EA5E9",
    bgColor: "bg-sky-50",
    borderColor: "border-sky-200",
  },
  {
    icon: Ship,
    sector: "Portos e Hidrovias",
    title: "Infraestrutura Portuária",
    description:
      "Inspeção de dolfins, píeres, cais, estacas e estruturas de acostamento. Avaliação da integridade estrutural e corrosão de elementos metálicos e concreto.",
    items: [
      "Inspeção de estacas e dolfins",
      "Batimetria e levantamentos de fundo",
      "Inspeção de pontoons e bóias",
      "Inspeção anticorrosiva de estruturas",
    ],
    color: "#FF7A2F",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
  },
  {
    icon: Factory,
    sector: "Petróleo & Gás",
    title: "Plataformas e Dutos",
    description:
      "Inspeção de plataformas offshore, risers, umbilicais, dutos submarinos e estruturas de ancoragem. Serviços de manutenção e intervenção subaquática especializada.",
    items: [
      "Inspeção de jaquetas e risers",
      "Inspeção de dutos e conexões",
      "Instalação de anodos catódicos",
      "Monitoramento de fouling biológico",
    ],
    color: "#7C3AED",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
  },
  {
    icon: Building2,
    sector: "Obras Civis",
    title: "Pontes, Pilares e Fundações",
    description:
      "Inspeção de fundações submersas de pontes, pilares de viadutos, muros de contenção e estruturas de contenção ribeirinha. Avaliação de erosão e recalques.",
    items: [
      "Inspeção de pilares de pontes",
      "Avaliação de erosão de fundações",
      "Inspeção de cortinas e barreiras",
      "Mapeamento de danos estruturais",
    ],
    color: "#059669",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
  },
  {
    icon: Leaf,
    sector: "Meio Ambiente",
    title: "Monitoramento Ambiental",
    description:
      "Levantamentos batimétricos, análises de qualidade de sedimentos, inspeção de barragens de rejeitos e monitoramento de ecossistemas aquáticos em áreas de operação.",
    items: [
      "Batimetria e levantamentos hidrográficos",
      "Coleta de amostras de sedimentos",
      "Inspeção de barragens de rejeitos",
      "Relatórios de impacto ambiental",
    ],
    color: "#16A34A",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
  },
]

export default function SolucoesPage() {
  return (
    <div className="pt-16">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-[#0059A0] to-[#003D7A] py-24 overflow-hidden">
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
            <Zap className="w-4 h-4 text-white" />
            <span className="text-sm font-medium text-white">Por setor</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Soluções por <span className="text-[#FF7A2F]">Setor</span>
          </h1>
          <p className="text-lg text-white/80 max-w-3xl mx-auto">
            Cada setor tem suas especificidades. A INSPESUB desenvolve metodologias
            customizadas para entregar o melhor resultado em cada segmento.
          </p>
        </div>
      </section>

      {/* Solutions */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8">
            {SOLUTIONS.map((solution) => {
              const Icon = solution.icon
              return (
                <div
                  key={solution.sector}
                  className={`rounded-2xl border ${solution.borderColor} ${solution.bgColor} p-8`}
                >
                  <div className="flex items-start gap-4 mb-6">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: solution.color + "20" }}
                    >
                      <Icon className="w-6 h-6" style={{ color: solution.color }} />
                    </div>
                    <div>
                      <span
                        className="text-xs font-semibold uppercase tracking-wider"
                        style={{ color: solution.color }}
                      >
                        {solution.sector}
                      </span>
                      <h3 className="text-lg font-bold text-[#1F2937] mt-0.5">{solution.title}</h3>
                    </div>
                  </div>
                  <p className="text-sm text-[#4B5563] leading-relaxed mb-5">
                    {solution.description}
                  </p>
                  <ul className="space-y-2">
                    {solution.items.map((item) => (
                      <li key={item} className="flex items-center gap-2.5">
                        <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: solution.color }} />
                        <span className="text-sm text-[#374151]">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-20 bg-[#F5F8FB] border-y border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-[#1F2937] mb-4">Como trabalhamos</h2>
            <p className="text-[#6B7280] max-w-2xl mx-auto">
              Um processo estruturado para garantir qualidade e rastreabilidade em cada projeto.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { step: "01", title: "Briefing", description: "Levantamento de requisitos, acesso ao local e definição de escopo técnico." },
              { step: "02", title: "Planejamento", description: "Elaboração do plano de trabalho, mobilização de equipe e equipamentos." },
              { step: "03", title: "Execução", description: "Inspeção em campo com registro fotográfico, videográfico e coleta de dados." },
              { step: "04", title: "Entrega", description: "Relatório técnico com laudos, recomendações e plano de ação corretiva." },
            ].map((phase) => (
              <div key={phase.step} className="bg-white rounded-xl border border-[#E5E7EB] p-6">
                <div className="text-4xl font-black text-[#0059A0]/20 mb-3">{phase.step}</div>
                <h3 className="font-semibold text-[#1F2937] mb-2">{phase.title}</h3>
                <p className="text-sm text-[#6B7280] leading-relaxed">{phase.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-[#0059A0]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Phone className="w-12 h-12 text-white/40 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-white mb-4">
            Encontre a solução ideal para o seu projeto
          </h2>
          <p className="text-white/80 mb-8 max-w-xl mx-auto">
            Nossa equipe técnica está pronta para entender suas necessidades
            e propor a melhor abordagem para seu caso específico.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contato"
              className="px-8 py-3.5 bg-white text-[#0059A0] font-semibold rounded-xl hover:bg-gray-50 transition-all"
            >
              Falar com um especialista
            </Link>
            <Link
              href="/servicos"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 border-2 border-white text-white font-semibold rounded-xl hover:bg-white/10 transition-all"
            >
              Ver todos os serviços
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
