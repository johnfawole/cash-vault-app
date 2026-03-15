"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts"
import { DollarSign } from "lucide-react"

interface HoldingsPieChartProps {
  dcaPlans: any[]
}

const COLORS = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#06b6d4", "#f97316"]

export default function HoldingsPieChart({ dcaPlans }: HoldingsPieChartProps) {
  // Calculate holdings distribution
  const holdings = dcaPlans
    .filter((plan) => plan.investment_amount)
    .map((plan) => ({
      name: plan.investment_asset || "Unknown",
      value: parseFloat(plan.investment_amount || "0"),
      id: plan.id,
    }))

  if (!holdings || holdings.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Holdings Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">No holdings data available yet</p>
        </CardContent>
      </Card>
    )
  }

  const totalValue = holdings.reduce((sum, h) => sum + h.value, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="w-5 h-5" />
          Holdings Distribution
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Pie Chart */}
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={holdings}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {holdings.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => `$${(value as number).toFixed(2)}`}
                contentStyle={{ backgroundColor: "var(--background)", border: "1px solid var(--border)" }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>

          {/* Summary */}
          <div className="bg-muted/50 rounded-lg p-4">
            <p className="text-sm text-muted-foreground mb-2">Total Holdings</p>
            <p className="text-2xl font-bold">${totalValue.toFixed(2)}</p>
          </div>

          {/* Breakdown */}
          <div className="space-y-2 text-sm">
            <p className="font-semibold text-foreground mb-2">Breakdown</p>
            {holdings.map((holding, index) => (
              <div key={holding.id} className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  ></div>
                  <span className="text-muted-foreground">{holding.name}</span>
                </div>
                <span className="font-medium">
                  ${holding.value.toFixed(2)} ({((holding.value / totalValue) * 100).toFixed(1)}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
