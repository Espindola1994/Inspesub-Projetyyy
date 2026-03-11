import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ count: 0 })

    const count = await db.notification.count({
      where: { userId: session.user.id, isRead: false },
    })

    // Also return the most recent unread payslip notification if any
    const latestPayslip = await db.notification.findFirst({
      where: {
        userId: session.user.id,
        type: "new_payslip",
        isRead: false,
      },
      orderBy: { createdAt: "desc" },
      select: { id: true, title: true, message: true, createdAt: true },
    })

    return NextResponse.json({ count, latestPayslip })
  } catch (error) {
    console.error("[NOTIFICATIONS_UNREAD_COUNT]", error)
    return NextResponse.json({ count: 0, latestPayslip: null })
  }
}
