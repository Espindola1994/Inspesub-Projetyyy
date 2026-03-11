import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { randomBytes } from "crypto"
import { z } from "zod"

const schema = z.object({
  email: z.string().email(),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validation = schema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({ error: "Email inválido" }, { status: 400 })
    }

    const { email } = validation.data

    // Sempre retorna sucesso por segurança (não revelar se email existe)
    const user = await db.user.findUnique({ where: { email } })

    if (user) {
      // Invalidar tokens anteriores
      await db.passwordReset.updateMany({
        where: { userId: user.id, usedAt: null },
        data: { usedAt: new Date() },
      })

      // Gerar token
      const token = randomBytes(32).toString("hex")
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hora

      await db.passwordReset.create({
        data: {
          userId: user.id,
          token,
          expiresAt,
        },
      })

      // TODO: Enviar email com link de reset
      // await sendPasswordResetEmail(email, token)
      console.log(`[PASSWORD_RESET] Token para ${email}: ${token}`)
    }

    return NextResponse.json({
      message: "Se o email estiver cadastrado, você receberá as instruções.",
    })
  } catch (error) {
    console.error("[FORGOT_PASSWORD]", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
