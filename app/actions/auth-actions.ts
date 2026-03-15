"use server"

import { cookies } from "next/headers"

interface GoogleTokenResponse {
  access_token: string
  id_token: string
  expires_in: number
  token_type: string
}

interface GoogleUserInfo {
  id: string
  email: string
  name: string
  picture: string
}

export async function getGoogleAuthUrl() {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
  const redirectUri = process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI || `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`

  if (!clientId) {
    throw new Error("NEXT_PUBLIC_GOOGLE_CLIENT_ID is not set")
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid profile email",
    access_type: "offline",
    prompt: "consent",
  })

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
}

export async function exchangeCodeForToken(code: string): Promise<GoogleTokenResponse> {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  const redirectUri = process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI || `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`

  if (!clientId || !clientSecret) {
    throw new Error("Google OAuth credentials are not configured")
  }

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }).toString(),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(`Failed to exchange code for token: ${error.error_description}`)
  }

  return response.json()
}

export async function getGoogleUserInfo(accessToken: string): Promise<GoogleUserInfo> {
  const response = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    throw new Error("Failed to fetch Google user info")
  }

  const data = await response.json()
  return {
    id: data.id,
    email: data.email,
    name: data.name,
    picture: data.picture,
  }
}

export async function createOrUpdateUser(
  googleId: string,
  email: string,
  fullName: string,
  avatarUrl: string
) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase credentials are not configured")
  }

  // Use service role key to bypass RLS for user creation
  const response = await fetch(`${supabaseUrl}/rest/v1/users`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${supabaseKey}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates",
    },
    body: JSON.stringify({
      email,
      full_name: fullName,
      google_id: googleId,
      avatar_url: avatarUrl,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    console.error("[v0] Error creating user:", error)
    throw new Error(`Failed to create user: ${error.message}`)
  }

  const user = await response.json()
  return user
}

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
