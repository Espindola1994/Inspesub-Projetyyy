import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import { AttendanceCalendar } from "@/components/attendance/attendance-calendar"

export const metadata = { title: "Presença" }

interface SearchParams {
  month?: string
  year?: string
  userId?: string
}

export default async function PresencaPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const params = await searchParams
  const now = new Date()
  const year = parseInt(params.year ?? String(now.getFullYear()))
  const month = parseInt(params.month ?? String(now.getMonth() + 1))

  const isAdmin = ["admin_master", "rh"].includes(session.user.role)
  const targetUserId = isAdmin && params.userId ? params.userId : session.user.id

  // Check if month is closed
  const monthClosing = await db.attendanceMonthClosing.findFirst({
    where: { userId: targetUserId, year, month },
  })

  // Get attendance records for the month
  const startDate = new Date(year, month - 1, 1)
  const endDate = new Date(year, month, 0)

  const records = await db.attendanceRecord.findMany({
    where: {
      userId: targetUserId,
      date: { gte: startDate, lte: endDate },
    },
    orderBy: { date: "asc" },
  })

  // If admin, get list of users for filter
  let users: { id: string; name: string; profile: { position: string | null } | null }[] = []
  if (isAdmin) {
    users = await db.user.findMany({
      where: { status: "active" },
      select: {
        id: true,
        name: true,
        profile: { select: { position: true } },
      },
      orderBy: { name: "asc" },
    })
  }

  // Target user info
  const targetUser = targetUserId === session.user.id
    ? { id: session.user.id, name: session.user.name }
    : await db.user.findUnique({
        where: { id: targetUserId },
        select: { id: true, name: true },
      })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1F2937]">Presença</h1>
          <p className="text-sm text-[#6B7280] mt-0.5">
            {isAdmin && targetUser?.id !== session.user.id
              ? `Visualizando: ${targetUser?.name}`
              : "Registre seus dias trabalhados"}
          </p>
        </div>
      </div>

      <AttendanceCalendar
        year={year}
        month={month}
        records={records.map((r) => ({
          id: r.id,
          date: r.date.toISOString(),
          status: r.status,
          observation: r.observation,
        }))}
        isClosed={!!monthClosing}
        isAdmin={isAdmin}
        userId={targetUserId}
        users={users}
        currentUserId={session.user.id}
      />
    </div>
  )
}
