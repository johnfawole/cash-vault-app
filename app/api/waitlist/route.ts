import { neon } from "@neondatabase/serverless"

export async function POST(request: Request) {
  try {
    const { email, name } = await request.json()

    if (!email || !email.includes("@")) {
      return Response.json({ error: "Valid email is required" }, { status: 400 })
    }

    const sql = neon(process.env.NEON_DATABASE_URL!)

    await sql`
      CREATE TABLE IF NOT EXISTS waitlist (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        name VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    await sql`
      CREATE INDEX IF NOT EXISTS idx_waitlist_email ON waitlist(email)
    `

    // Insert into waitlist
    await sql`
      INSERT INTO waitlist (email, name)
      VALUES (${email}, ${name || null})
    `

    return Response.json({ message: "Successfully joined the waitlist!" }, { status: 200 })
  } catch (error: any) {
    // Handle duplicate email error
    if (error.code === "23505") {
      return Response.json({ error: "This email is already on the waitlist" }, { status: 409 })
    }

    console.error("Waitlist error:", error)
    return Response.json({ error: "Failed to join waitlist. Please try again." }, { status: 500 })
  }
}
