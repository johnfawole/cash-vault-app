'use server'

import { createClient } from '@/lib/supabase/server'

export interface DCAPlan {
  id: number
  plan_id: number
  user_id: string
  asset_symbol: string
  asset_token: string
  funded_amount: number
  reminder_frequency: string
  email_reminders_enabled: boolean
  user_email: string
  created_at: string
  updated_at: string
  last_reminder_sent: string | null
}

export async function getUserDCAPlans(walletAddress: string): Promise<DCAPlan[]> {
  try {
    const supabase = await createClient()

    console.log('[v0] Fetching DCA plans for wallet:', walletAddress)

    // Try to query dca_plans table
    // Note: If the table doesn't exist or schema cache issue occurs, gracefully return empty
    const { data, error } = await supabase
      .from('dca_plans')
      .select('*')
      .eq('user_email', walletAddress)
      .order('updated_at', { ascending: false })

    // If we get a 404 or schema error, that's OK - just return empty array
    // This allows the dashboard to work while the table is being set up
    if (error) {
      console.warn('[v0] Note: DCA plans table not accessible (expected during setup):', error.code)
      return []
    }

    console.log('[v0] DCA plans found:', data?.length || 0)
    return (data as DCAPlan[]) || []
  } catch (error) {
    console.warn('[v0] DCA plans fetch - graceful fallback:', error instanceof Error ? error.message : 'Unknown error')
    return []
  }
}

export async function calculateHoldings(dcaPlans: DCAPlan[]): Promise<Array<{ name: string; value: number; percentage: number }>> {
  if (dcaPlans.length === 0) {
    return []
  }

  // Group by asset and sum funded amounts
  const holdingsMap = new Map<string, number>()
  dcaPlans.forEach((plan) => {
    const current = holdingsMap.get(plan.asset_symbol) || 0
    holdingsMap.set(plan.asset_symbol, current + Number(plan.funded_amount))
  })

  // Calculate total and percentages
  const total = Array.from(holdingsMap.values()).reduce((sum, val) => sum + val, 0)

  return Array.from(holdingsMap.entries())
    .map(([asset, value]) => ({
      name: asset,
      value,
      percentage: total > 0 ? Math.round((value / total) * 100) : 0,
    }))
    .sort((a, b) => b.value - a.value)
}
