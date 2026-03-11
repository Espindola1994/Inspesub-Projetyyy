import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import { SettingsModule } from "@/components/settings/settings-module"

export const metadata = { title: "Configurações" }

export default async function ConfiguracoesPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  if (session.user.role !== "admin_master") redirect("/dashboard")

  const settings = await db.setting.findMany({
    orderBy: [{ group: "asc" }, { key: "asc" }],
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1F2937]">Configurações</h1>
        <p className="text-sm text-[#6B7280] mt-0.5">Configurações gerais do sistema</p>
      </div>
      <SettingsModule settings={settings as any} />
    </div>
  )
}
