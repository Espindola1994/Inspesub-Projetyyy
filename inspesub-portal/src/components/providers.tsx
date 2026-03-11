"use client"

import { SessionProvider } from "next-auth/react"
import { LanguageProvider } from "@/components/providers/language-provider"
import { NotificationProvider } from "@/components/providers/notification-provider"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <LanguageProvider>
        <NotificationProvider>
          {children}
        </NotificationProvider>
      </LanguageProvider>
    </SessionProvider>
  )
}
