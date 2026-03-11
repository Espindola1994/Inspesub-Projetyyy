import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { z } from "zod"
import type { AttendanceStatus } from "@prisma/client"

const attendanceSchema = z.object({
  userId: z.string(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  status: z.enum([
    "worked", "day_off", "embarked", "disembarked",
    "training", "vacation", "medical_leave", "justified_absence", "not_informed",
  ]),
  observation: z.string().nullable().optional(),
})

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })

    const body = await request.json()
    const validation = attendanceSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 })
    }

    const { userId, date, status, observation } = validation.data

    // Só admin/rh pode editar presença de outros
    const isAdmin = ["admin_master", "rh"].includes(session.user.role)
    if (userId !== session.user.id && !isAdmin) {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 })
    }

    // Check if month is closed (non-admin)
    const dateObj = new Date(date + "T12:00:00Z")
    const year = dateObj.getUTCFullYear()
    const month = dateObj.getUTCMonth() + 1

    const closing = await db.attendanceMonthClosing.findFirst({
      where: { userId, year, month },
    })

    if (closing && !isAdmin) {
      return NextResponse.json({ error: "Mês fechado" }, { status: 403 })
    }

    const record = await db.attendanceRecord.upsert({
      where: { userId_date: { userId, date: new Date(date + "T12:00:00Z") } },
      create: {
        userId,
        date: new Date(date + "T12:00:00Z"),
        status: status as AttendanceStatus,
        observation: observation ?? null,
      },
      update: {
        status: status as AttendanceStatus,
        observation: observation ?? null,
        updatedAt: new Date(),
      },
    })

    // Audit log
    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action: "attendance_marked",
        description: `Presença marcada para ${date}: ${status}`,
        metadata: { targetUserId: userId, date, status },
      },
    })

    return NextResponse.json({ data: record })
  } catch (error) {
    console.error("[ATTENDANCE_POST]", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId") ?? session.user.id
    const date = searchParams.get("date")

    if (!date) return NextResponse.json({ error: "Data obrigatória" }, { status: 400 })

    const isAdmin = ["admin_master", "rh"].includes(session.user.role)
    if (userId !== session.user.id && !isAdmin) {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 })
    }

    const dateObj = new Date(date + "T12:00:00Z")
    const year = dateObj.getUTCFullYear()
    const month = dateObj.getUTCMonth() + 1

    const closing = await db.attendanceMonthClosing.findFirst({ where: { userId, year, month } })
    if (closing && !isAdmin) {
      return NextResponse.json({ error: "Mês fechado" }, { status: 403 })
    }

    await db.attendanceRecord.deleteMany({
      where: { userId, date: dateObj },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[ATTENDANCE_DELETE]", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId") ?? session.user.id
    const year = parseInt(searchParams.get("year") ?? String(new Date().getFullYear()))
    const month = parseInt(searchParams.get("month") ?? String(new Date().getMonth() + 1))

    const isAdmin = ["admin_master", "rh", "supervisor"].includes(session.user.role)
    if (userId !== session.user.id && !isAdmin) {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 })
    }

    const records = await db.attendanceRecord.findMany({
      where: {
        userId,
        date: {
          gte: new Date(year, month - 1, 1),
          lte: new Date(year, month, 0, 23, 59, 59),
        },
      },
      orderBy: { date: "asc" },
    })

    return NextResponse.json({ data: records })
  } catch (error) {
    console.error("[ATTENDANCE_GET]", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
