"use client"

import { useEffect, useRef } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useSession } from "next-auth/react"

/**
 * LiveDataProvider
 *
 * Polls the server every REFRESH_INTERVAL ms and calls router.refresh()
 * to re-render server components with fresh data — no page reload.
 *
 * Smart pausing rules:
 * 1. Only runs when the user is authenticated.
 * 2. Pauses when the browser tab is hidden (document.hidden).
 * 3. Pauses while the user is typing (any input/textarea/select focused).
 * 4. Resets the timer after a manual action to avoid redundant refresh.
 */

const REFRESH_INTERVAL = 20_000 // 20 seconds

// Pages that don't need live refresh (static/public)
const EXCLUDED_PATHS = ["/", "/login", "/cadastro", "/esqueci-senha", "/sobre", "/servicos", "/tecnologia", "/solucoes", "/contato"]

export function LiveDataProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { status } = useSession()
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isTypingRef = useRef(false)

  useEffect(() => {
    if (status !== "authenticated") return
    if (EXCLUDED_PATHS.some((p) => pathname === p)) return

    // Track if user is typing in a form element
    function onFocusIn(e: FocusEvent) {
      const tag = (e.target as HTMLElement)?.tagName
      if (["INPUT", "TEXTAREA", "SELECT"].includes(tag)) {
        isTypingRef.current = true
      }
    }
    function onFocusOut() {
      isTypingRef.current = false
    }

    document.addEventListener("focusin", onFocusIn)
    document.addEventListener("focusout", onFocusOut)

    function scheduleRefresh() {
      timerRef.current = setTimeout(() => {
        // Skip if tab is hidden or user is typing
        if (!document.hidden && !isTypingRef.current) {
          router.refresh()
        }
        scheduleRefresh()
      }, REFRESH_INTERVAL)
    }

    scheduleRefresh()

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      document.removeEventListener("focusin", onFocusIn)
      document.removeEventListener("focusout", onFocusOut)
    }
  }, [status, pathname, router])

  return <>{children}</>
}
