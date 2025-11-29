// Client-side quote system using API routes

export interface QuoteData {
  id: string
  name: string
  email: string
  company?: string
  projectName?: string
  description: string
  estimatedCost: number
  estimatedTimeline: string
  rushDelivery?: 'standard' | 'priority' | 'express'
  selectedPackage?: {
    id: string
    name: string
    price: number
    features: string[]
    deliveryTime: string
    category: string
    complexity: string
  } | null
  status: 'pending' | 'under_review' | 'quoted' | 'accepted' | 'in_progress' | 'completed'
  createdAt: string
  updatedAt: string
}

export interface CustomerAccount {
  id: string
  name: string
  email: string
  company?: string
  createdAt: string
  quotes: string[]
}

export async function createQuoteAndAccount(quoteData: Omit<QuoteData, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Promise<{
  quote: QuoteData
  customer: CustomerAccount
  tempPassword: string
}> {
  const response = await fetch('/api/quotes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(quoteData),
  })

  if (!response.ok) {
    throw new Error('Failed to create quote')
  }

  const data = await response.json()
  
  if (!data.success) {
    throw new Error(data.error || 'Failed to create quote')
  }

  return {
    quote: data.quote,
    customer: data.customer,
    tempPassword: data.tempPassword
  }
}

export async function authenticateCustomer(email: string, password: string): Promise<CustomerAccount | null> {
  const response = await fetch('/api/auth', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  })

  if (!response.ok) {
    if (response.status === 401) {
      return null // Invalid credentials
    }
    throw new Error('Authentication failed')
  }

  const data = await response.json()
  
  if (!data.success) {
    return null
  }

  return data.customer
}

export async function createCustomerAccount(customerData: {
  name: string
  email: string
  password: string
  company?: string
}): Promise<CustomerAccount | null> {
  const response = await fetch('/api/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(customerData),
  })

  if (!response.ok) {
    if (response.status === 409) {
      throw new Error('An account with this email already exists')
    }
    throw new Error('Registration failed')
  }

  const data = await response.json()
  
  if (!data.success) {
    throw new Error(data.error || 'Registration failed')
  }

  return data.customer
}

// Email simulation functions (in real app, these would send actual emails)
export function sendWelcomeEmail(customer: CustomerAccount, tempPassword: string, quote: QuoteData) {
  console.log(`
    📧 Welcome Email Sent to: ${customer.email || 'N/A'}
    
    Subject: Your Quote Request & Account Details
    
    Dear ${customer.name || 'Valued Customer'},
    
    Thank you for your quote request! We've created your customer account:
    
    🔐 Login Details:
    Email: ${customer.email || 'N/A'}
    Password: ${tempPassword || 'N/A'}
    
    📋 Quote Summary:
    Quote ID: ${quote.id || 'N/A'}
    Quoted Price: £${(quote.estimatedCost || 0).toLocaleString()}
    Timeline: ${quote.estimatedTimeline || 'N/A'} days
    Status: Under Review
    
    You can track your quote progress at: /client
    
    We'll review your requirements and get back to you within 24 hours.
    
    Best regards,
    Development Team
  `)
}

export function sendAdminNotification(quote: QuoteData, customer: CustomerAccount) {
  const packageInfo = quote.selectedPackage 
    ? `
    📦 Selected Package: ${quote.selectedPackage.name}
    Package Price: £${(quote.selectedPackage.price || 0).toLocaleString()}
    Delivery Time: ${quote.selectedPackage.deliveryTime}
    Category: ${quote.selectedPackage.category}
    
    Package Features:
    ${(quote.selectedPackage.features || []).map(f => `    • ${f}`).join('\n')}
    `
    : `
    🔧 Custom Quote Request
    No specific package selected
    `

  console.log(`
    🔔 Admin Notification: New Quote Request
    
    Quote ID: ${quote.id || 'N/A'}
    Customer: ${customer.name || 'N/A'} (${customer.email || 'N/A'})
    Company: ${customer.company || 'N/A'}
    Quoted Value: £${(quote.estimatedCost || 0).toLocaleString()}
    ${packageInfo}
    Rush Delivery: ${quote.rushDelivery || 'Standard'}
    
    Description: ${quote.description || 'No description provided'}
    
    Action Required: Review and respond within 24 hours
    Admin Panel: /admin
  `)
}
