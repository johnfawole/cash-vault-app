import { neon } from "@neondatabase/serverless"

export async function GET() {
  try {
    const sql = neon(process.env.NEON_DATABASE_URL!)

    const waitlist = await sql`
      SELECT id, name, email, created_at 
      FROM waitlist 
      ORDER BY created_at DESC
    `

    return Response.json({
      success: true,
      data: waitlist,
      count: waitlist.length,
    })
  } catch (error) {
    console.error("Error fetching waitlist:", error)
    return Response.json({ success: false, error: "Failed to fetch waitlist data" }, { status: 500 })
  }
}
