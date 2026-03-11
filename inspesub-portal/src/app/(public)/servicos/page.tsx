import { Metadata } from "next"
import Link from "next/link"
import {
  Waves,
  Wrench,
  Camera,
  FileCheck,
  HardHat,
  Layers,
  CheckCircle,
  ArrowRight,
} from "lucide-react"

export const metadata: Metadata = { title: "Serviços – INSPESUB" }

const SERVICES = [
  {
    icon: Waves,
    title: "Inspeção Subaquática",
    description:
      "Inspeção visual e dimensional de estruturas submersas como pilares, barragens, adutoras, dolfins portuários e fundações. Realizada por mergulhadores profissionais certificados com registro fotográfico e videográfico completo.",
    features: [
      "Inspeção em profundidades de até 50m",
      "Registro fotográfico e videográfico HD",
      "Relatório técnico detalhado com laudos",
      "Medições de corrosão e espessura",
    ],
    color: "bg-blue-50",
    accent: "text-[#0059A0]",
    border: "border-blue-100",
  },
  {
    icon: HardHat,
    title: "Trabalhos em Altura",
    description:
      "Serviços de inspeção, manutenção e pintura em estruturas elevadas como torres, pontes, silos e coberturas industriais. Equipe certificada NR-35 com equipamentos de proteção homologados.",
    features: [
      "Certificação NR-35 para toda equipe",
      "Inspeção de estruturas metálicas e concreto",
      "Serviços de pintura e tratamento anticorrosivo",
      "Relatório fotográfico com mapeamento",
    ],
    color: "bg-orange-50",
    accent: "text-[#FF7A2F]",
    border: "border-orange-100",
  },
  {
    icon: Camera,
    title: "Inspeção com ROV",
    description:
      "Utilização de Veículos Operados Remotamente (ROVs) para inspeção em locais de difícil acesso, ambientes de alto risco ou profundidades extremas, com transmissão de vídeo em tempo real.",
    features: [
      "ROVs de última geração com câmeras 4K",
      "Inspeção sem limitação de profundidade",
      "Transmissão ao vivo para equipe técnica",
      "Exportação de dados georreferenciados",
    ],
    color: "bg-purple-50",
    accent: "text-purple-600",
    border: "border-purple-100",
  },
  {
    icon: Wrench,
    title: "Manutenção Subaquática",
    description:
      "Serviços de manutenção e reparo em estruturas submersas, incluindo instalação de dispositivos, soldagem subaquática, limpeza de tomadas d'água e manutenção de grades e comportas.",
    features: [
      "Soldagem subaquática certificada",
      "Limpeza e desobstrução de tubulações",
      "Instalação de anodos de sacrifício",
      "Reparo de revestimentos e anticorrosivos",
    ],
    color: "bg-green-50",
    accent: "text-green-600",
    border: "border-green-100",
  },
  {
    icon: FileCheck,
    title: "Laudos e Relatórios Técnicos",
    description:
      "Elaboração de laudos técnicos completos, relatórios de inspeção com análise de integridade estrutural, recomendações de manutenção e planos de ação corretiva/preventiva.",
    features: [
      "Laudos assinados por engenheiro responsável",
      "ART (Anotação de Responsabilidade Técnica)",
      "Análise de risco e priorização de intervenções",
      "Relatórios digitais com fotos georreferenciadas",
    ],
    color: "bg-yellow-50",
    accent: "text-yellow-600",
    border: "border-yellow-100",
  },
  {
    icon: Layers,
    title: "Serviços Especializados",
    description:
      "Serviços específicos para setores como petróleo & gás, usinas hidrelétricas, saneamento e infraestrutura portuária, com metodologias adaptadas às normas setoriais.",
    features: [
      "Inspeção de plataformas offshore",
      "Inspeção de tomadas d'água em usinas",
      "Batimetria e levantamentos hidrográficos",
      "Desobstrução de emissários submarinos",
    ],
    color: "bg-red-50",
    accent: "text-red-600",
    border: "border-red-100",
  },
]

const SECTORS = [
  "Energia Elétrica e Usinas Hidrelétricas",
  "Petróleo, Gás e Petroquímica",
  "Saneamento e Abastecimento de Água",
  "Portos, Terminais e Hidrovias",
  "Obras Civis e Infraestrutura",
  "Indústria e Manutenção Industrial",
]

export default function ServicosPage() {
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
            <Wrench className="w-4 h-4 text-white" />
            <span className="text-sm font-medium text-white">O que fazemos</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Nossos <span className="text-[#FF7A2F]">Serviços</span>
          </h1>
          <p className="text-lg text-white/80 max-w-3xl mx-auto">
            Soluções completas em inspeção subaquática e em altura, com tecnologia
            avançada e equipes altamente especializadas.
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8">
            {SERVICES.map((service) => {
              const Icon = service.icon
              return (
                <div
                  key={service.title}
                  className={`rounded-2xl border ${service.border} p-8 ${service.color}`}
                >
                  <div className="flex items-start gap-4 mb-5">
                    <div className={`w-12 h-12 rounded-xl bg-white flex items-center justify-center flex-shrink-0 shadow-sm`}>
                      <Icon className={`w-6 h-6 ${service.accent}`} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-[#1F2937] mb-1">{service.title}</h3>
                      <p className="text-sm text-[#4B5563] leading-relaxed">{service.description}</p>
                    </div>
                  </div>
                  <ul className="space-y-2">
                    {service.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2.5">
                        <CheckCircle className={`w-4 h-4 ${service.accent} flex-shrink-0`} />
                        <span className="text-sm text-[#4B5563]">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Sectors */}
      <section className="py-20 bg-[#F5F8FB] border-y border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#1F2937] mb-4">Setores atendidos</h2>
            <p className="text-[#6B7280] max-w-2xl mx-auto">
              Atendemos os principais setores da economia que demandam inspeção especializada.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {SECTORS.map((sector) => (
              <div
                key={sector}
                className="bg-white rounded-xl border border-[#E5E7EB] p-4 flex items-center gap-3"
              >
                <div className="w-2 h-2 rounded-full bg-[#0059A0] flex-shrink-0" />
                <span className="text-sm font-medium text-[#1F2937]">{sector}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-[#1F2937] mb-4">
            Precisa de um orçamento?
          </h2>
          <p className="text-[#6B7280] mb-8 max-w-xl mx-auto">
            Entre em contato com nossa equipe técnica. Analisamos suas necessidades
            e preparamos uma proposta personalizada.
          </p>
          <Link
            href="/contato"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#0059A0] text-white font-semibold rounded-xl hover:bg-[#1F4E87] transition-all shadow-md"
          >
            Solicitar Orçamento
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  )
}
