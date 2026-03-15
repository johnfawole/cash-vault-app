import { NextRequest, NextResponse } from "next/server"
import { getAuthSession } from "@/app/actions/auth-actions"
import { createClient } from "@supabase/supabase-js"

export async function GET(request: NextRequest) {
  try {
    const session = await getAuthSession()

    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Supabase credentials are not configured")
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Fetch DCA plans for this user
    const { data, error } = await supabase
      .from("dca_plans")
      .select("*")
      .eq("user_id", session.userId)
      .eq("is_active", true)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Supabase error:", error)
      return NextResponse.json({ error: "Failed to fetch DCA plans" }, { status: 500 })
    }

    return NextResponse.json(data || [])
  } catch (error) {
    console.error("[v0] DCA plans error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
