import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Providers } from "@/components/providers"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
})

export const metadata: Metadata = {
  title: {
    default: "INSPESUB Portal Corporativo",
    template: "%s | INSPESUB Portal",
  },
  description:
    "Portal corporativo interno da INSPESUB – Tecnologia em Inspeções. Gestão de equipes, presença, documentos e operações.",
  keywords: ["INSPESUB", "inspeção", "ROV", "offshore", "onshore", "portal corporativo"],
  authors: [{ name: "INSPESUB" }],
  robots: "noindex, nofollow",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
