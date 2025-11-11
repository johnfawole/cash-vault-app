"use client"

import { useEffect, useState } from "react"
import { ArrowLeft, Download, Mail, User, Calendar } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface WaitlistEntry {
  id: number
  name: string
  email: string
  created_at: string
}

export function WaitlistDashboard() {
  const [entries, setEntries] = useState<WaitlistEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchWaitlist()
  }, [])

  const fetchWaitlist = async () => {
    try {
      const response = await fetch("/api/waitlist/list")
      const data = await response.json()

      if (data.success) {
        setEntries(data.data)
      } else {
        setError("Failed to load waitlist data")
      }
    } catch (err) {
      setError("Error fetching waitlist")
    } finally {
      setLoading(false)
    }
  }

  const exportToCSV = () => {
    const headers = ["Name", "Email", "Date Joined"]
    const rows = entries.map((entry) => [entry.name, entry.email, new Date(entry.created_at).toLocaleDateString()])

    const csv = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n")

    const blob = new Blob([csv], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `cashvault-waitlist-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Home</span>
          </Link>
          <h1 className="text-2xl font-bold">Waitlist Dashboard</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        {/* Stats */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-4xl font-bold mb-2">
              {loading ? "..." : entries.length} {entries.length === 1 ? "Signup" : "Signups"}
            </h2>
            <p className="text-muted-foreground">Total waitlist registrations</p>
          </div>
          <Button
            onClick={exportToCSV}
            disabled={entries.length === 0}
            className="bg-accent text-accent-foreground hover:bg-accent/90 font-semibold gap-2"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4" />
              <p className="text-muted-foreground">Loading waitlist data...</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 text-center">
            <p className="text-red-400">{error}</p>
          </div>
        ) : entries.length === 0 ? (
          <div className="bg-muted/30 border border-border rounded-lg p-12 text-center">
            <Mail className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No signups yet</h3>
            <p className="text-muted-foreground">Waitlist entries will appear here once people sign up.</p>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50 border-b border-border">
                  <tr>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-muted-foreground">ID</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-muted-foreground">Name</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-muted-foreground">Email</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-muted-foreground">Date Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry, index) => (
                    <tr
                      key={entry.id}
                      className={`border-b border-border last:border-b-0 hover:bg-muted/30 transition-colors ${
                        index % 2 === 0 ? "bg-background" : "bg-muted/10"
                      }`}
                    >
                      <td className="px-6 py-4 text-sm text-muted-foreground">#{entry.id}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{entry.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">{entry.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            {new Date(entry.created_at).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
