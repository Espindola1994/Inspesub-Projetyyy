"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Building2, Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"

const NAV_LINKS = [
  { label: "Início", href: "/" },
  { label: "Sobre", href: "/sobre" },
  { label: "Serviços", href: "/servicos" },
  { label: "Tecnologia ROV", href: "/tecnologia" },
  { label: "Soluções", href: "/solucoes" },
  { label: "Contato", href: "/contato" },
]

export function PublicNav() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-[#E5E7EB]"
          : "bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#0059A0] flex items-center justify-center shadow-sm">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <span
                className={cn(
                  "text-base font-bold tracking-tight transition-colors",
                  scrolled ? "text-[#0059A0]" : "text-white"
                )}
              >
                INSPESUB
              </span>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-3.5 py-2 rounded-lg text-sm font-medium transition-all",
                  pathname === link.href
                    ? scrolled
                      ? "text-[#0059A0] bg-blue-50"
                      : "text-white bg-white/20"
                    : scrolled
                    ? "text-[#6B7280] hover:text-[#0059A0] hover:bg-[#F5F8FB]"
                    : "text-white/80 hover:text-white hover:bg-white/10"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* CTA */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              href="/login"
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                scrolled
                  ? "text-[#0059A0] hover:bg-blue-50"
                  : "text-white/90 hover:text-white hover:bg-white/10"
              )}
            >
              Entrar
            </Link>
            <Link
              href="/cadastro"
              className="px-4 py-2 bg-[#FF7A2F] text-white text-sm font-semibold rounded-lg hover:bg-[#FF9A4A] transition-all shadow-sm"
            >
              Solicitar Acesso
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className={cn(
              "lg:hidden p-2 rounded-lg transition-colors",
              scrolled
                ? "text-[#1F2937] hover:bg-[#F5F8FB]"
                : "text-white hover:bg-white/10"
            )}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-white border-t border-[#E5E7EB] shadow-lg">
          <div className="px-4 py-4 space-y-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  pathname === link.href
                    ? "bg-blue-50 text-[#0059A0]"
                    : "text-[#6B7280] hover:bg-[#F5F8FB] hover:text-[#0059A0]"
                )}
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-3 border-t border-[#E5E7EB] flex flex-col gap-2">
              <Link
                href="/login"
                className="block text-center py-2.5 border border-[#0059A0] text-[#0059A0] text-sm font-medium rounded-lg"
                onClick={() => setMobileOpen(false)}
              >
                Entrar
              </Link>
              <Link
                href="/cadastro"
                className="block text-center py-2.5 bg-[#FF7A2F] text-white text-sm font-semibold rounded-lg"
                onClick={() => setMobileOpen(false)}
              >
                Solicitar Acesso
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
