'use server'

import { createClient } from '@/lib/supabase/server'
import { sendPlanCreatedEmail, sendPlanFundedEmail, sendPlanWithdrawnEmail } from '@/lib/email/service'

export interface DCAPlanlData {
  id: number
  user_id: string
  plan_id: number
  asset_token: string
  asset_symbol: string
  funded_amount: number
  email_reminders_enabled: boolean
  reminder_frequency: string
  user_email: string | null
  created_at: string
}

export async function saveDCAPlan(
  userId: string,
  planId: number,
  assetToken: string,
  assetSymbol: string,
  emailRemindersEnabled: boolean = false,
  userEmail: string | null = null
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
        email_reminders_enabled: emailRemindersEnabled,
        reminder_frequency: 'weekly',
        user_email: userEmail,
      })
      .select()

    if (error) {
      console.error('[v0] Error saving DCA plan:', error)
      throw error
    }

    console.log('[v0] DCA plan saved:', data)

    // Send plan created email if email is provided
    if (userEmail && data && data.length > 0) {
      const plan = data[0]
      const emailResult = await sendPlanCreatedEmail({
        recipientName: userEmail,
        assetSymbol: assetSymbol,
        planId: planId,
        createdDate: new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
      })
      console.log('[v0] Plan created email result:', emailResult)
    }

    return { data, error: null }
  } catch (error) {
    console.error('[v0] Error saving DCA plan:', error)
    return { data: null, error }
  }
}

export async function withdrawFromDCAPlan(planId: number, withdrawalAmount: number, userEmail: string | null = null, assetSymbol: string = '') {
  const supabase = await createClient()

  try {
    // Get current plan balance
    const { data: planData, error: fetchError } = await supabase
      .from('dca_plans')
      .select('funded_amount')
      .eq('plan_id', planId)
      .single()

    if (fetchError) {
      console.error('[v0] Error fetching DCA plan:', fetchError)
      throw fetchError
    }

    const currentBalance = planData?.funded_amount || 0
    if (currentBalance < withdrawalAmount) {
      return { data: null, error: 'Insufficient balance for withdrawal' }
    }

    const remainingBalance = currentBalance - withdrawalAmount

    const { data, error } = await supabase
      .from('dca_plans')
      .update({ funded_amount: remainingBalance, updated_at: new Date().toISOString() })
      .eq('plan_id', planId)
      .select()

    if (error) {
      console.error('[v0] Error updating DCA plan after withdrawal:', error)
      throw error
    }

    console.log('[v0] DCA plan withdrawal processed:', data)

    // Send withdrawal email if email is provided
    if (userEmail && data && data.length > 0) {
      const emailResult = await sendPlanWithdrawnEmail({
        recipientName: userEmail,
        assetSymbol: assetSymbol,
        amountWithdrawn: withdrawalAmount,
        remainingBalance: remainingBalance,
        planId: planId,
        withdrawalDate: new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
      })
      console.log('[v0] Plan withdrawal email result:', emailResult)
    }

    return { data, error: null }
  } catch (error) {
    console.error('[v0] Error processing DCA plan withdrawal:', error)
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

export async function updateDCAPlanFunding(planId: number, amount: number, userEmail: string | null = null, assetSymbol: string = '') {
  const supabase = await createClient()

  try {
    // Get current plan to calculate totals
    const { data: planData, error: fetchError } = await supabase
      .from('dca_plans')
      .select('funded_amount')
      .eq('plan_id', planId)
      .single()

    if (fetchError) {
      console.error('[v0] Error fetching DCA plan:', fetchError)
      throw fetchError
    }

    const currentBalance = planData?.funded_amount || 0
    const newBalance = currentBalance + amount

    const { data, error } = await supabase
      .from('dca_plans')
      .update({ funded_amount: newBalance, updated_at: new Date().toISOString() })
      .eq('plan_id', planId)
      .select()

    if (error) {
      console.error('[v0] Error updating DCA plan funding:', error)
      throw error
    }

    console.log('[v0] DCA plan funding updated:', data)

    // Send plan funded email if email is provided
    if (userEmail && data && data.length > 0) {
      const emailResult = await sendPlanFundedEmail({
        recipientName: userEmail,
        assetSymbol: assetSymbol,
        amountDeposited: amount,
        newBalance: newBalance,
        planId: planId,
        transactionDate: new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
      })
      console.log('[v0] Plan funded email result:', emailResult)
    }

    return { data, error: null }
  } catch (error) {
    console.error('[v0] Error updating DCA plan funding:', error)
    return { data: null, error }
  }
}
