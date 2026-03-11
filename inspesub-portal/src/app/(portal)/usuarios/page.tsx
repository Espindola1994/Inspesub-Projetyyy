import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import { UsersModule } from "@/components/users/users-module"

export const metadata = { title: "Usuários" }

export default async function UsuariosPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>
}) {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const isAdmin = ["admin_master", "rh"].includes(session.user.role)
  if (!isAdmin) redirect("/dashboard")

  const params = await searchParams
  const filter = params.filter

  const users = await db.user.findMany({
    where: undefined,
    include: {
      profile: true,
      teamMemberships: {
        where: { isActive: true },
        include: { team: { select: { id: true, name: true, code: true } } },
      },
      approvals: { orderBy: { requestedAt: "desc" }, take: 1 },
    },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1F2937]">Usuários</h1>
        <p className="text-sm text-[#6B7280] mt-0.5">Gestão de contas e aprovações</p>
      </div>
      <UsersModule
        users={users as any}
        isAdmin={true}
        currentFilter={filter}
      />
    </div>
  )
}
