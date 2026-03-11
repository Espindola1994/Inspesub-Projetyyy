import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export async function PATCH(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })

    if (session.user.role !== "admin_master") {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 })
    }

    const { settings } = await request.json()

    for (const [key, value] of Object.entries(settings)) {
      await db.setting.update({
        where: { key },
        data: { value: String(value), updatedBy: session.user.id },
      })
    }

    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action: "settings_changed",
        description: "Configurações atualizadas",
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[SETTINGS_PATCH]", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
