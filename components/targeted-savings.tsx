"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CalendarIcon, DollarSign, Coins } from "lucide-react"
import Link from "next/link"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

export function TargetedSavings() {
  const [activeTab, setActiveTab] = useState<"deposit" | "withdraw">("deposit")
  const [date, setDate] = useState<Date>()
  const [formData, setFormData] = useState({
    goalName: "",
    asset: "USDC",
    targetAmount: "",
    deadline: "",
    initialDeposit: "",
  })
  const [withdrawData, setWithdrawData] = useState({
    goalName: "",
    asset: "USDC",
    withdrawAmount: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const submissionData = {
      ...formData,
      deadline: date ? format(date, "yyyy-MM-dd") : "",
    }
    console.log("Targeted Savings Goal:", submissionData)
  }

  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Withdraw from Goal:", withdrawData)
  }

  return (
    <div className="min-h-screen bg-background py-12 md:py-20">
      <div className="container mx-auto px-4 max-w-4xl">
        <Link
          href="/"
          className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <CalendarIcon className="w-4 h-4 mr-2" />
          Back to Home
        </Link>

        <div className="mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-lg bg-secondary border border-border mb-6">
            <CalendarIcon className="w-8 h-8 text-foreground" />
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 text-balance">
            Targeted Savings
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed">
            Set your goals and save with purpose. Whether it{"'"}s education, immigration, or your startup dream, we
            {"'"}ll help you get there.
          </p>
        </div>

        <div className="mb-8">
          <div className="flex gap-4 border-b border-border">
            <button
              onClick={() => setActiveTab("deposit")}
              className={`px-6 py-4 text-lg font-semibold transition-colors relative ${
                activeTab === "deposit" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Create Goal
              {activeTab === "deposit" && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
            </button>
            <button
              onClick={() => setActiveTab("withdraw")}
              className={`px-6 py-4 text-lg font-semibold transition-colors relative ${
                activeTab === "withdraw" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Withdraw
              {activeTab === "withdraw" && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
            </button>
          </div>
        </div>

        {activeTab === "deposit" ? (
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
                  <Label htmlFor="asset" className="text-base font-semibold text-foreground">
                    Save In
                  </Label>
                  <div className="relative">
                    <Coins className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <select
                      id="asset"
                      value={formData.asset}
                      onChange={(e) => setFormData({ ...formData, asset: e.target.value })}
                      className="h-14 w-full text-base pl-12 pr-4 bg-background border border-border rounded-md focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      required
                    >
                      <option value="USDC">USDC</option>
                      <option value="Ether">Ether</option>
                    </select>
                  </div>
                  <p className="text-sm text-muted-foreground">Choose which asset to save in</p>
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
                  <Label htmlFor="deadline" className="text-base font-semibold text-foreground">
                    Deadline
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full h-14 justify-start text-left font-normal bg-background border-border hover:bg-background hover:border-primary",
                          !date && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-3 h-5 w-5" />
                        {date ? format(date, "PPP") : <span>Pick a deadline date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <p className="text-sm text-muted-foreground">When do you need to reach your goal?</p>
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
        ) : (
          <Card className="border border-border bg-card">
            <CardContent className="p-8 md:p-12">
              <form onSubmit={handleWithdraw} className="space-y-8">
                <div className="space-y-2">
                  <Label htmlFor="withdraw-goal" className="text-base font-semibold text-foreground">
                    Select Goal
                  </Label>
                  <Input
                    id="withdraw-goal"
                    placeholder='e.g., "Education", "Startup"'
                    value={withdrawData.goalName}
                    onChange={(e) => setWithdrawData({ ...withdrawData, goalName: e.target.value })}
                    className="h-14 text-base bg-background border-border focus:border-primary"
                    required
                  />
                  <p className="text-sm text-muted-foreground">Which savings goal do you want to withdraw from?</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="withdraw-asset" className="text-base font-semibold text-foreground">
                    Asset
                  </Label>
                  <div className="relative">
                    <Coins className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <select
                      id="withdraw-asset"
                      value={withdrawData.asset}
                      onChange={(e) => setWithdrawData({ ...withdrawData, asset: e.target.value })}
                      className="h-14 w-full text-base pl-12 pr-4 bg-background border border-border rounded-md focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      required
                    >
                      <option value="USDC">USDC</option>
                      <option value="Ether">Ether</option>
                    </select>
                  </div>
                  <p className="text-sm text-muted-foreground">Select the asset to withdraw</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="withdraw-amount" className="text-base font-semibold text-foreground">
                    Withdrawal Amount
                  </Label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="withdraw-amount"
                      type="number"
                      placeholder="1,000"
                      value={withdrawData.withdrawAmount}
                      onChange={(e) => setWithdrawData({ ...withdrawData, withdrawAmount: e.target.value })}
                      className="h-14 text-base pl-12 bg-background border-border focus:border-primary"
                      required
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">How much do you want to withdraw?</p>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full h-16 text-lg font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all"
                >
                  Withdraw Funds
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
