/**
 * Middleware leve para proteção de rotas.
 * Não importa NextAuth completo (evita limite de 1MB no Vercel Edge).
 * Verifica apenas a existência do cookie JWT do NextAuth.
 * A validação real da sessão acontece nos Server Components (src/app/(portal)/layout.tsx).
 */
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const PUBLIC_ROUTES = ["/", "/sobre", "/servicos", "/tecnologia", "/solucoes", "/contato"]
const AUTH_ROUTES = ["/login", "/cadastro", "/esqueci-senha"]
const PORTAL_PREFIXES = [
  "/dashboard", "/presenca", "/contracheques", "/equipes", "/rdo",
  "/documentos", "/comunicados", "/notificacoes", "/perfil",
  "/usuarios", "/relatorios", "/auditoria", "/configuracoes",
]

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Rotas públicas — sem verificação
  if (PUBLIC_ROUTES.some((r) => pathname === r || pathname.startsWith(r + "/"))) {
    return NextResponse.next()
  }

  // Rotas de auth — sem verificação
  if (AUTH_ROUTES.some((r) => pathname.startsWith(r))) {
    return NextResponse.next()
  }

  // Rotas do portal — verifica cookie JWT do NextAuth
  const isPortalRoute = PORTAL_PREFIXES.some((p) => pathname.startsWith(p))
  if (isPortalRoute) {
    // NextAuth v5 usa "authjs.session-token" em produção e "authjs.session-token" em dev
    const sessionToken =
      request.cookies.get("authjs.session-token")?.value ??
      request.cookies.get("__Secure-authjs.session-token")?.value

    if (!sessionToken) {
      return NextResponse.redirect(new URL("/login", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|images|icons).*)"],
}
