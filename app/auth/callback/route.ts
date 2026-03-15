import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    try {
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      if (error) {
        console.error('[v0] Auth callback error:', error)
        return NextResponse.redirect(`${requestUrl.origin}/dashboard/login?error=auth_error`)
      }

      // Redirect to dashboard after successful auth
      return NextResponse.redirect(`${requestUrl.origin}/dashboard`)
    } catch (err) {
      console.error('[v0] Callback exchange error:', err)
      return NextResponse.redirect(`${requestUrl.origin}/dashboard/login?error=callback_error`)
    }
  }

  return NextResponse.redirect(`${requestUrl.origin}/dashboard/login?error=no_code`)
}
