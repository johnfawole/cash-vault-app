'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

interface HoldingData {
  asset: string
  value: number
  percentage: number
}

const COLORS = ['#c4fa6b', '#6fa6ff', '#ff6b9d', '#ffa500', '#20c997', '#b19cd9']

export function HoldingsPieChart({ userId }: { userId: string }) {
  const [holdings, setHoldings] = useState<HoldingData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalValue, setTotalValue] = useState(0)

  useEffect(() => {
    if (!userId) return

    const fetchHoldings = async () => {
      try {
        setIsLoading(true)
        const { data, error } = await supabase
          .from('dca_plans')
          .select('asset, amount')
          .eq('user_id', userId)
          .eq('is_active', true)

        if (error) throw error

        // Aggregate by asset
        const assetMap: { [key: string]: number } = {}
        data?.forEach((plan: any) => {
          if (assetMap[plan.asset]) {
            assetMap[plan.asset] += plan.amount
          } else {
            assetMap[plan.asset] = plan.amount
          }
        })

        // Calculate total
        const total = Object.values(assetMap).reduce((sum, val) => sum + val, 0)
        setTotalValue(total)

        // Transform to chart data
        const chartData: HoldingData[] = Object.entries(assetMap).map(([asset, value]) => ({
          asset,
          value: value as number,
          percentage: total > 0 ? Math.round(((value as number) / total) * 100) : 0,
        }))

        setHoldings(chartData)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load holdings'
        setError(errorMessage)
        console.error('[v0] Error fetching holdings:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchHoldings()
  }, [userId])

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Holdings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-muted rounded-lg animate-pulse" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Holdings</CardTitle>
        <CardDescription>
          Asset allocation across DCA plans
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error ? (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        ) : holdings.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            <p>No holdings data available</p>
          </div>
        ) : (
          <>
            <div className="mb-4 p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Total Allocation</p>
              <p className="text-2xl font-bold text-foreground">${totalValue.toLocaleString()}</p>
            </div>

            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={holdings}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ asset, percentage }) => `${asset}: ${percentage}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {holdings.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => `$${(value as number).toLocaleString()}`}
                />
              </PieChart>
            </ResponsiveContainer>

            <div className="mt-6 space-y-2">
              {holdings.map((holding, index) => (
                <div key={holding.asset} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-muted-foreground">{holding.asset}</span>
                  </div>
                  <span className="font-semibold text-foreground">
                    {holding.percentage}%
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
