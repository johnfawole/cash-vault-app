"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp } from "lucide-react"

interface DCAPlansCardProps {
  dcaPlans: any[]
}

export default function DCAPlansCard({ dcaPlans }: DCAPlansCardProps) {
  if (!dcaPlans || dcaPlans.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            DCA Savings Plans
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">No active DCA plans yet. Create one to get started!</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          DCA Savings Plans ({dcaPlans.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {dcaPlans.map((plan) => (
            <div key={plan.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-foreground">
                    {plan.investment_asset || "Unknown Asset"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {plan.frequency || "One-time"} Investment
                  </p>
                </div>
                <Badge variant={plan.is_active ? "default" : "secondary"}>
                  {plan.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Investment Amount</p>
                  <p className="font-medium">${plan.investment_amount || "0"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Start Date</p>
                  <p className="font-medium">
                    {plan.start_date ? new Date(plan.start_date).toLocaleDateString() : "N/A"}
                  </p>
                </div>
              </div>

              {plan.target_amount && (
                <div className="mt-3 pt-3 border-t">
                  <p className="text-xs text-muted-foreground">Target Goal</p>
                  <p className="font-medium text-sm">${plan.target_amount}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
