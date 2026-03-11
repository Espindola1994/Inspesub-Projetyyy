"use client"

import { createContext, useContext, useEffect, useRef, useState, useCallback } from "react"
import { useSession } from "next-auth/react"
import { createPortal } from "react-dom"
import Link from "next/link"
import { FileText, X } from "lucide-react"

/* ─── Types ─────────────────────────────────────────────────────────────── */
interface NotificationCtx {
  unreadCount: number
}

interface PayslipAlert {
  id: string
  title: string
  message: string
}

/* ─── Context ────────────────────────────────────────────────────────────── */
const NotificationContext = createContext<NotificationCtx>({ unreadCount: 0 })

export function useNotifications() {
  return useContext(NotificationContext)
}

/* ─── Sound via Web Audio API (no external files needed) ─────────────────── */
function playPayslipChime() {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!AudioCtx) return

    const ctx = new AudioCtx()

    // Play a pleasant two-tone chime
    const notes = [523.25, 659.25, 783.99] // C5, E5, G5
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.type = "sine"
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.15)
      gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.15)
      gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + i * 0.15 + 0.05)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.15 + 0.5)

      osc.start(ctx.currentTime + i * 0.15)
      osc.stop(ctx.currentTime + i * 0.15 + 0.6)
    })
  } catch {
    // Silently fail if AudioContext is blocked (e.g. no user interaction yet)
  }
}

/* ─── Toast Component ────────────────────────────────────────────────────── */
function PayslipToast({ alert, onDismiss }: { alert: PayslipAlert; onDismiss: () => void }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Trigger enter animation
    const t1 = setTimeout(() => setVisible(true), 30)
    // Auto-dismiss after 7 seconds
    const t2 = setTimeout(() => {
      setVisible(false)
      setTimeout(onDismiss, 350)
    }, 7000)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [onDismiss])

  function handleDismiss() {
    setVisible(false)
    setTimeout(onDismiss, 350)
  }

  return createPortal(
    <div
      className="fixed bottom-6 right-6 z-[99999] transition-all duration-350"
      style={{
        transform: visible ? "translateY(0) scale(1)" : "translateY(24px) scale(0.95)",
        opacity: visible ? 1 : 0,
        transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)",
      }}
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-[#E5E7EB] w-80 overflow-hidden">
        {/* Accent bar */}
        <div className="h-1 bg-gradient-to-r from-emerald-400 to-emerald-600" />

        <div className="p-4">
          <div className="flex items-start gap-3">
            {/* Icon */}
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
              <FileText className="w-5 h-5 text-emerald-600" />
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#1F2937] leading-tight">{alert.title}</p>
              <p className="text-xs text-[#6B7280] mt-0.5 leading-relaxed">{alert.message}</p>
            </div>

            {/* Close */}
            <button
              onClick={handleDismiss}
              className="p-1 rounded-lg hover:bg-[#F5F8FB] text-[#9CA3AF] transition-colors flex-shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* CTA */}
          <Link
            href="/contracheques"
            onClick={handleDismiss}
            className="mt-3 w-full flex items-center justify-center h-8 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-medium rounded-xl transition-colors"
          >
            Ver contracheque →
          </Link>
        </div>
      </div>
    </div>,
    document.body
  )
}

/* ─── Provider ───────────────────────────────────────────────────────────── */
const POLL_INTERVAL = 30_000 // 30 seconds

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const [unreadCount, setUnreadCount] = useState(0)
  const [activeAlert, setActiveAlert] = useState<PayslipAlert | null>(null)
  const lastPayslipIdRef = useRef<string | null>(null)
  const isFirstPollRef = useRef(true)

  const poll = useCallback(async () => {
    if (!session?.user) return
    try {
      const res = await fetch("/api/notifications/unread-count")
      if (!res.ok) return
      const data: { count: number; latestPayslip: PayslipAlert | null } = await res.json()

      setUnreadCount(data.count)

      // Only alert if this is NOT the first poll (avoid alerting on login)
      // and if we have a new payslip that we haven't seen before
      if (
        !isFirstPollRef.current &&
        data.latestPayslip &&
        data.latestPayslip.id !== lastPayslipIdRef.current
      ) {
        lastPayslipIdRef.current = data.latestPayslip.id
        playPayslipChime()
        setActiveAlert(data.latestPayslip)
      }

      // On first poll, just record the current state as baseline
      if (isFirstPollRef.current) {
        isFirstPollRef.current = false
        if (data.latestPayslip) {
          lastPayslipIdRef.current = data.latestPayslip.id
        }
      }
    } catch {
      // Network errors — silently ignore
    }
  }, [session?.user])

  useEffect(() => {
    if (status !== "authenticated") return

    // Run immediately on mount
    poll()

    const interval = setInterval(poll, POLL_INTERVAL)
    return () => clearInterval(interval)
  }, [status, poll])

  return (
    <NotificationContext.Provider value={{ unreadCount }}>
      {children}
      {activeAlert && (
        <PayslipToast
          alert={activeAlert}
          onDismiss={() => setActiveAlert(null)}
        />
      )}
    </NotificationContext.Provider>
  )
}
