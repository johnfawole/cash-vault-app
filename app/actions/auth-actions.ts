"use server"

import { cookies } from "next/headers"

export async function setAuthCookie(sessionData: { userId: string; email: string; name: string }) {
  const cookieStore = await cookies()
  // Create a session cookie that expires in 30 days
  cookieStore.set("cashvault_session", JSON.stringify(sessionData), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  })
}

export async function getAuthSession() {
  const cookieStore = await cookies()
  const session = cookieStore.get("cashvault_session")

  if (!session?.value) {
    return null
  }

  try {
    return JSON.parse(session.value)
  } catch {
    return null
  }
}

export async function clearAuthCookie() {
  const cookieStore = await cookies()
  cookieStore.delete("cashvault_session")
}

export async function getAuthIdentifier(): Promise<string | null> {
  try {
    const session = await getAuthSession()
    if (session?.email) {
      return session.email
    }
    return null
  } catch (error) {
    console.error("[v0] Error getting auth identifier:", error)
    return null
  }
}
