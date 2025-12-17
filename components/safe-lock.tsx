"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Lock, ArrowLeft, Coins } from "lucide-react"
import Link from "next/link"

export function SafeLock() {
  const [activeTab, setActiveTab] = useState<"deposit" | "withdraw">("deposit")
  const [amount, setAmount] = useState("")
  const [duration, setDuration] = useState("")
  const [asset, setAsset] = useState("")
  const [relock, setRelock] = useState(false)
  const [withdrawAmount, setWithdrawAmount] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log({ amount, duration, asset, relock })
    // Handle form submission here
  }

  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault()
    console.log({ withdrawAmount, asset })
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50">
        <div className="container mx-auto px-6 py-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-lg font-semibold">Back to Home</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-16">
        <div className="max-w-3xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 mb-6">
              <Lock className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-4 text-balance">Safe Lock</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
              Lock your money away and build the discipline you need. Your future self will thank you.
            </p>
          </div>

          {/* Tabs for Deposit and Withdraw */}
          <div className="mb-8">
            <div className="flex gap-4 border-b border-border">
              <button
                onClick={() => setActiveTab("deposit")}
                className={`px-6 py-4 text-lg font-semibold transition-colors relative ${
                  activeTab === "deposit" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Deposit
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
            <div className="bg-card border border-border rounded-2xl p-8 md:p-12">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Amount to Lock */}
                <div className="space-y-3">
                  <Label htmlFor="amount" className="text-lg font-semibold text-foreground">
                    Amount to Lock
                  </Label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-muted-foreground">
                      $
                    </span>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="pl-10 h-16 text-2xl font-semibold bg-background border-border focus:border-primary"
                      required
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    This amount will be locked and inaccessible until the lock period ends.
                  </p>
                </div>

                {/* Duration */}
                <div className="space-y-3">
                  <Label htmlFor="duration" className="text-lg font-semibold text-foreground">
                    Lock Duration
                  </Label>
                  <Select value={duration} onValueChange={setDuration} required>
                    <SelectTrigger
                      id="duration"
                      className="h-16 text-lg bg-background border-border focus:border-primary"
                    >
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1" className="text-lg">
                        1 month
                      </SelectItem>
                      <SelectItem value="2" className="text-lg">
                        2 months
                      </SelectItem>
                      <SelectItem value="3" className="text-lg">
                        3 months
                      </SelectItem>
                      <SelectItem value="4" className="text-lg">
                        4 months
                      </SelectItem>
                      <SelectItem value="5" className="text-lg">
                        5 months
                      </SelectItem>
                      <SelectItem value="6" className="text-lg">
                        6 months
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    Choose how long you want to lock your money. Maximum 6 months.
                  </p>
                </div>

                {/* Select Asset */}
                <div className="space-y-3">
                  <Label htmlFor="asset" className="text-lg font-semibold text-foreground">
                    Select Asset
                  </Label>
                  <Select value={asset} onValueChange={setAsset} required>
                    <SelectTrigger id="asset" className="h-16 text-lg bg-background border-border focus:border-primary">
                      <Coins className="mr-3 h-5 w-5 text-muted-foreground" />
                      <SelectValue placeholder="Choose asset to lock" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="usdc" className="text-lg">
                        USDC
                      </SelectItem>
                      <SelectItem value="ether" className="text-lg">
                        Ether (ETH)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">Choose which asset you want to lock up.</p>
                </div>

                {/* Re-lock Option */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-6 bg-background border border-border rounded-xl">
                    <div className="space-y-1">
                      <Label htmlFor="relock" className="text-lg font-semibold text-foreground cursor-pointer">
                        Auto Re-lock
                      </Label>
                      <p className="text-sm text-muted-foreground">Automatically lock again when the period ends</p>
                    </div>
                    <Switch id="relock" checked={relock} onCheckedChange={setRelock} />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-6">
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full h-16 text-xl font-bold bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    Lock My Money
                  </Button>
                  <p className="text-center text-sm text-muted-foreground mt-4">
                    By locking your money, you agree to our terms and conditions
                  </p>
                </div>
              </form>
            </div>
          ) : (
            <div className="bg-card border border-border rounded-2xl p-8 md:p-12">
              <form onSubmit={handleWithdraw} className="space-y-8">
                {/* Select Asset */}
                <div className="space-y-3">
                  <Label htmlFor="withdraw-asset" className="text-lg font-semibold text-foreground">
                    Select Asset
                  </Label>
                  <Select value={asset} onValueChange={setAsset} required>
                    <SelectTrigger
                      id="withdraw-asset"
                      className="h-16 text-lg bg-background border-border focus:border-primary"
                    >
                      <Coins className="mr-3 h-5 w-5 text-muted-foreground" />
                      <SelectValue placeholder="Choose asset to withdraw" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="usdc" className="text-lg">
                        USDC
                      </SelectItem>
                      <SelectItem value="ether" className="text-lg">
                        Ether (ETH)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">Select the locked asset you want to withdraw.</p>
                </div>

                {/* Amount to Withdraw */}
                <div className="space-y-3">
                  <Label htmlFor="withdraw-amount" className="text-lg font-semibold text-foreground">
                    Amount to Withdraw
                  </Label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-muted-foreground">
                      $
                    </span>
                    <Input
                      id="withdraw-amount"
                      type="number"
                      placeholder="0.00"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      className="pl-10 h-16 text-2xl font-semibold bg-background border-border focus:border-primary"
                      required
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    You can only withdraw after the lock period has ended.
                  </p>
                </div>

                {/* Submit Button */}
                <div className="pt-6">
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full h-16 text-xl font-bold bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    Withdraw Funds
                  </Button>
                  <p className="text-center text-sm text-muted-foreground mt-4">
                    Withdrawals are only available after your lock period expires
                  </p>
                </div>
              </form>
            </div>
          )}

          {/* Info Section */}
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-foreground mb-2">100% Secure</h3>
              <p className="text-muted-foreground">Your money is on the secure Bitcoin network</p>
            </div>
            <div className="text-center">
              <h3 className="text-2xl font-bold text-foreground mb-2">No Hidden Fees</h3>
              <p className="text-muted-foreground">What you lock is what you get back, guaranteed</p>
            </div>
            <div className="text-center">
              <h3 className="text-2xl font-bold text-foreground mb-2">Build Discipline</h3>
              <p className="text-muted-foreground">Train yourself to save consistently and responsibly</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
