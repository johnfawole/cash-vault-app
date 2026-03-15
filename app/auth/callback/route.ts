import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const error = requestUrl.searchParams.get('error')

  // Handle OAuth errors from provider
  if (error) {
    console.error('[v0] OAuth error from provider:', error)
    return NextResponse.redirect(`${requestUrl.origin}/dashboard/login?error=${error}`)
  }

  if (code) {
    const supabase = await createClient()

    try {
      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
      if (exchangeError) {
        console.error('[v0] Auth callback error:', exchangeError)
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
