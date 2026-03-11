"use client"

import { useState } from "react"
import { Sidebar } from "./sidebar"
import { Header } from "./header"
import { cn } from "@/lib/utils"
import { AvatarProvider } from "@/components/providers/avatar-provider"

interface PortalLayoutProps {
  children: React.ReactNode
  pageTitle?: string
  avatarUrl?: string | null
}

export function PortalLayout({ children, pageTitle, avatarUrl = null }: PortalLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <AvatarProvider initialUrl={avatarUrl}>
    <div className="flex h-screen overflow-hidden bg-[#F5F8FB]">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Mobile */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 lg:hidden transition-transform duration-300",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <Sidebar />
      </div>

      {/* Sidebar - Desktop */}
      <div className="hidden lg:flex flex-shrink-0">
        <Sidebar collapsed={sidebarCollapsed} />
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
          pageTitle={pageTitle}
        />

        <main className="flex-1 overflow-y-auto">
          <div className="p-6 max-w-screen-2xl mx-auto animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
    </AvatarProvider>
  )
}
