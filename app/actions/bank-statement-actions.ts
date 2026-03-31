'use server'

import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

interface BankTransaction {
  date: string
  description: string
  amount: number
  category: string
}

// Category keywords for automatic classification
const categoryKeywords: Record<string, string[]> = {
  'Groceries': ['supermarket', 'grocery', 'trader joe', 'whole foods', 'safeway', 'kroger', 'food', 'farmer market'],
  'Transport': ['uber', 'lyft', 'taxi', 'gas station', 'fuel', 'parking', 'metro', 'transit', 'train', 'bus', 'airline', 'flight'],
  'Entertainment': ['netflix', 'spotify', 'movie', 'cinema', 'concert', 'theater', 'gaming', 'steam', 'playstation', 'entertainment'],
  'Dining': ['restaurant', 'cafe', 'coffee', 'pizza', 'burger', 'dining', 'food delivery', 'doordash', 'ubereats', 'grubhub'],
  'Shopping': ['amazon', 'retail', 'mall', 'shop', 'store', 'target', 'walmart', 'clothing', 'fashion'],
  'Utilities': ['electric', 'water', 'gas bill', 'internet', 'phone bill', 'utilities'],
  'Healthcare': ['pharmacy', 'doctor', 'hospital', 'medical', 'clinic', 'health'],
  'Other': []
}

function categorizeTransaction(description: string): string {
  const lowerDesc = description.toLowerCase()
  
  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    if (category === 'Other') continue
    for (const keyword of keywords) {
      if (lowerDesc.includes(keyword)) {
        return category
      }
    }
  }
  
  return 'Other'
}

function parseCSVContent(content: string): BankTransaction[] {
  const lines = content.trim().split('\n')
  if (lines.length < 2) {
    throw new Error('CSV must have at least a header row and one data row')
  }

  const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
  const transactions: BankTransaction[] = []

  // Find column indices (flexible to handle different CSV formats)
  const dateIndex = headers.findIndex(h => h.includes('date'))
  const descIndex = headers.findIndex(h => h.includes('description') || h.includes('desc') || h.includes('name'))
  const amountIndex = headers.findIndex(h => h.includes('amount') || h.includes('value'))

  if (dateIndex === -1 || descIndex === -1 || amountIndex === -1) {
    throw new Error('CSV must have Date, Description, and Amount columns')
  }

  // Parse data rows
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue

    const columns = line.split(',').map(c => c.trim())
    const date = columns[dateIndex]
    const description = columns[descIndex]
    const amountStr = columns[amountIndex].replace(/[$,]/g, '')
    const amount = parseFloat(amountStr)

    if (!date || !description || isNaN(amount)) {
      continue
    }

    transactions.push({
      date,
      description,
      amount: Math.abs(amount), // Ensure positive amounts
      category: categorizeTransaction(description)
    })
  }

  if (transactions.length === 0) {
    throw new Error('No valid transactions found in CSV')
  }

  return transactions
}

export async function uploadBankStatement(fileName: string, csvContent: string) {
  try {
    const cookieStore = await cookies()
    const supabase = createClient()

    // Get authenticated user email from auth session
    const sessionCookie = cookieStore.get('cashvault_session')
    if (!sessionCookie) {
      throw new Error('Not authenticated')
    }

    const session = JSON.parse(sessionCookie.value)
    const userEmail = session.email

    // Parse transactions
    const transactions = parseCSVContent(csvContent)

    // Insert bank statement
    const { data: statementData, error: statementError } = await supabase
      .from('bank_statements')
      .insert({
        user_email: userEmail,
        file_name: fileName,
        transaction_count: transactions.length,
        total_amount: transactions.reduce((sum, t) => sum + t.amount, 0),
      })
      .select()
      .single()

    if (statementError) throw statementError

    // Insert transactions
    const transactionsToInsert = transactions.map(t => ({
      statement_id: statementData.id,
      user_email: userEmail,
      date: t.date,
      description: t.description,
      amount: t.amount,
      category: t.category,
    }))

    const { error: transactionsError } = await supabase
      .from('bank_transactions')
      .insert(transactionsToInsert)

    if (transactionsError) throw transactionsError

    return {
      success: true,
      statementId: statementData.id,
      transactionCount: transactions.length,
    }
  } catch (error) {
    console.error('[v0] Bank statement upload error:', error)
    throw error
  }
}

export async function getUserBankStatements() {
  try {
    const cookieStore = await cookies()
    const supabase = createClient()

    const sessionCookie = cookieStore.get('cashvault_session')
    if (!sessionCookie) {
      throw new Error('Not authenticated')
    }

    const session = JSON.parse(sessionCookie.value)
    const userEmail = session.email

    const { data, error } = await supabase
      .from('bank_statements')
      .select('*')
      .eq('user_email', userEmail)
      .order('created_at', { ascending: false })

    if (error) throw error

    return data || []
  } catch (error) {
    console.error('[v0] Error fetching bank statements:', error)
    throw error
  }
}

export async function getCategorySpending(statementId?: string) {
  try {
    const cookieStore = await cookies()
    const supabase = createClient()

    const sessionCookie = cookieStore.get('cashvault_session')
    if (!sessionCookie) {
      throw new Error('Not authenticated')
    }

    const session = JSON.parse(sessionCookie.value)
    const userEmail = session.email

    let query = supabase
      .from('bank_transactions')
      .select('category, amount')
      .eq('user_email', userEmail)

    if (statementId) {
      query = query.eq('statement_id', statementId)
    }

    const { data, error } = await query

    if (error) throw error

    // Aggregate by category
    const categoryTotals: Record<string, number> = {}
    
    data?.forEach(transaction => {
      if (!categoryTotals[transaction.category]) {
        categoryTotals[transaction.category] = 0
      }
      categoryTotals[transaction.category] += transaction.amount
    })

    return Object.entries(categoryTotals).map(([name, value]) => ({
      name,
      value: parseFloat(value.toFixed(2))
    }))
  } catch (error) {
    console.error('[v0] Error getting category spending:', error)
    throw error
  }
}

export async function getBankTransactions(statementId: string) {
  try {
    const cookieStore = await cookies()
    const supabase = createClient()

    const sessionCookie = cookieStore.get('cashvault_session')
    if (!sessionCookie) {
      throw new Error('Not authenticated')
    }

    const session = JSON.parse(sessionCookie.value)
    const userEmail = session.email

    const { data, error } = await supabase
      .from('bank_transactions')
      .select('*')
      .eq('statement_id', statementId)
      .eq('user_email', userEmail)
      .order('date', { ascending: false })

    if (error) throw error

    return data || []
  } catch (error) {
    console.error('[v0] Error fetching transactions:', error)
    throw error
  }
}
