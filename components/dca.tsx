"use client"

import type React from "react"

import { useState } from "react"
import { useContract } from "@/hooks/useContract"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AssetSelector } from "@/components/asset-selector"
import { TrendingUp, ArrowLeft, DollarSign } from "lucide-react"
import Link from "next/link"

export function DCA() {
  const [activeTab, setActiveTab] = useState<"deposit" | "withdraw">("deposit")
  const [formData, setFormData] = useState({
    assetType: "",
    investmentAmount: "",
    frequency: "",
  })
  const [withdrawData, setWithdrawData] = useState({
    planId: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { createDCAPlan, createDCAPlantWithUSDC, fundDCAPlan, withdrawDCA } = useContract()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      if (!formData.assetType || !formData.investmentAmount || !formData.frequency) {
        throw new Error("Please fill in all fields")
      }

      if (formData.assetType === "usdc") {
        // Create DCA plan with USDC
        const tx = await createDCAPlantWithUSDC({
          frequency: formData.frequency
        })
        console.log("[v0] DCA Plan created:", tx)
      } else {
        // Create DCA plan with ETH or other token
        const tokenAddress = formData.assetType === "ether" 
          ? "0x4200000000000000000000000000000000000006" // WETH on Base
          : formData.assetType
        
        const tx = await createDCAPlan({
          tokenAddress,
          frequency: formData.frequency
        })
        console.log("[v0] DCA Plan created:", tx)
      }

      setFormData({
        assetType: "",
        investmentAmount: "",
        frequency: "",
      })
      alert("DCA Plan created successfully!")
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create DCA plan"
      setError(errorMessage)
      console.error("[v0] Error creating DCA plan:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      if (!withdrawData.planId) {
        throw new Error("Please enter a plan ID")
      }

      const tx = await withdrawDCA({
        planId: parseInt(withdrawData.planId)
      })

      console.log("[v0] DCA withdrawal processed:", tx)
      setWithdrawData({
        planId: "",
      })
      alert("Withdrawal successful!")
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to withdraw"
      setError(errorMessage)
      console.error("[v0] Error withdrawing:", err)
    } finally {
      setIsLoading(false)
    }
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
            <TrendingUp className="w-8 h-8 text-foreground" />
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 text-balance">
            Dollar Cost Averaging
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed">
            Build wealth through consistent investing. Buy USDC or Ether automatically at regular intervals.
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
              Start DCA
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
                {/* Asset Selector */}
                <AssetSelector 
                  value={formData.assetType} 
                  onChange={(value) => setFormData({ ...formData, assetType: value })}
                  label="Select Asset"
                />

                <div className="space-y-2">
                  <Label htmlFor="investmentAmount" className="text-base font-semibold text-foreground">
                    Investment Amount Per Interval
                  </Label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="investmentAmount"
                      type="number"
                      placeholder="100"
                      value={formData.investmentAmount}
                      onChange={(e) => setFormData({ ...formData, investmentAmount: e.target.value })}
                      className="h-14 text-base pl-12 bg-background border-border focus:border-primary"
                      required
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">How much do you want to invest each time?</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="frequency" className="text-base font-semibold text-foreground">
                    Frequency
                  </Label>
                  <Select
                    value={formData.frequency}
                    onValueChange={(value) => setFormData({ ...formData, frequency: value })}
                  >
                    <SelectTrigger className="h-14 text-base bg-background border-border focus:border-primary">
                      <SelectValue placeholder="Select investment frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">How often do you want to invest?</p>
                </div>

                {error && (
                  <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-600 text-sm">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  size="lg"
                  disabled={isLoading}
                  className="w-full h-16 text-lg font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                >
                  {isLoading ? "Creating Plan..." : "Start DCA Investment"}
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : (
          <Card className="border border-border bg-card">
            <CardContent className="p-8 md:p-12">
              <form onSubmit={handleWithdraw} className="space-y-8">
                <div className="space-y-2">
                  <Label htmlFor="plan-id" className="text-base font-semibold text-foreground">
                    Plan ID
                  </Label>
                  <Input
                    id="plan-id"
                    type="number"
                    placeholder="Enter your plan ID"
                    value={withdrawData.planId}
                    onChange={(e) => setWithdrawData({ ...withdrawData, planId: e.target.value })}
                    className="h-14 text-base bg-background border-border focus:border-primary"
                    required
                  />
                  <p className="text-sm text-muted-foreground">The unique ID of your DCA plan</p>
                </div>

                {error && (
                  <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-600 text-sm">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  size="lg"
                  disabled={isLoading}
                  className="w-full h-16 text-lg font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                >
                  {isLoading ? "Processing..." : "Withdraw Funds"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
