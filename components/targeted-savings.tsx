"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Target, ArrowLeft, Calendar, DollarSign } from "lucide-react"
import Link from "next/link"

export function TargetedSavings() {
  const [formData, setFormData] = useState({
    goalName: "",
    targetAmount: "",
    deadline: "",
    initialDeposit: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Targeted Savings Goal:", formData)
  }

  return (
    <div className="min-h-screen bg-background py-12 md:py-20">
      <div className="container mx-auto px-4 max-w-4xl">
        <Link
          href="/"
          className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>

        <div className="mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-lg bg-secondary border border-border mb-6">
            <Target className="w-8 h-8 text-foreground" />
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 text-balance">
            Targeted Savings
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed">
            Set your goals and save with purpose. Whether it{"'"}s education, immigration, or your startup dream, we
            {"'"}ll help you get there.
          </p>
        </div>

        <Card className="border border-border bg-card">
          <CardContent className="p-8 md:p-12">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-2">
                <Label htmlFor="goalName" className="text-base font-semibold text-foreground">
                  Goal Name
                </Label>
                <Input
                  id="goalName"
                  placeholder='e.g., "Education", "Startup", "Immigration"'
                  value={formData.goalName}
                  onChange={(e) => setFormData({ ...formData, goalName: e.target.value })}
                  className="h-14 text-base bg-background border-border focus:border-primary"
                  required
                />
                <p className="text-sm text-muted-foreground">Give your savings goal a meaningful name</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetAmount" className="text-base font-semibold text-foreground">
                  Target Amount
                </Label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="targetAmount"
                    type="number"
                    placeholder="10,000"
                    value={formData.targetAmount}
                    onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                    className="h-14 text-base pl-12 bg-background border-border focus:border-primary"
                    required
                  />
                </div>
                <p className="text-sm text-muted-foreground">How much do you need to save?</p>
              </div>

              <div className="space-y-2">
                
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  
                </div>
                
              </div>

              <div className="space-y-2">
                <Label htmlFor="initialDeposit" className="text-base font-semibold text-foreground">
                  Initial Deposit <span className="text-muted-foreground font-normal text-sm">(Optional)</span>
                </Label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="initialDeposit"
                    type="number"
                    placeholder="500"
                    value={formData.initialDeposit}
                    onChange={(e) => setFormData({ ...formData, initialDeposit: e.target.value })}
                    className="h-14 text-base pl-12 bg-background border-border focus:border-primary"
                  />
                </div>
                <p className="text-sm text-muted-foreground">Kickstart your savings with an initial amount</p>
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full h-16 text-lg font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all"
              >
                Create Savings Goal
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
