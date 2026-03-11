import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import { AdminDashboard } from "@/components/dashboard/admin-dashboard"
import { MemberDashboard } from "@/components/dashboard/member-dashboard"
import { RhDashboard } from "@/components/dashboard/rh-dashboard"
import { SupervisorDashboard } from "@/components/dashboard/supervisor-dashboard"

export const metadata = { title: "Dashboard" }

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const role = session.user.role

  // Fetch data according to role
  if (role === "admin_master") {
    const now = new Date()
    const thisYear = now.getFullYear()
    const thisMonth = now.getMonth() + 1 // 1-indexed
    const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

    const [totalUsers, pendingApprovals, teams, payslipsThisMonth, expiringDocuments, rdoPending, announcements, recentLogs] = await Promise.all([
      db.user.count({ where: { status: "active" } }),
      db.user.count({ where: { status: "pending" } }),
      db.team.count({ where: { isActive: true } }),
      db.payslip.count({ where: { year: thisYear, month: thisMonth } }),
      db.document.count({
        where: {
          expiresAt: { gte: now, lte: in30Days },
        },
      }),
      db.rdoRecord.count({ where: { status: "submitted" } }),
      db.announcement.findMany({
        where: { isPublished: true },
        include: { author: { select: { id: true, name: true, email: true, role: true, status: true } } },
        orderBy: { createdAt: "desc" },
        take: 3,
      }),
      db.auditLog.findMany({
        include: { user: { select: { id: true, name: true, email: true, role: true, status: true } } },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ])

    return (
      <AdminDashboard
        data={{
          totalEmployees: totalUsers,
          pendingApprovals,
          totalTeams: teams,
          activeTeams: teams,
          monthAttendanceClosed: 0,
          payslipsThisMonth,
          rdoPending,
          expiringDocuments,
          recentAuditLogs: recentLogs,
          announcements: announcements as any,
        }}
      />
    )
  }

  if (role === "rh") {
    const [totalUsers, pendingApprovals, teams] = await Promise.all([
      db.user.count({ where: { status: "active" } }),
      db.user.count({ where: { status: "pending" } }),
      db.team.count({ where: { isActive: true } }),
    ])

    return (
      <RhDashboard
        data={{ totalEmployees: totalUsers, pendingApprovals, totalTeams: teams }}
      />
    )
  }

  if (role === "supervisor") {
    const teamMembership = await db.teamMember.findFirst({
      where: { userId: session.user.id, isActive: true },
      include: { team: true },
    })

    return <SupervisorDashboard team={teamMembership?.team ?? null} />
  }

  // member
  const [profile, teamMembership, latestPayslip, unreadNotifications, announcements] =
    await Promise.all([
      db.employeeProfile.findUnique({ where: { userId: session.user.id } }),
      db.teamMember.findFirst({
        where: { userId: session.user.id, isActive: true },
        include: { team: true },
      }),
      db.payslip.findFirst({
        where: { employeeId: session.user.id },
        orderBy: [{ year: "desc" }, { month: "desc" }],
      }),
      db.notification.count({
        where: { userId: session.user.id, isRead: false },
      }),
      db.announcement.findMany({
        where: { isPublished: true },
        orderBy: { createdAt: "desc" },
        take: 3,
      }),
    ])

  const now = new Date()
  const attendanceMonth = await db.attendanceRecord.findMany({
    where: {
      userId: session.user.id,
      date: {
        gte: new Date(now.getFullYear(), now.getMonth(), 1),
        lte: new Date(now.getFullYear(), now.getMonth() + 1, 0),
      },
    },
  })

  const attendanceSummary = {
    worked: attendanceMonth.filter((r) => r.status === "worked").length,
    dayOff: attendanceMonth.filter((r) => r.status === "day_off").length,
    embarked: attendanceMonth.filter((r) => r.status === "embarked").length,
    vacation: attendanceMonth.filter((r) => r.status === "vacation").length,
    notInformed: attendanceMonth.filter((r) => r.status === "not_informed").length,
    total: attendanceMonth.length,
  }

  return (
    <MemberDashboard
      user={session.user}
      profile={profile}
      team={teamMembership?.team ?? null}
      attendanceSummary={attendanceSummary}
      latestPayslip={latestPayslip}
      unreadNotifications={unreadNotifications}
      announcements={announcements as any}
    />
  )
}
