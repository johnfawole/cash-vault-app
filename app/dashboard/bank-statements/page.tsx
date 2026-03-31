'use client'

import { useState, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { Upload, ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { uploadBankStatement } from '@/app/actions/bank-statement-actions'

const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#6366f1']

export default function BankStatementsPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [categoryData, setCategoryData] = useState<Array<{name: string, value: number}>>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

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
        // For PDF, read as ArrayBuffer and convert to Base64
        const arrayBuffer = await file.arrayBuffer()
        const bytes = new Uint8Array(arrayBuffer)
        let binary = ''
        for (let i = 0; i < bytes.byteLength; i++) {
          binary += String.fromCharCode(bytes[i])
        }
        content = btoa(binary) // Base64 encode
      } else {
        // For CSV, read as text
        content = await file.text()
      }
      
      const result = await uploadBankStatement(file.name, content, isPDF)
      
      setSuccess(`Successfully uploaded ${result.transactionCount} transactions`)
      
      // Process transactions to calculate spending by category
      const categorySpending: { [key: string]: number } = {}
      if (result.transactions) {
        result.transactions.forEach((transaction: any) => {
          const category = transaction.category || 'Uncategorized'
          categorySpending[category] = (categorySpending[category] || 0) + transaction.amount
        })
      }
      
      // Convert to chart format
      const chartData = Object.entries(categorySpending).map(([name, value]) => ({
        name,
        value: Number(value)
      }))
      
      setCategoryData(chartData)

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload bank statement'
      setError(errorMessage)
      console.error('[v0] Upload error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
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

        {/* File Upload Section */}
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

        {/* Charts and Data Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Pie Chart */}
          {categoryData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Spending by Category</CardTitle>
                <CardDescription>
                  Breakdown of your expenses across categories
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.name}: $${entry.value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>

                {/* Summary Stats */}
                <div className="mt-8 space-y-3">
                  <div className="font-semibold text-sm text-muted-foreground">Category Breakdown:</div>
                  {categoryData.map((item, index) => (
                    <div key={item.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span>{item.name}</span>
                      </div>
                      <span className="font-medium">${item.value.toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="border-t pt-3 mt-3 flex justify-between font-semibold">
                    <span>Total</span>
                    <span>${categoryData.reduce((sum, item) => sum + item.value, 0).toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Uploads */}
          {statements.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recent Uploads</CardTitle>
                <CardDescription>
                  Your bank statement history
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {statements.map((statement) => (
                    <div
                      key={statement.id}
                      className="p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <p className="font-medium text-sm truncate">{statement.file_name}</p>
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>{statement.transaction_count} transactions</span>
                        <span>${statement.total_amount?.toFixed(2) || '0.00'}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(statement.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {categoryData.length === 0 && statements.length === 0 && (
          <Card>
            <CardContent className="pt-8 text-center">
              <p className="text-muted-foreground mb-4">No bank statements uploaded yet</p>
              <p className="text-sm text-muted-foreground">
                Upload your first bank statement CSV to get started
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  )
}
