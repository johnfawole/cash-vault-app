'use server'

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
    
    const transactions: BankTransaction[] = []
    
    // Split by lines but preserve structure
    const lines = text.split('\n').map(line => line.trim())
    
    // Remove header row
    let dataStartIndex = 0
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('Date') && lines[i].includes('Money')) {
        dataStartIndex = i + 1
        break
      }
    }
    
    // Parse transactions - look for date patterns (DD/MM/YY)
    let i = dataStartIndex
    while (i < lines.length) {
      const line = lines[i]
      
      // Look for date pattern (DD/MM/YY)
      const dateMatch = line.match(/^(\d{1,2}\/\d{1,2}\/\d{2})/)
      if (!dateMatch) {
        i++
        continue
      }
      
      const transactionDate = dateMatch[1]
      
      // Next line typically contains time HH:MM:SS and amount
      const timeAndAmount = lines[i + 1]
      if (!timeAndAmount) break
      
      // Extract amount from the line (look for ₦ or numeric values with commas)
      const amountMatch = timeAndAmount.match(/₦\s*([\d,]+(?:\.\d{2})?)/)
      if (!amountMatch) {
        i++
        continue
      }
      
      const amount = parseFloat(amountMatch[1].replace(/,/g, ''))
      if (isNaN(amount) || amount === 0) {
        i++
        continue
      }
      
      // Extract category - usually on next lines
      let description = ''
      let descriptionLines = []
      let j = i + 2
      
      // Collect the next few lines as category and description
      while (j < lines.length && j < i + 8) {
        const currentLine = lines[j]
        
        // Stop if we hit another date (start of next transaction)
        if (currentLine.match(/^\d{1,2}\/\d{1,2}\/\d{2}/)) break
        
        // Stop if we hit a balance number
        if (currentLine.match(/^₦\s*[\d,]+(?:\.\d{2})?$/)) break
        
        if (currentLine.length > 0) {
          descriptionLines.push(currentLine)
        }
        j++
      }
      
      // Combine description lines
      if (descriptionLines.length > 0) {
        description = descriptionLines.join(' ')
      }
      
      // Clean up description
      description = description
        .replace(/₦\s*[\d,]+(?:\.\d{2})?/g, '') // Remove amounts
        .replace(/\s+/g, ' ')
        .trim()
        .substring(0, 100)
      
      if (description.length === 0) {
        description = 'Transaction'
      }
      
      transactions.push({
        date: transactionDate,
        description: description,
        amount: Math.abs(amount),
        category: categorizeTransaction(description)
      })
      
      // Move to next transaction (skip the lines we processed)
      i = j
    }
    
    if (transactions.length === 0) {
      throw new Error('No valid transactions found in PDF')
    }

    return transactions
  } catch (error) {
    console.error('[v0] PDF parsing error:', error)
    throw new Error('Failed to parse PDF: ' + (error instanceof Error ? error.message : 'Unknown error'))
  }
}

export async function uploadBankStatement(fileName: string, fileContent: string, isPDF: boolean = false) {
  try {
    // Determine file type and parse accordingly
    let transactions: BankTransaction[] = []
    
    if (isPDF) {
      // fileContent is Base64 encoded PDF
      transactions = await parsePDFContent(fileContent)
    } else {
      // fileContent is CSV text
      transactions = parseCSVContent(fileContent)
    }

    // Return parsed transactions for visualization
    return {
      success: true,
      transactionCount: transactions.length,
      transactions: transactions,
      totalAmount: transactions.reduce((sum, t) => sum + t.amount, 0),
    }
  } catch (error) {
    console.error('[v0] Bank statement upload error:', error)
    throw error
  }
}
