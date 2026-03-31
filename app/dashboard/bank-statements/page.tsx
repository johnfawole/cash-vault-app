'use client'

import { useState, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Upload, ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { uploadBankStatement } from '@/app/actions/bank-statement-actions'

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
      
      // Group transactions by similar descriptions
      const groupedTransactions: { [key: string]: number } = {}
      if (result.transactions) {
        result.transactions.forEach((transaction: any) => {
          // Extract key phrase from description (first few words or keywords)
          let groupKey = transaction.description
          
          // Try to find a recognizable pattern/keyword to group by
          const words = transaction.description.toLowerCase().split(/[\s\/\-]+/)
          
          // Look for common transaction type keywords
          for (const word of words) {
            if (word.length > 3) {
              groupKey = word.charAt(0).toUpperCase() + word.slice(1)
              break
            }
          }
          
          groupedTransactions[groupKey] = (groupedTransactions[groupKey] || 0) + 1
        })
      }
      
      // Convert to chart format (count of similar transactions)
      const chartData = Object.entries(groupedTransactions)
        .map(([name, count]) => ({
          name: name.substring(0, 20), // Truncate long names
          count: count
        }))
        .sort((a, b) => b.count - a.count) // Sort by frequency
      
      setCategoryData(chartData)

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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {categoryData.length > 0 && (
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Transaction Type Frequency</CardTitle>
                <CardDescription>
                  Count of similar transactions grouped by description
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={categoryData} margin={{ top: 20, right: 30, left: 0, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="name" 
                      angle={-45}
                      textAnchor="end"
                      height={120}
                    />
                    <YAxis label={{ value: 'Number of Transactions', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3b82f6" name="Transaction Count" />
                  </BarChart>
                </ResponsiveContainer>

                <div className="mt-8 space-y-3">
                  <div className="font-semibold text-sm text-muted-foreground">Transaction Breakdown:</div>
                  {categoryData.map((item) => (
                    <div key={item.name} className="flex items-center justify-between text-sm border-b pb-2 last:border-b-0">
                      <span>{item.name}</span>
                      <span className="font-medium bg-blue-100 text-blue-900 px-2 py-1 rounded">{item.count} transactions</span>
                    </div>
                  ))}
                  <div className="border-t pt-3 mt-3 flex justify-between font-semibold">
                    <span>Total Transactions</span>
                    <span>{categoryData.reduce((sum, item) => sum + item.count, 0)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {categoryData.length === 0 && (
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
