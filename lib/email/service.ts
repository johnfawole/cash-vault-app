'use server'

import { sendEmailWithRetry } from './resend'
import {
  getPlanCreatedEmailText,
  getPlanCreatedEmailHtml,
  getPlanFundedEmailText,
  getPlanFundedEmailHtml,
  getPlanWithdrawnEmailText,
  getPlanWithdrawnEmailHtml,
  PlanCreatedEmailData,
  PlanFundedEmailData,
  PlanWithdrawnEmailData,
} from './templates'

const DASHBOARD_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://cashvault.app'

/**
 * Send email when a DCA plan is created
 */
export async function sendPlanCreatedEmail(data: Omit<PlanCreatedEmailData, 'dashboardUrl'>) {
  if (!data.recipientName) {
    console.warn('[v0] Plan created email: No recipient name provided')
    return { success: false, error: 'No recipient name' }
  }

  const emailData: PlanCreatedEmailData = {
    ...data,
    dashboardUrl: `${DASHBOARD_URL}/dashboard`,
  }

  const result = await sendEmailWithRetry({
    to: data.recipientName, // Assuming recipientName is actually the email - adjust as needed
    subject: `DCA Plan Created for ${data.assetSymbol}`,
    text: getPlanCreatedEmailText(emailData),
    html: getPlanCreatedEmailHtml(emailData),
  })

  return result
}

/**
 * Send email when a DCA plan is funded
 */
export async function sendPlanFundedEmail(data: Omit<PlanFundedEmailData, 'dashboardUrl'>) {
  if (!data.recipientName) {
    console.warn('[v0] Plan funded email: No recipient name provided')
    return { success: false, error: 'No recipient name' }
  }

  const emailData: PlanFundedEmailData = {
    ...data,
    dashboardUrl: `${DASHBOARD_URL}/dashboard`,
  }

  const result = await sendEmailWithRetry({
    to: data.recipientName,
    subject: `${data.assetSymbol} Plan Funded - $${data.amountDeposited.toFixed(2)}`,
    text: getPlanFundedEmailText(emailData),
    html: getPlanFundedEmailHtml(emailData),
  })

  return result
}

/**
 * Send email when funds are withdrawn from a DCA plan
 */
export async function sendPlanWithdrawnEmail(data: Omit<PlanWithdrawnEmailData, 'dashboardUrl'>) {
  if (!data.recipientName) {
    console.warn('[v0] Plan withdrawn email: No recipient name provided')
    return { success: false, error: 'No recipient name' }
  }

  const emailData: PlanWithdrawnEmailData = {
    ...data,
    dashboardUrl: `${DASHBOARD_URL}/dashboard`,
  }

  const result = await sendEmailWithRetry({
    to: data.recipientName,
    subject: `Withdrawal Processed - $${data.amountWithdrawn.toFixed(2)} from ${data.assetSymbol}`,
    text: getPlanWithdrawnEmailText(emailData),
    html: getPlanWithdrawnEmailHtml(emailData),
  })

  return result
}
