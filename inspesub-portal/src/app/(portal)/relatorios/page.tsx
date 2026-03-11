import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import { ReportsModule } from "@/components/reports/reports-module"

export const metadata = { title: "Relatórios" }

export default async function RelatoriosPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const canAccess = ["admin_master", "rh", "supervisor"].includes(session.user.role)
  if (!canAccess) redirect("/dashboard")

  const employees = await db.user.findMany({
    where: { status: "active" },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  })

  const teams = await db.team.findMany({
    where: { isActive: true },
    select: { id: true, name: true, code: true },
    orderBy: { code: "asc" },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1F2937]">Relatórios</h1>
        <p className="text-sm text-[#6B7280] mt-0.5">Exportações e relatórios gerenciais</p>
      </div>
      <ReportsModule employees={employees} teams={teams} />
    </div>
  )
}
