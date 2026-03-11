import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export async function PATCH(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })

    const body = await request.json()
    const { name, phone, position, bio, birthDate,
      addressStreet, addressNumber, addressNeighborhood,
      addressCity, addressState, addressCountry } = body

    const profileData = {
      phone: phone || null,
      position: position || null,
      bio: bio || null,
      birthDate: birthDate ? new Date(birthDate) : null,
      addressStreet: addressStreet || null,
      addressNumber: addressNumber || null,
      addressNeighborhood: addressNeighborhood || null,
      addressCity: addressCity || null,
      addressState: addressState || null,
      addressCountry: addressCountry || null,
    }

    await db.$transaction([
      db.user.update({
        where: { id: session.user.id },
        data: { name: name || undefined },
      }),
      db.employeeProfile.upsert({
        where: { userId: session.user.id },
        create: { userId: session.user.id, ...profileData },
        update: profileData,
      }),
    ])

    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action: "profile_updated",
        description: "Perfil atualizado",
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[PROFILE_PATCH]", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
