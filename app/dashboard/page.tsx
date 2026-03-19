'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LogOut, Menu } from 'lucide-react'
import Link from 'next/link'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { getConnectedAddress, onAccountsChanged } from '@/lib/walletConnector'

// Mock data for demo
const mockDCAPlans = [
  {
    id: '1',
    name: 'Bitcoin Investment',
    asset: 'BTC',
    frequency: 'Weekly',
    amount: 100,
    nextPayment: '2026-03-20',
  },
  {
    id: '2',
    name: 'Ethereum Savings',
    asset: 'ETH',
    frequency: 'Monthly',
    amount: 500,
    nextPayment: '2026-04-01',
  },
  {
    id: '3',
    name: 'Stablecoin Pool',
    asset: 'USDC',
    frequency: 'Weekly',
    amount: 250,
    nextPayment: '2026-03-18',
  },
]

const mockHoldings = [
  { name: 'BTC', value: 2500, percentage: 45 },
  { name: 'ETH', value: 1800, percentage: 32 },
  { name: 'USDC', value: 1200, percentage: 23 },
]

const COLORS = ['#c4fa6b', '#6fa6ff', '#ff6b9d']

export default function DashboardPage() {
  const router = useRouter()
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  useEffect(() => {
    let isMounted = true

    const checkAuth = async () => {
      try {
        const address = await getConnectedAddress()
        if (!address) {
          router.push('/dashboard/login')
          return
        }
        if (isMounted) {
          setWalletAddress(address)
        }
      } catch (error) {
        console.error('[v0] Wallet check error:', error)
        router.push('/dashboard/login')
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    checkAuth()

    // Listen for account changes
    const unsubscribe = onAccountsChanged((accounts) => {
      if (isMounted) {
        if (!accounts || accounts.length === 0) {
          // Wallet disconnected, redirect to login
          router.push('/dashboard/login')
        }
      }
    })

    return () => {
      isMounted = false
      unsubscribe()
    }
  }, [router])

  const handleLogout = () => {
    // Redirect to home when logout is clicked
    // User will need to manually disconnect wallet from MetaMask
    router.push('/')
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!walletAddress) {
    return null
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
        <header className="bg-card border-b border-border px-4 md:px-8 py-4 flex items-center justify-between">
          <button
            className="md:hidden"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground font-mono">{walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</span>
            <Button onClick={handleLogout} variant="ghost" size="sm">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-4 md:p-8 max-w-7xl mx-auto w-full">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-foreground mb-2">Welcome to Your Dashboard</h1>
              <p className="text-muted-foreground">Track your DCA savings plans and investment holdings</p>
            </div>

            {/* Dashboard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - DCA Plans */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Active DCA Plans</CardTitle>
                    <CardDescription>Your dollar-cost averaging investment plans</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {mockDCAPlans.map((plan) => (
                        <div key={plan.id} className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="font-semibold text-foreground">{plan.name}</h3>
                              <p className="text-sm text-muted-foreground">{plan.asset}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-foreground">${plan.amount}</p>
                              <p className="text-xs text-muted-foreground">{plan.frequency}</p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Next payment:</span>
                            <span className="font-medium">{plan.nextPayment}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Holdings Chart */}
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle>Holdings Distribution</CardTitle>
                    <CardDescription>Your asset allocation</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={mockHoldings}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percentage }) => `${name} ${percentage}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {mockHoldings.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>

                    {/* Holdings Summary */}
                    <div className="space-y-3 mt-6">
                      {mockHoldings.map((holding, idx) => (
                        <div key={idx} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx] }}></div>
                            <span className="text-muted-foreground">{holding.name}</span>
                          </div>
                          <span className="font-medium">${holding.value.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
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
