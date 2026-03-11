"use client"

import { SessionProvider } from "next-auth/react"
import { LanguageProvider } from "@/components/providers/language-provider"
import { NotificationProvider } from "@/components/providers/notification-provider"
import { LiveDataProvider } from "@/components/providers/live-data-provider"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <LanguageProvider>
        <NotificationProvider>
          <LiveDataProvider>
            {children}
          </LiveDataProvider>
        </NotificationProvider>
      </LanguageProvider>
    </SessionProvider>
  )
}
