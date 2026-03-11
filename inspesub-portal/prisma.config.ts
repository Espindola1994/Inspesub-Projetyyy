/**
 * Prisma Config — Supabase Production Setup
 *
 * DATABASE_URL  → Connection Pooler (Transaction mode, porta 6543)
 *                 Usado pelo PrismaClient em runtime (Next.js / Vercel)
 *
 * DIRECT_URL    → Conexão direta ao banco (porta 5432)
 *                 Usado pelo CLI do Prisma para migrate e introspection
 */
import "dotenv/config"
import { defineConfig } from "prisma/config"

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DIRECT_URL"] ?? process.env["DATABASE_URL"],
  },
})
