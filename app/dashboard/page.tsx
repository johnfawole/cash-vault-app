"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import DCAPlansCard from "@/components/dashboard/dca-plans-card"
import HoldingsPieChart from "@/components/dashboard/holdings-pie-chart"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [dcaPlans, setDcaPlans] = useState<any[]>([])

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/session")
        if (!response.ok) {
          router.push("/login")
          return
        }
        const userData = await response.json()
        setUser(userData)

        // Fetch DCA plans
        const plansResponse = await fetch("/api/dashboard/dca-plans")
        if (plansResponse.ok) {
          const plans = await plansResponse.json()
          setDcaPlans(plans)
        }
      } catch (error) {
        console.error("[v0] Auth check error:", error)
        router.push("/login")
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    )
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      router.push("/login")
    } catch (error) {
      console.error("[v0] Logout error:", error)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header Section */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Welcome back, {user?.name}</h1>
              <p className="text-muted-foreground mt-2">{user?.email}</p>
            </div>
            <Button onClick={handleLogout} variant="outline">
              Logout
            </Button>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* DCA Plans Section */}
            <div className="lg:col-span-2">
              <DCAPlansCard dcaPlans={dcaPlans} />
            </div>

            {/* Holdings Pie Chart Section */}
            <div className="lg:col-span-1">
              <HoldingsPieChart dcaPlans={dcaPlans} />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
