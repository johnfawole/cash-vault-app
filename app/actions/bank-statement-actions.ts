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
    const pdfBuffer = Buffer.from(pdfBase64, 'base64')
    const data = await pdfParse(pdfBuffer)
    const text = data.text
    
    const transactions: BankTransaction[] = []
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0)
    
    // Find where actual transaction data starts (after header with Date/Money columns)
    let dataStartIndex = 0
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('Date') && lines[i].includes('Money')) {
        dataStartIndex = i + 1
        break
      }
    }
    
    let i = dataStartIndex
    while (i < lines.length) {
      // Look for date pattern (DD/MM/YY)
      const dateMatch = lines[i].match(/^(\d{1,2}\/\d{1,2}\/\d{2})/)
      if (!dateMatch) {
        i++
        continue
      }
      
      const transactionDate = dateMatch[1]
      i++
      
      // Collect lines until we find amounts
      let moneyIn = 0
      let moneyOut = 0
      let descriptionLines: string[] = []
      let foundTransactionData = false
      let tempI = i
      let maxCheckLines = 50
      
      // Scan next lines to find Money In/Out or single amount
      while (tempI < lines.length && tempI < i + maxCheckLines) {
        const currentLine = lines[tempI]
        
        // Stop if we hit another date
        if (currentLine.match(/^\d{1,2}\/\d{1,2}\/\d{2}/) && tempI > i) break
        
        // Look for two columns of amounts (Money In | Money Out format)
        const twoAmountsMatch = currentLine.match(/₦\s*([\d,]+(?:\.\d{2})?)\s+[\s|]*₦\s*([\d,]+(?:\.\d{2})?)/)
        if (twoAmountsMatch) {
          moneyIn = parseFloat(twoAmountsMatch[1].replace(/,/g, ''))
          moneyOut = parseFloat(twoAmountsMatch[2].replace(/,/g, ''))
          foundTransactionData = true
          break
        }
        
        // Look for single amount with ₦ symbol
        const singleAmountMatch = currentLine.match(/₦\s*([\d,]+(?:\.\d{2})?)/)
        if (singleAmountMatch && !foundTransactionData) {
          const amount = parseFloat(singleAmountMatch[1].replace(/,/g, ''))
          // Assume single column is money out (expense)
          moneyOut = amount
          foundTransactionData = true
          break
        }
        
        // Collect potential description lines (anything that's not just time or pure numbers)
        if (currentLine.length > 2 && 
            !currentLine.match(/^\d{1,2}:\d{1,2}:\d{1,2}$/) &&
            !currentLine.match(/^[\d,]+(?:\.\d{2})?$/) &&
            !currentLine.match(/^₦/)) {
          descriptionLines.push(currentLine)
        }
        
        tempI++
      }
      
      // If we found transaction data, create the transaction
      if (foundTransactionData && (moneyIn > 0 || moneyOut > 0)) {
        // Create transaction(s) for money in and money out
        if (moneyIn > 0) {
          let description = descriptionLines.join(' ')
            .replace(/₦\s*[\d,]+(?:\.\d{2})?/g, '')
            .replace(/\s+/g, ' ')
            .trim()
            .substring(0, 150)
          
          if (!description || description.length < 2) description = 'Received'
          
          transactions.push({
            date: transactionDate,
            description: description,
            amount: moneyIn,
            category: categorizeTransaction(description),
            type: 'in'
          } as any)
        }
        
        if (moneyOut > 0) {
          let description = descriptionLines.join(' ')
            .replace(/₦\s*[\d,]+(?:\.\d{2})?/g, '')
            .replace(/\s+/g, ' ')
            .trim()
            .substring(0, 150)
          
          if (!description || description.length < 2) description = 'Sent'
          
          transactions.push({
            date: transactionDate,
            description: description,
            amount: -moneyOut, // Make negative for sent
            category: categorizeTransaction(description),
            type: 'out'
          } as any)
        }
        
        i = tempI + 1
      } else {
        i++
      }
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
