"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Lock, Wallet } from 'lucide-react'
import Link from "next/link"
import { getConnectedAddress, connectWallet, onAccountsChanged } from "@/lib/walletConnector"

export function Header() {
  const [isWalletConnected, setIsWalletConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)

  // Check wallet connection on mount and when page regains focus
  useEffect(() => {
    const checkWalletConnection = async () => {
      const address = await getConnectedAddress()
      setIsWalletConnected(!!address)
    }

    checkWalletConnection()

    // Recheck when page regains focus
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        checkWalletConnection()
      }
    }

    // Listen for account changes
    const unsubscribe = onAccountsChanged((accounts) => {
      setIsWalletConnected(accounts.length > 0)
    })

    document.addEventListener("visibilitychange", handleVisibilityChange)
    window.addEventListener("focus", checkWalletConnection)

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      window.removeEventListener("focus", checkWalletConnection)
      unsubscribe()
    }
  }, [])

  const handleConnectWallet = async () => {
    setIsConnecting(true)
    try {
      await connectWallet()
      setIsWalletConnected(true)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to connect wallet"
      console.error("[v0] Wallet connection error:", errorMessage)
      alert(errorMessage)
    } finally {
      setIsConnecting(false)
    }
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/40">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-[#c4fa6b] p-2 rounded-lg">
              <Lock className="w-6 h-6 text-[#0a1628]" />
            </div>
            <span className="text-lg font-semibold text-foreground">CashVault</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <a
              href="#products"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Products
            </a>
            <a
              href="#about"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              About
            </a>
            <a
              href="#faq"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              FAQ
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Button
              onClick={handleConnectWallet}
              disabled={isConnecting}
              className={`text-sm font-semibold inline-flex items-center gap-2 ${
                isWalletConnected
                  ? "bg-primary/20 text-primary hover:bg-primary/30"
                  : "bg-primary text-primary-foreground hover:bg-primary/90"
              }`}
              size="sm"
            >
              <Wallet className="w-4 h-4" />
              {isConnecting ? "Connecting..." : isWalletConnected ? "Connected" : "Connect Wallet"}
            </Button>
            <Link href="/waitlist">
              <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-semibold hidden sm:inline-flex">
                Join Waitlist
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
