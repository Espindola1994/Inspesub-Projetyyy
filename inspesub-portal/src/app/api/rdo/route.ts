import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { z } from "zod"

const rdoSchema = z.object({
  teamId: z.string(),
  date: z.string(),
  location: z.string().min(1),
  vessel: z.string().optional(),
  serviceDescription: z.string().min(1),
  workedHours: z.number().min(0).max(24),
  operationalConditions: z.string().optional(),
  equipmentUsed: z.string().optional(),
  occurrences: z.string().optional(),
  responsibleName: z.string().min(1),
})

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })

    const body = await request.json()
    const validation = rdoSchema.safeParse(body)
    if (!validation.success) return NextResponse.json({ error: "Dados inválidos" }, { status: 400 })

    const data = validation.data

    const rdo = await db.rdoRecord.create({
      data: {
        teamId: data.teamId,
        authorId: session.user.id,
        date: new Date(data.date + "T12:00:00Z"),
        location: data.location,
        vessel: data.vessel || null,
        serviceDescription: data.serviceDescription,
        workedHours: data.workedHours,
        operationalConditions: data.operationalConditions || null,
        equipmentUsed: data.equipmentUsed || null,
        occurrences: data.occurrences || null,
        responsibleName: data.responsibleName,
        status: "pending",
      },
    })

    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action: "rdo_submitted",
        description: `RDO criado: ${data.date} - ${data.location}`,
        metadata: { rdoId: rdo.id, teamId: data.teamId },
      },
    })

    return NextResponse.json({ data: rdo }, { status: 201 })
  } catch (error) {
    console.error("[RDO_POST]", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })

    const rdos = await db.rdoRecord.findMany({
      include: {
        team: { select: { id: true, name: true, code: true } },
        author: { select: { id: true, name: true } },
        files: true,
      },
      orderBy: { date: "desc" },
    })

    return NextResponse.json({ data: rdos })
  } catch (error) {
    console.error("[RDO_GET]", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
