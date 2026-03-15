'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { LogOut, Menu } from 'lucide-react'
import Link from 'next/link'
import { DCAPlansCard } from '@/components/dashboard/dca-plans-card'
import { HoldingsPieChart } from '@/components/dashboard/holdings-pie-chart'

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
      setIsLoading(false)
    }

    getUser()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className={`${isSidebarOpen ? 'block' : 'hidden'} md:block fixed md:relative w-64 bg-card border-r border-border z-40 h-screen overflow-y-auto`}>
        <div className="p-6">
          <Link href="/" className="flex items-center gap-2 mb-8">
            <div className="bg-[#c4fa6b] p-2 rounded-lg">
              <span className="text-[#0a1628] font-bold">CV</span>
            </div>
            <span className="font-semibold text-foreground">CashVault</span>
          </Link>

          <nav className="space-y-2">
            <Link
              href="/dashboard"
              className="block px-4 py-2 rounded-lg bg-primary/10 text-primary font-medium"
            >
              Dashboard
            </Link>
            <Link
              href="/dashboard/settings"
              className="block px-4 py-2 rounded-lg text-muted-foreground hover:bg-muted transition-colors"
            >
              Settings
            </Link>
          </nav>

          <div className="mt-8 pt-6 border-t border-border">
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full justify-start gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-card border-b border-border px-4 md:px-8 py-4 flex items-center justify-between md:justify-end">
          <button
            className="md:hidden"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {user?.email}
            </span>
            <Button
              onClick={handleLogout}
              variant="ghost"
              size="sm"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-4 md:p-8 max-w-7xl mx-auto w-full">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-foreground mb-2">
                Welcome back!
              </h1>
              <p className="text-muted-foreground">
                Track your savings plans and investment holdings
              </p>
            </div>

            {/* Dashboard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - DCA Plans */}
              <div className="lg:col-span-2">
                <DCAPlansCard userId={user?.id} />
              </div>

              {/* Right Column - Holdings Chart */}
              <div className="lg:col-span-1">
                <HoldingsPieChart userId={user?.id} />
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 md:hidden z-30"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  )
}
