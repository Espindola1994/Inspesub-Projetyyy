import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import bcrypt from "bcryptjs"
import { db } from "@/lib/db"
import type { UserRole, AccountStatus } from "@prisma/client"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db) as any,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Credenciais inválidas")
        }

        const user = await db.user.findUnique({
          where: { email: credentials.email as string },
          include: { profile: true },
        })

        if (!user || !user.password) {
          throw new Error("Usuário não encontrado")
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        )

        if (!isPasswordValid) {
          throw new Error("Senha incorreta")
        }

        if (user.status === "pending") {
          throw new Error("Conta aguardando aprovação")
        }

        if (user.status === "rejected") {
          throw new Error("Conta rejeitada")
        }

        if (user.status === "inactive" || user.status === "suspended") {
          throw new Error("Conta inativa ou suspensa")
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.profile?.avatarUrl ?? user.image,
          role: user.role,
          status: user.status,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role: UserRole }).role
        token.status = (user as { status: AccountStatus }).status
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!
        session.user.role = token.role as UserRole
        session.user.status = token.status as AccountStatus
      }
      return session
    },
  },
})
