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

    // Query dca_plans by user_email (derived from wallet) or user_id
    // Since wallet auth stores wallet address, we search by wallet pattern or email
    const { data, error } = await supabase
      .from('dca_plans')
      .select('*')
      .eq('user_email', walletAddress.toLowerCase())
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[v0] Error fetching DCA plans:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('[v0] Failed to fetch user DCA plans:', error)
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
