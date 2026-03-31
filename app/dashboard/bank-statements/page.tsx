'use client'

import { useState, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Upload, ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { uploadBankStatement } from '@/app/actions/bank-statement-actions'

export default function BankStatementsPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [allTransactions, setAllTransactions] = useState<Array<{date: string, description: string, amount: number}>>([])
  const [sentData, setSentData] = useState<Array<{name: string, value: number}>>([])
  const [receivedData, setReceivedData] = useState<Array<{name: string, value: number}>>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

const COLORS = ['#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e', '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6', '#d946ef', '#ec4899']

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB')
      return
    }

    const isCSV = file.name.endsWith('.csv')
    const isPDF = file.name.endsWith('.pdf')

    if (!isCSV && !isPDF) {
      setError('Please upload a CSV or PDF file')
      return
    }

    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      let content: string
      
      if (isPDF) {
        const arrayBuffer = await file.arrayBuffer()
        const bytes = new Uint8Array(arrayBuffer)
        let binary = ''
        for (let i = 0; i < bytes.byteLength; i++) {
          binary += String.fromCharCode(bytes[i])
        }
        content = btoa(binary)
      } else {
        content = await file.text()
      }
      
      const result = await uploadBankStatement(file.name, content, isPDF)
      
      setSuccess(`Successfully uploaded ${result.transactionCount} transactions`)
      setAllTransactions(result.transactions)
      
      // Group transactions by description and separate into sent/received
      const sentByDesc: { [key: string]: number } = {}
      const receivedByDesc: { [key: string]: number } = {}
      
      result.transactions.forEach((transaction: any) => {
        const desc = transaction.description.substring(0, 20)
        
        // Assuming negative amounts are expenses (sent), positive are income (received)
        if (transaction.amount > 0) {
          receivedByDesc[desc] = (receivedByDesc[desc] || 0) + transaction.amount
        } else {
          sentByDesc[desc] = (sentByDesc[desc] || 0) + Math.abs(transaction.amount)
        }
      })
      
      // Convert to chart format with percentages
      const sentChartData = Object.entries(sentByDesc).map(([name, value]) => ({
        name,
        value
      }))
      
      const receivedChartData = Object.entries(receivedByDesc).map(([name, value]) => ({
        name,
        value
      }))
      
      setSentData(sentChartData)
      setReceivedData(receivedChartData)

      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload bank statement'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-4xl font-bold mb-2">Bank Statements</h1>
          <p className="text-muted-foreground">
            Upload your bank statement CSV or PDF to visualize spending by category
          </p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Upload Bank Statement</CardTitle>
            <CardDescription>
              Upload a CSV or PDF file with transaction data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className="border-2 border-dashed border-muted rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
              <p className="font-medium mb-1">Click to upload or drag and drop</p>
              <p className="text-sm text-muted-foreground mb-4">CSV or PDF files up to 10MB</p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.pdf"
                onChange={handleFileUpload}
                disabled={isLoading}
                className="hidden"
              />
              <Button disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Select File
                  </>
                )}
              </Button>
            </div>

            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                {success}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {allTransactions.length > 0 && (
            <>
              {/* Transaction List */}
              <Card className="lg:col-span-3">
                <CardHeader>
                  <CardTitle>Recent Transactions</CardTitle>
                  <CardDescription>
                    Latest transactions from your bank statement
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {allTransactions.slice(0, 10).map((transaction, idx) => (
                      <div key={idx} className="flex items-center justify-between text-sm border-b pb-2 last:border-b-0">
                        <div className="flex-1">
                          <p className="font-medium truncate">{transaction.description}</p>
                          <p className="text-xs text-muted-foreground">{transaction.date}</p>
                        </div>
                        <span className={`font-semibold px-2 py-1 rounded whitespace-nowrap ml-2 ${
                          transaction.amount > 0 
                            ? 'bg-green-100 text-green-900' 
                            : 'bg-red-100 text-red-900'
                        }`}>
                          {transaction.amount > 0 ? '+' : ''}₦{Math.abs(transaction.amount).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Pie Charts */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Money Sent</CardTitle>
                  <CardDescription>(Expenses)</CardDescription>
                </CardHeader>
                <CardContent>
                  {sentData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={sentData}
                          cx="50%"
                          cy="50%"
                          labelLine={true}
                          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(1)}%)`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {sentData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => `₦${value.toLocaleString()}`} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-64 flex items-center justify-center text-muted-foreground">
                      No expenses found
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Money Received</CardTitle>
                  <CardDescription>(Income)</CardDescription>
                </CardHeader>
                <CardContent>
                  {receivedData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={receivedData}
                          cx="50%"
                          cy="50%"
                          labelLine={true}
                          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(1)}%)`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {receivedData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => `₦${value.toLocaleString()}`} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-64 flex items-center justify-center text-muted-foreground">
                      No income found
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
          {allTransactions.length === 0 && (
            <Card>
              <CardContent className="pt-8 text-center">
                <p className="text-muted-foreground mb-4">No bank statements uploaded yet</p>
                <p className="text-sm text-muted-foreground">
                  Upload your first bank statement CSV or PDF to get started
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </main>
  )
}
