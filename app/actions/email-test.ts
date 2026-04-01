'use server'

import { sendPlanCreatedEmail, sendPlanFundedEmail, sendPlanWithdrawnEmail } from '@/lib/email/service'

/**
 * Test endpoint for email functionality
 * Only call this in development/testing
 */
export async function testPlanCreatedEmail(recipientEmail: string) {
  console.log('[v0] Testing plan created email to:', recipientEmail)
  const result = await sendPlanCreatedEmail({
    recipientName: recipientEmail,
    assetSymbol: 'BTC',
    planId: 12345,
    createdDate: new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
  })
  return result
}

export async function testPlanFundedEmail(recipientEmail: string) {
  console.log('[v0] Testing plan funded email to:', recipientEmail)
  const result = await sendPlanFundedEmail({
    recipientName: recipientEmail,
    assetSymbol: 'ETH',
    amountDeposited: 500,
    newBalance: 1000,
    planId: 12345,
    transactionDate: new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
  })
  return result
}

export async function testPlanWithdrawnEmail(recipientEmail: string) {
  console.log('[v0] Testing plan withdrawn email to:', recipientEmail)
  const result = await sendPlanWithdrawnEmail({
    recipientName: recipientEmail,
    assetSymbol: 'SOL',
    amountWithdrawn: 250,
    remainingBalance: 750,
    planId: 12345,
    withdrawalDate: new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
  })
  return result
}
