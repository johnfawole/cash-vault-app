'use server'

import { createClient } from '@/lib/supabase/server'

export interface DCAPlanlData {
  id: number
  user_id: string
  plan_id: number
  asset_token: string
  asset_symbol: string
  funded_amount: number
  created_at: string
}

export async function saveDCAPlan(
  userId: string,
  planId: number,
  assetToken: string,
  assetSymbol: string
) {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from('dca_plans')
      .insert({
        user_id: userId,
        plan_id: planId,
        asset_token: assetToken,
        asset_symbol: assetSymbol,
        funded_amount: 0,
      })
      .select()

    if (error) {
      console.error('[v0] Error saving DCA plan:', error)
      throw error
    }

    console.log('[v0] DCA plan saved:', data)
    return { data, error: null }
  } catch (error) {
    console.error('[v0] Error saving DCA plan:', error)
    return { data: null, error }
  }
}

export async function getUserDCAPlans(userId: string) {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from('dca_plans')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[v0] Error fetching DCA plans:', error)
      throw error
    }

    console.log('[v0] DCA plans fetched:', data)
    return { data, error: null }
  } catch (error) {
    console.error('[v0] Error fetching DCA plans:', error)
    return { data: null, error }
  }
}

export async function updateDCAPlanFunding(planId: number, amount: number) {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from('dca_plans')
      .update({ funded_amount: amount, updated_at: new Date().toISOString() })
      .eq('plan_id', planId)
      .select()

    if (error) {
      console.error('[v0] Error updating DCA plan funding:', error)
      throw error
    }

    console.log('[v0] DCA plan funding updated:', data)
    return { data, error: null }
  } catch (error) {
    console.error('[v0] Error updating DCA plan funding:', error)
    return { data: null, error }
  }
}
