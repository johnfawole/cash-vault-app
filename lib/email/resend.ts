'use server'

import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export interface EmailPayload {
  to: string
  subject: string
  html?: string
  text?: string
}

export async function sendEmail(payload: EmailPayload) {
  try {
    if (!payload.to) {
      console.error('[v0] Email error: No recipient address provided')
      return { success: false, error: 'No recipient address' }
    }

    // Use plain text as primary, with HTML as fallback
    const content = {
      to: payload.to,
      from: 'John at CashVault <john@cashvault.com>',
      subject: payload.subject,
      ...(payload.text && { text: payload.text }),
      ...(payload.html && { html: payload.html }),
    }

    console.log('[v0] Sending email to:', payload.to, 'Subject:', payload.subject)

    const response = await resend.emails.send(content as any)

    if (response.error) {
      console.error('[v0] Resend error:', response.error)
      return { success: false, error: response.error }
    }

    console.log('[v0] Email sent successfully:', response.data?.id)
    return { success: true, messageId: response.data?.id }
  } catch (error) {
    console.error('[v0] Email sending exception:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

export async function sendEmailWithRetry(payload: EmailPayload, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    const result = await sendEmail(payload)
    if (result.success) {
      return result
    }
    console.warn(`[v0] Email send failed (attempt ${i + 1}/${maxRetries}), retrying...`)
    // Wait 1 second before retry
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
  return { success: false, error: 'Max retries exceeded' }
}
