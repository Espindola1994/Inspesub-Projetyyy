import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import { PortalLayout } from "@/components/layout/portal-layout"

export default async function PortalGroupLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  if (session.user.status === "pending") {
    redirect("/login?status=pending")
  }

  if (session.user.status === "rejected") {
    redirect("/login?status=rejected")
  }

  const profile = await db.employeeProfile.findUnique({
    where: { userId: session.user.id },
    select: { avatarUrl: true },
  })

  return <PortalLayout avatarUrl={profile?.avatarUrl ?? null}>{children}</PortalLayout>
}
