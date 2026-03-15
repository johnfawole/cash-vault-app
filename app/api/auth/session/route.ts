import { NextRequest, NextResponse } from "next/server"
import { getAuthSession } from "@/app/actions/auth-actions"

export async function GET(request: NextRequest) {
  try {
    const session = await getAuthSession()

    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    return NextResponse.json(session)
  } catch (error) {
    console.error("[v0] Session error:", error)
    return NextResponse.json({ error: "Session error" }, { status: 500 })
  }
}
