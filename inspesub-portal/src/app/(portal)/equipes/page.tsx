import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import { TeamsModule } from "@/components/teams/teams-module"

export const metadata = { title: "Equipes" }

export default async function EquipesPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const isAdmin = ["admin_master", "rh"].includes(session.user.role)

  const teams = await db.team.findMany({
    include: {
      supervisor: {
        select: { id: true, name: true, email: true, role: true, status: true, profile: { select: { position: true, avatarUrl: true } } },
      },
      members: {
        where: { isActive: true },
        include: {
          user: {
            select: { id: true, name: true, email: true, role: true, status: true, profile: { select: { position: true, avatarUrl: true } } },
          },
        },
      },
      _count: {
        select: { members: true, rdoRecords: true },
      },
    },
    orderBy: { code: "asc" },
  })

  const supervisors = await db.user.findMany({
    where: { status: "active", role: { in: ["supervisor", "admin_master"] } },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  })

  const employees = await db.user.findMany({
    where: { status: "active" },
    select: { id: true, name: true, email: true, profile: { select: { position: true } } },
    orderBy: { name: "asc" },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1F2937]">Equipes</h1>
        <p className="text-sm text-[#6B7280] mt-0.5">Gestão de equipes e membros</p>
      </div>
      <TeamsModule
        teams={teams as any}
        isAdmin={isAdmin}
        supervisors={supervisors}
        employees={employees as any}
        currentUserId={session.user.id}
      />
    </div>
  )
}
