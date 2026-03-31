'use server'

import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import pdfParse from 'pdf-parse'

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

async function parsePDFContent(pdfBase64: string): Promise<BankTransaction[]> {
  try {
    // Decode Base64 to Buffer
    const pdfBuffer = Buffer.from(pdfBase64, 'base64')
    const data = await pdfParse(pdfBuffer)
    const text = data.text
    
    console.log('[v0] PDF extracted text length:', text.length)
    console.log('[v0] PDF text preview:', text.substring(0, 800))
    
    // Split text into lines and filter empty ones
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0)
    const transactions: BankTransaction[] = []

    // Look for transaction patterns in PDF
    // Bank statements typically have: Date | Amount | Description or similar
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      
      // Skip headers and metadata lines
      if (line.includes('Date') || line.includes('Statement') || line.includes('Account') || 
          line.includes('Balance') || line.includes('Page') || line.length < 10) continue
      
      // Look for date patterns (multiple formats)
      const dateMatch = line.match(/(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4}|\d{4}[-\/]\d{1,2}[-\/]\d{1,2}|\d{1,2}\s(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s\d{2,4})/i)
      if (!dateMatch) continue
      
      // Look for currency amounts (patterns like 1,234.56 or 1234.56 or £1,234.56)
      const amountMatches = line.match(/[\$£€]?\s*(\d{1,3}(?:[,\s]\d{3})*(?:\.\d{2})?)/g)
      if (!amountMatches || amountMatches.length === 0) continue
      
      // Extract the first (or largest) amount as the transaction amount
      let amount = 0
      for (const match of amountMatches) {
        const num = parseFloat(match.replace(/[$£€,\s]/g, ''))
        if (!isNaN(num) && num > amount) {
          amount = num
        }
      }
      
      if (amount === 0 || isNaN(amount)) continue
      
      // Extract description by removing date and amounts from the line
      let description = line
        .replace(dateMatch[0], '')
        .replace(/[\$£€]?\s*[\d,.\s]+/g, ' ')
        .trim()
      
      // Clean up description - remove extra spaces
      description = description.replace(/\s+/g, ' ').substring(0, 100).trim()
      
      if (description.length < 2) {
        description = 'Transaction'
      }
      
      console.log('[v0] Found transaction - Date:', dateMatch[0], 'Amount:', amount, 'Desc:', description)
      
      transactions.push({
        date: dateMatch[0],
        description: description,
        amount: Math.abs(amount),
        category: categorizeTransaction(description)
      })
    }

    console.log('[v0] Total transactions extracted from PDF:', transactions.length)
    
    if (transactions.length === 0) {
      throw new Error('No valid transactions found in PDF. Could not parse date/amount patterns.')
    }

    return transactions
  } catch (error) {
    console.error('[v0] PDF parsing error:', error)
    throw new Error('Failed to parse PDF: ' + (error instanceof Error ? error.message : 'Unknown error'))
  }
}

export async function uploadBankStatement(fileName: string, fileContent: string, isPDF: boolean = false) {
  try {
    const cookieStore = await cookies()
    const supabase = createClient()

    // Get authenticated user email from auth session (optional)
    const sessionCookie = cookieStore.get('cashvault_session')
    const userEmail = sessionCookie ? JSON.parse(sessionCookie.value).email : 'anonymous'

    // Determine file type and parse accordingly
    let transactions: BankTransaction[] = []
    
    if (isPDF) {
      // fileContent is Base64 encoded PDF
      transactions = await parsePDFContent(fileContent)
    } else {
      // fileContent is CSV text
      transactions = parseCSVContent(fileContent)
    }

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
      // Return empty data if not authenticated
      return []
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
      // Return empty data if not authenticated
      return []
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
