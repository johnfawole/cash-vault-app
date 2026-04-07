'use client'

import { testPlanCreatedEmail, testPlanFundedEmail, testPlanWithdrawnEmail } from '@/app/actions/email-test'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useState } from 'react'

export default function EmailTestPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleTestEmail(type: 'created' | 'funded' | 'withdrawn') {
    if (!email) {
      alert('Please enter an email address')
      return
    }

    setLoading(true)
    try {
      let result
      if (type === 'created') {
        result = await testPlanCreatedEmail(email)
      } else if (type === 'funded') {
        result = await testPlanFundedEmail(email)
      } else {
        result = await testPlanWithdrawnEmail(email)
      }

      if (result.success) {
        alert(`Email sent successfully! Message ID: ${result.messageId}`)
      } else {
        alert(`Failed to send email: ${result.error}`)
      }
    } catch (error) {
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Email Testing Dashboard</h1>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Test Email Service</CardTitle>
              <CardDescription>Send test emails for each DCA milestone</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Test Email Address</label>
                <Input
                  type="email"
                  placeholder="test@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mb-4"
                />
              </div>

              <div className="space-y-3">
                <Button
                  onClick={() => handleTestEmail('created')}
                  disabled={loading}
                  className="w-full"
                  variant="outline"
                >
                  {loading ? 'Sending...' : 'Send Plan Created Email'}
                </Button>

                <Button
                  onClick={() => handleTestEmail('funded')}
                  disabled={loading}
                  className="w-full"
                  variant="outline"
                >
                  {loading ? 'Sending...' : 'Send Plan Funded Email'}
                </Button>

                <Button
                  onClick={() => handleTestEmail('withdrawn')}
                  disabled={loading}
                  className="w-full"
                  variant="outline"
                >
                  {loading ? 'Sending...' : 'Send Plan Withdrawn Email'}
                </Button>
              </div>

              <p className="text-xs text-muted-foreground mt-4">
                Emails sent through this page will use test data. Check Resend dashboard for delivery status.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>
                <strong>From Email:</strong> johnfawole123@gmail.com
              </p>
              <p>
                <strong>Service:</strong> Resend
              </p>
              <p>
                <strong>Triggers:</strong> Plan creation, funding, withdrawals
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
