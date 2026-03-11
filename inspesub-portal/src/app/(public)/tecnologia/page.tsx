import { Metadata } from "next"
import Link from "next/link"
import {
  Cpu,
  Camera,
  Radio,
  Wifi,
  BarChart3,
  Zap,
  Shield,
  Eye,
  ArrowRight,
  CheckCircle,
} from "lucide-react"

export const metadata: Metadata = { title: "Tecnologia ROV – INSPESUB" }

const ROV_SPECS = [
  { label: "Profundidade máxima", value: "300m" },
  { label: "Câmeras", value: "4K Ultra HD" },
  { label: "Luzes LED", value: "10.000 lúmens" },
  { label: "Braço manipulador", value: "6 DOF" },
  { label: "Sensores sonar", value: "Multi-beam" },
  { label: "Transmissão", value: "Tempo real" },
]

const TECH_FEATURES = [
  {
    icon: Camera,
    title: "Câmeras de Alta Definição",
    description:
      "Câmeras 4K com estabilização de imagem, zoom óptico e ajuste automático de exposição para ambientes subaquáticos de baixa luminosidade.",
  },
  {
    icon: Radio,
    title: "Sonar Multi-beam",
    description:
      "Sistema de sonar de múltiplos feixes para mapeamento 3D preciso de estruturas submersas, mesmo em águas turvas com visibilidade zero.",
  },
  {
    icon: Wifi,
    title: "Transmissão em Tempo Real",
    description:
      "Fibra óptica integrada ao cabo umbilical para transmissão de vídeo HD e dados em tempo real para a equipe de análise na superfície.",
  },
  {
    icon: Cpu,
    title: "Sistema de Posicionamento",
    description:
      "USBL (Ultra-Short Baseline) para posicionamento subaquático preciso com erro inferior a 0,5m, integrando com GPS de superfície.",
  },
  {
    icon: BarChart3,
    title: "Análise de Dados",
    description:
      "Software proprietário para processamento e análise de imagens, geração automática de relatórios e criação de modelos 3D das estruturas inspecionadas.",
  },
  {
    icon: Eye,
    title: "Visão Computacional",
    description:
      "Algoritmos de IA para detecção automática de anomalias, corrosão e danos estruturais durante a inspeção, aumentando a precisão dos relatórios.",
  },
]

const ADVANTAGES = [
  "Elimina riscos de mergulhadores em locais perigosos",
  "Opera em profundidades inacessíveis ao mergulho humano",
  "Reduz custos operacionais em até 40%",
  "Inspecciona áreas confinadas sem restrições",
  "Grava e reproduz inspeções para análise posterior",
  "Funciona em correntes de até 3 nós",
  "Operação 24h com troca rápida de baterias",
  "Dados georreferenciados para rastreabilidade",
]

export default function TecnologiaPage() {
  return (
    <div className="pt-16">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-[#003D7A] via-[#0059A0] to-[#1F4E87] py-24 overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
              backgroundSize: "30px 30px",
            }}
          />
        </div>
        {/* Decorative circles */}
        <div className="absolute top-20 right-20 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-48 h-48 bg-[#FF7A2F]/10 rounded-full blur-2xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 mb-6">
                <Cpu className="w-4 h-4 text-white" />
                <span className="text-sm font-medium text-white">Tecnologia de ponta</span>
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6">
                ROV – Veículo Operado<br />
                <span className="text-[#FF7A2F]">Remotamente</span>
              </h1>
              <p className="text-lg text-white/80 leading-relaxed mb-8">
                Nossa frota de ROVs de última geração permite inspecionar estruturas
                subaquáticas com precisão milimétrica, em profundidades e condições
                que seriam impossíveis para mergulhadores humanos.
              </p>
              <Link
                href="/contato"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#FF7A2F] text-white font-semibold rounded-xl hover:bg-[#FF9A4A] transition-all"
              >
                Solicitar Demonstração
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Specs card */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8">
              <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                <Zap className="w-5 h-5 text-[#FF7A2F]" />
                Especificações Técnicas
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {ROV_SPECS.map((spec) => (
                  <div key={spec.label} className="bg-white/10 rounded-xl p-4">
                    <p className="text-2xl font-bold text-white">{spec.value}</p>
                    <p className="text-xs text-white/60 mt-1">{spec.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-[#1F2937] mb-4">Como funciona</h2>
            <p className="text-[#6B7280] max-w-2xl mx-auto">
              O ROV é controlado por operadores especializados na superfície via cabo umbilical,
              transmitindo vídeo e dados em tempo real.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {TECH_FEATURES.map((feature) => {
              const Icon = feature.icon
              return (
                <div key={feature.title} className="bg-[#F5F8FB] rounded-xl p-6 border border-[#E5E7EB]">
                  <div className="w-11 h-11 bg-[#0059A0] rounded-xl flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-semibold text-[#1F2937] mb-2">{feature.title}</h3>
                  <p className="text-sm text-[#6B7280] leading-relaxed">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Advantages */}
      <section className="py-20 bg-[#0059A0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-white mb-4">
                Vantagens do ROV sobre o mergulho tradicional
              </h2>
              <p className="text-white/80 mb-8">
                A tecnologia ROV revoluciona a inspeção subaquática, oferecendo
                mais segurança, precisão e eficiência operacional.
              </p>
              <Link
                href="/servicos"
                className="inline-flex items-center gap-2 px-6 py-3 border-2 border-white text-white font-semibold rounded-xl hover:bg-white/10 transition-all"
              >
                Ver todos os serviços
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {ADVANTAGES.map((adv) => (
                <div key={adv} className="flex items-center gap-3 bg-white/10 border border-white/20 rounded-xl px-4 py-3">
                  <CheckCircle className="w-4 h-4 text-[#FF7A2F] flex-shrink-0" />
                  <span className="text-sm text-white">{adv}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Safety */}
      <section className="py-20 bg-[#F5F8FB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-10 text-center max-w-3xl mx-auto">
            <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Shield className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-[#1F2937] mb-4">
              Segurança em primeiro lugar
            </h2>
            <p className="text-[#6B7280] leading-relaxed mb-6">
              O uso de ROVs elimina a exposição humana a ambientes hostis — correntes fortes,
              gases tóxicos, baixas temperaturas e profundidades extremas. Nossa tecnologia
              mantém os inspetores seguros na superfície enquanto o veículo realiza a inspeção.
            </p>
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { value: "0", label: "Acidentes com ROV em operação" },
                { value: "300m", label: "Profundidade máxima operacional" },
                { value: "100%", label: "Operações seguras desde 2009" },
              ].map((stat) => (
                <div key={stat.label} className="bg-[#F5F8FB] rounded-xl p-4">
                  <p className="text-2xl font-bold text-[#0059A0]">{stat.value}</p>
                  <p className="text-xs text-[#6B7280] mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
