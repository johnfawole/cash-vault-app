import { NextRequest, NextResponse } from "next/server"
import {
  exchangeCodeForToken,
  getGoogleUserInfo,
  createOrUpdateUser,
  setAuthCookie,
} from "@/app/actions/auth-actions"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get("code")
  const state = searchParams.get("state")

  if (!code) {
    return NextResponse.json({ error: "No code provided" }, { status: 400 })
  }

  try {
    // Exchange code for tokens
    const tokens = await exchangeCodeForToken(code)
    console.log("[v0] Token exchange successful")

    // Get user info from Google
    const googleUser = await getGoogleUserInfo(tokens.access_token)
    console.log("[v0] Google user info received:", googleUser.email)

    // Create or update user in our database
    const user = await createOrUpdateUser(
      googleUser.id,
      googleUser.email,
      googleUser.name,
      googleUser.picture
    )
    console.log("[v0] User created/updated:", user.id)

    // Set auth cookie
    await setAuthCookie({
      userId: user.id,
      email: user.email,
      name: user.full_name,
    })

    // Redirect to dashboard
    return NextResponse.redirect(new URL("/dashboard", request.url))
  } catch (error) {
    console.error("[v0] Auth callback error:", error)
    const errorMessage = error instanceof Error ? error.message : "Authentication failed"
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(errorMessage)}`, request.url)
    )
  }
}
