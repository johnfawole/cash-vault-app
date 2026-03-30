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
    let isMounted = true
    
    const checkWalletConnection = async () => {
      const address = await getConnectedAddress()
      console.log("[v0] Wallet check result:", address)
      if (isMounted) {
        setIsWalletConnected(!!address)
      }
    }

    checkWalletConnection()

    // Listen for account changes
    const unsubscribe = onAccountsChanged((accounts) => {
      console.log("[v0] Accounts changed event:", accounts)
      if (isMounted) {
        // Only show as connected if accounts array has items AND they're valid
        const isConnected = Array.isArray(accounts) && accounts.length > 0
        setIsWalletConnected(isConnected)
      }
    })

    // Recheck when page regains focus
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        checkWalletConnection()
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    window.addEventListener("focus", checkWalletConnection)

    return () => {
      isMounted = false
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
      
      // Don't show alert if redirecting to MetaMask on mobile
      if (errorMessage.includes("Redirecting")) {
        console.log("[v0] Redirecting to MetaMask, hiding error")
        return
      }
      
      // Show error for desktop or if wallet not available
      if (!errorMessage.includes("Redirecting")) {
        alert(errorMessage)
      }
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
            <Link href={isWalletConnected ? "/dashboard" : "/dashboard/login"}>
              <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-semibold hidden sm:inline-flex">
                {isWalletConnected ? "Dashboard" : "Login"}
              </Button>
            </Link>
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
          </div>
        </div>
      </div>
    </header>
  )
}
