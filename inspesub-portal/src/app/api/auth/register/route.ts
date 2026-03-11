import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { db } from "@/lib/db"
import { z } from "zod"

const registerSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "Senha deve ter pelo menos 8 caracteres"),
  position: z.string().optional(),
  phone: z.string().optional(),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validation = registerSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      )
    }

    const { name, email, password, position, phone } = validation.data

    // Verifica se email já existe
    const existingUser = await db.user.findUnique({ where: { email } })
    if (existingUser) {
      return NextResponse.json(
        { error: "Email já cadastrado" },
        { status: 409 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    // Cria o usuário com status pendente
    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "member",
        status: "pending",
        profile: {
          create: {
            position: position ?? null,
            phone: phone ?? null,
          },
        },
        approvals: {
          create: {
            status: "pending",
          },
        },
      },
    })

    // Log de auditoria
    await db.auditLog.create({
      data: {
        userId: user.id,
        action: "account_created",
        description: `Nova conta criada: ${name} (${email})`,
        metadata: { position, phone },
      },
    })

    return NextResponse.json(
      { message: "Conta criada com sucesso. Aguardando aprovação." },
      { status: 201 }
    )
  } catch (error) {
    console.error("[REGISTER]", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
