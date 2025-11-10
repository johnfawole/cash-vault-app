"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TrendingUp, ArrowLeft, DollarSign, Coins } from "lucide-react"
import Link from "next/link"

export function DCA() {
  const [formData, setFormData] = useState({
    assetType: "",
    investmentAmount: "",
    frequency: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("DCA Investment Plan:", formData)
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
            Build wealth through consistent investing. Buy Bitcoin, Ether, or Stacks automatically at regular intervals.
          </p>
        </div>

        <Card className="border border-border bg-card">
          <CardContent className="p-8 md:p-12">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-2">
                <Label htmlFor="assetType" className="text-base font-semibold text-foreground">
                  Asset Type
                </Label>
                <div className="relative">
                  <Coins className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground z-10" />
                  <Select
                    value={formData.assetType}
                    onValueChange={(value) => setFormData({ ...formData, assetType: value })}
                  >
                    <SelectTrigger className="h-14 text-base pl-12 bg-background border-border focus:border-primary">
                      <SelectValue placeholder="Select asset to invest in" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bitcoin">Bitcoin (BTC)</SelectItem>
                      <SelectItem value="ethereum">Ethereum (ETH)</SelectItem>
                      <SelectItem value="stacks">Stacks (STX)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <p className="text-sm text-muted-foreground">Choose the cryptocurrency you want to invest in</p>
              </div>

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

              <Button
                type="submit"
                size="lg"
                className="w-full h-16 text-lg font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all"
              >
                Start DCA Investment
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
