'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, Calendar, DollarSign } from 'lucide-react'

interface DCAPlan {
  id: string
  name: string
  asset: string
  frequency: string
  amount: number
  start_date: string
  is_active: boolean
  created_at: string
}

export function DCAPlansCard({ userId }: { userId: string }) {
  const [plans, setPlans] = useState<DCAPlan[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) return

    const fetchPlans = async () => {
      try {
        setIsLoading(true)
        const { getSupabase } = await import('@/lib/supabase/client')
        const supabase = getSupabase()
        if (!supabase) {
          setError('Database connection failed')
          return
        }

        const { data, error } = await supabase
          .from('dca_plans')
          .select('*')
          .eq('user_id', userId)
          .eq('is_active', true)
          .order('created_at', { ascending: false })

        if (error) throw error

        setPlans(data || [])
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load DCA plans'
        setError(errorMessage)
        console.error('[v0] Error fetching DCA plans:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPlans()
  }, [userId])

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>DCA Savings Plans</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-muted rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>DCA Savings Plans</CardTitle>
        <CardDescription>
          {plans.length} active plan{plans.length !== 1 ? 's' : ''}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error ? (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        ) : plans.length === 0 ? (
          <div className="text-center py-8">
            <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground mb-2">No active DCA plans yet</p>
            <p className="text-sm text-muted-foreground">
              Create a DCA plan to start building your savings
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-foreground">{plan.name}</h3>
                    <p className="text-sm text-muted-foreground">{plan.asset}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-foreground flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      {plan.amount}
                    </p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {plan.frequency}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Started {new Date(plan.start_date).toLocaleDateString()}
                  </div>
                  <div className="px-2 py-1 bg-green-50 text-green-700 rounded text-xs font-medium">
                    Active
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
