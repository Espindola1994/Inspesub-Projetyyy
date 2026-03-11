import Link from "next/link"
import { Building2, Mail, Phone, MapPin, Linkedin, Instagram } from "lucide-react"

export function PublicFooter() {
  return (
    <footer className="bg-[#0F2540] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-10 h-10 rounded-xl bg-[#0059A0] flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-lg font-bold text-white">INSPESUB</p>
                <p className="text-xs text-blue-300">Tecnologia em Inspeções</p>
              </div>
            </div>
            <p className="text-sm text-[#94A3B8] leading-relaxed max-w-sm">
              Empresa especializada em inspeções subaquáticas, operações ROV e serviços
              técnicos de alta complexidade para o setor offshore e onshore.
            </p>
            <div className="flex items-center gap-3 mt-5">
              <a
                href="#"
                className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center hover:bg-[#0059A0] transition-colors"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center hover:bg-[#FF7A2F] transition-colors"
              >
                <Instagram className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Navegação</h4>
            <ul className="space-y-2.5">
              {[
                { label: "Sobre nós", href: "/sobre" },
                { label: "Serviços", href: "/servicos" },
                { label: "Tecnologia ROV", href: "/tecnologia" },
                { label: "Soluções", href: "/solucoes" },
                { label: "Contato", href: "/contato" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[#94A3B8] hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Contato</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-[#0B7FC1] mt-0.5 flex-shrink-0" />
                <span className="text-sm text-[#94A3B8]">contato@inspesub.com.br</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-[#0B7FC1] mt-0.5 flex-shrink-0" />
                <span className="text-sm text-[#94A3B8]">(21) 0000-0000</span>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#0B7FC1] mt-0.5 flex-shrink-0" />
                <span className="text-sm text-[#94A3B8]">Rio de Janeiro, RJ – Brasil</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#64748B]">
            © {new Date().getFullYear()} INSPESUB – Tecnologia em Inspeções. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-5">
            <Link href="#" className="text-xs text-[#64748B] hover:text-white transition-colors">
              Política de Privacidade
            </Link>
            <Link href="#" className="text-xs text-[#64748B] hover:text-white transition-colors">
              Termos de Uso
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
