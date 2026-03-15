import { createBrowserClient } from '@supabase/ssr'

let supabaseInstance: ReturnType<typeof createBrowserClient> | null = null

export function getSupabase() {
  // Only create client in browser environment
  if (typeof window === 'undefined') {
    return null
  }

  // Return cached instance if available
  if (supabaseInstance) {
    return supabaseInstance
  }

  try {
    // Create new instance
    supabaseInstance = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    )
    return supabaseInstance
  } catch (error) {
    console.error('[v0] Failed to create Supabase client:', error)
    return null
  }
}

export function createClient() {
  return getSupabase()
}
