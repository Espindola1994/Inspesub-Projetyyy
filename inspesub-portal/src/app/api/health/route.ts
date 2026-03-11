import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const count = await db.user.count()
    return NextResponse.json({ status: "ok", users: count, db: "connected" })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ status: "error", db: "failed", error: msg }, { status: 500 })
  }
}
