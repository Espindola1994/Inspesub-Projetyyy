import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import { ProfileModule } from "@/components/profile/profile-module"

export const metadata = { title: "Meu Perfil" }

export default async function PerfilPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const [user, teamMembership] = await Promise.all([
    db.user.findUnique({
      where: { id: session.user.id },
      include: { profile: true },
    }),
    db.teamMember.findFirst({
      where: { userId: session.user.id, isActive: true },
      include: { team: { include: { supervisor: { select: { id: true, name: true } } } } },
    }),
  ])

  if (!user) redirect("/login")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1F2937]">Meu Perfil</h1>
        <p className="text-sm text-[#6B7280] mt-0.5">Suas informações cadastrais</p>
      </div>
      <ProfileModule user={user as any} teamMembership={teamMembership as any} />
    </div>
  )
}
