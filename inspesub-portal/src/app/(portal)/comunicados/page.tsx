import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import { AnnouncementsModule } from "@/components/announcements/announcements-module"

export const metadata = { title: "Comunicados" }

export default async function ComunicadosPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const isAdmin = ["admin_master", "rh"].includes(session.user.role)

  const announcements = await db.announcement.findMany({
    where: { isPublished: true },
    include: {
      author: { select: { id: true, name: true, role: true } },
    },
    orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1F2937]">Comunicados</h1>
        <p className="text-sm text-[#6B7280] mt-0.5">Avisos e informações da empresa</p>
      </div>
      <AnnouncementsModule
        announcements={announcements as any}
        isAdmin={isAdmin}
        currentUserId={session.user.id}
      />
    </div>
  )
}
