import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import { RdoModule } from "@/components/rdo/rdo-module"

export const metadata = { title: "RDO" }

export default async function RdoPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const isAdmin = ["admin_master", "rh"].includes(session.user.role)
  const isSupervisor = session.user.role === "supervisor"

  // Get teams for this user
  let teamsQuery: { id: string; name: string; code: string }[] = []

  if (isAdmin) {
    teamsQuery = await db.team.findMany({
      where: { isActive: true },
      select: { id: true, name: true, code: true },
      orderBy: { code: "asc" },
    })
  } else {
    const memberships = await db.teamMember.findMany({
      where: { userId: session.user.id, isActive: true },
      include: { team: { select: { id: true, name: true, code: true } } },
    })
    teamsQuery = memberships.map((m) => m.team)
  }

  // Get RDO records
  const whereClause = isAdmin
    ? {}
    : { teamId: { in: teamsQuery.map((t) => t.id) } }

  const rdos = await db.rdoRecord.findMany({
    where: whereClause,
    include: {
      team: { select: { id: true, name: true, code: true } },
      author: { select: { id: true, name: true } },
      reviewer: { select: { id: true, name: true } },
      files: { select: { id: true, fileName: true, fileUrl: true } },
    },
    orderBy: { date: "desc" },
    take: 50,
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1F2937]">RDO</h1>
        <p className="text-sm text-[#6B7280] mt-0.5">Relatório Diário de Obra</p>
      </div>
      <RdoModule
        rdos={rdos as any}
        teams={teamsQuery}
        isAdmin={isAdmin}
        isSupervisor={isSupervisor}
        currentUserId={session.user.id}
        currentUserName={session.user.name}
      />
    </div>
  )
}
