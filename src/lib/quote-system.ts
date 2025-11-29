// Quote Management System
export interface QuoteData {
  id: string
  name: string
  email: string
  company?: string
  description: string
  selectedFeatures: string[]
  complexity: 'basic' | 'standard' | 'premium'
  estimatedCost: number
  estimatedTimeline: number
  status: 'pending' | 'under_review' | 'quoted' | 'accepted' | 'in_progress' | 'completed'
  createdAt: string
  updatedAt: string
  adminNotes?: string
  finalQuote?: {
    cost: number
    timeline: number
    additionalItems: string[]
    terms: string
  }
  payment?: {
    upfrontAmount: number
    finalAmount: number
    upfrontPaid: boolean
    finalPaid: boolean
  }
}

export interface CustomerAccount {
  id: string
  name: string
  email: string
  company?: string
  password: string
  createdAt: string
  quotes: string[] // Array of quote IDs
}

import { loadQuotes, saveQuotes, loadCustomers, saveCustomers, initializeStorage } from './storage'

// Initialize storage on module load
initializeStorage()

export function generateQuoteId(): string {
  return `QT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export function generateCustomerId(): string {
  return `CU-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export function generatePassword(): string {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789'
  let password = ''
  for (let i = 0; i < 8; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
}

export async function createQuoteAndAccount(quoteData: Omit<QuoteData, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Promise<{
  quote: QuoteData
  customer: CustomerAccount
  tempPassword: string
}> {
  const quoteId = generateQuoteId()
  const customerId = generateCustomerId()
  const tempPassword = generatePassword()
  
  // Load existing data
  const quotes = await loadQuotes()
  const customers = await loadCustomers()
  
  // Create quote
  const quote: QuoteData = {
    ...quoteData,
    id: quoteId,
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  
  // Check if customer already exists
  let customer: CustomerAccount | undefined = customers.find((c: CustomerAccount) => c.email === quoteData.email)
  
  if (!customer) {
    // Create new customer account
    customer = {
      id: customerId,
      name: quoteData.name,
      email: quoteData.email,
      company: quoteData.company,
      password: tempPassword, // In real app, this would be hashed
      createdAt: new Date().toISOString(),
      quotes: [quoteId]
    }
    customers.push(customer)
  } else {
    // Add quote to existing customer
    customer.quotes.push(quoteId)
  }
  
  quotes.push(quote)
  
  // Save updated data
  await saveQuotes(quotes)
  await saveCustomers(customers)
  
  return { quote, customer, tempPassword }
}

// Note: These functions are commented out as they reference undefined global variables
// They would need to be made async and load data from storage to work properly

// export function getQuotesByCustomer(customerId: string): QuoteData[] {
//   const customer = customers.find(c => c.id === customerId)
//   if (!customer) return []
//   
//   return quotes.filter(q => customer.quotes.includes(q.id))
// }

// export function getAllQuotes(): QuoteData[] {
//   return quotes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
// }

// export function updateQuoteStatus(quoteId: string, status: QuoteData['status'], adminNotes?: string): boolean {
//   const quote = quotes.find(q => q.id === quoteId)
//   if (!quote) return false
  
//   quote.status = status
//   quote.updatedAt = new Date().toISOString()
//   if (adminNotes) quote.adminNotes = adminNotes
  
//   return true
// }

// export function updateQuoteWithFinalQuote(
//   quoteId: string, 
//   finalQuote: QuoteData['finalQuote']
// ): boolean {
//   const quote = quotes.find(q => q.id === quoteId)
//   if (!quote) return false
  
//   quote.finalQuote = finalQuote
//   quote.status = 'quoted'
//   quote.updatedAt = new Date().toISOString()
  
//   // Calculate payment amounts (20% upfront, 80% on completion)
//   const upfrontAmount = Math.round(finalQuote.cost * 0.2)
//   const finalAmount = finalQuote.cost - upfrontAmount
  
//   quote.payment = {
//     upfrontAmount,
//     finalAmount,
//     upfrontPaid: false,
//     finalPaid: false
//   }
  
//   return true
// }

export function acceptQuote(quoteId: string): boolean {
  // const quote = quotes.find(q => q.id === quoteId)
  // if (!quote || quote.status !== 'quoted') return false
  
  // quote.status = 'accepted'
  // quote.updatedAt = new Date().toISOString()
  
  // return true
  return false
}

export function processPayment(quoteId: string, paymentType: 'upfront' | 'final'): boolean {
  // const quotes = await loadQuotes()
  // const quote = quotes.find(q => q.id === quoteId)
  // if (!quote || !quote.payment) return false
  
  // if (paymentType === 'upfront') {
  //   quote.payment.upfrontPaid = true
  //   quote.status = 'in_progress'
  // } else {
  //   quote.payment.finalPaid = true
  //   quote.status = 'completed'
  // }
  
  // quote.updatedAt = new Date().toISOString()
  // await saveQuotes(quotes)
  // return true
  return false
}

export async function authenticateCustomer(email: string, password: string): Promise<CustomerAccount | null> {
  const customers = await loadCustomers()
  const customer = customers.find((c: CustomerAccount) => c.email === email && c.password === password)
  return customer || null
}

// Email simulation functions (in real app, these would send actual emails)
export function sendWelcomeEmail(customer: CustomerAccount, tempPassword: string, quote: QuoteData) {
  console.log(`
    📧 Welcome Email Sent to: ${customer.email}
    
    Subject: Your Quote Request & Account Details
    
    Dear ${customer.name},
    
    Thank you for your quote request! We've created your customer account:
    
    🔐 Login Details:
    Email: ${customer.email}
    Password: ${tempPassword}
    
    📋 Quote Summary:
    Quote ID: ${quote.id}
    Estimated Cost: £${quote.estimatedCost.toLocaleString()}
    Timeline: ${quote.estimatedTimeline} days
    Status: Under Review
    
    You can track your quote progress at: /client
    
    We'll review your requirements and get back to you within 24 hours.
    
    Best regards,
    Development Team
  `)
}

export function sendAdminNotification(quote: QuoteData, customer: CustomerAccount) {
  console.log(`
    🔔 Admin Notification: New Quote Request
    
    Quote ID: ${quote.id}
    Customer: ${customer.name} (${customer.email})
    Company: ${customer.company || 'N/A'}
    Estimated Value: £${quote.estimatedCost.toLocaleString()}
    
    Features: ${quote.selectedFeatures.join(', ')}
    Complexity: ${quote.complexity}
    
    Description: ${quote.description}
    
    Action Required: Review and respond within 24 hours
    Admin Panel: /admin
  `)
}
