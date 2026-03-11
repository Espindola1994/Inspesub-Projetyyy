import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { NewAnnouncementForm } from "@/components/announcements/new-announcement-form"

export const metadata = { title: "Novo Comunicado" }

export default async function NovoComunicadoPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const isAdmin = ["admin_master", "rh"].includes(session.user.role)
  if (!isAdmin) redirect("/comunicados")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1F2937]">Novo Comunicado</h1>
        <p className="text-sm text-[#6B7280] mt-0.5">
          Crie e publique um comunicado para todos os colaboradores
        </p>
      </div>
      <NewAnnouncementForm />
    </div>
  )
}
