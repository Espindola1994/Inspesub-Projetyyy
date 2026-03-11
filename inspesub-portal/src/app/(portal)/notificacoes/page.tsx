import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import { NotificationsModule } from "@/components/notifications/notifications-module"

export const metadata = { title: "Notificações" }

export default async function NotificacoesPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const notifications = await db.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1F2937]">Notificações</h1>
        <p className="text-sm text-[#6B7280] mt-0.5">Suas notificações e alertas</p>
      </div>
      <NotificationsModule notifications={notifications as any} />
    </div>
  )
}
