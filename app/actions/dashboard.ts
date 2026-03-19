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

    // First try: Query with explicit column selection
    // Query dca_plans where user_email matches wallet address
    const { data, error } = await supabase
      .from('dca_plans')
      .select('id, plan_id, user_id, asset_symbol, asset_token, funded_amount, reminder_frequency, email_reminders_enabled, user_email, created_at, updated_at, last_reminder_sent')
      .or(`user_email.eq.${walletAddress},user_email.ilike.%${walletAddress.toLowerCase()}%`)
      .order('updated_at', { ascending: false })

    if (error) {
      console.error('[v0] DCA query error:', error.message, error.code)
      // Return empty array gracefully if there's an issue
      return []
    }

    console.log('[v0] DCA plans found:', data?.length || 0)
    return data || []
  } catch (error) {
    console.error('[v0] Unexpected error fetching DCA plans:', error)
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
