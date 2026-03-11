import type { UserRole, AccountStatus } from "@prisma/client"
import "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name: string
      email: string
      image?: string | null
      role: UserRole
      status: AccountStatus
    }
  }

  interface User {
    role: UserRole
    status: AccountStatus
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: UserRole
    status: AccountStatus
  }
}
