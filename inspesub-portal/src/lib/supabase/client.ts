/**
 * Supabase Browser Client
 * Use em Client Components ("use client")
 * NUNCA usar SERVICE_ROLE aqui — apenas ANON KEY
 */
import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
