// Client-side billing interfaces and utilities
// Note: All file operations moved to API routes to avoid client-side fs usage

export interface PaymentMethod {
  id: string
  type: 'visa' | 'mastercard' | 'amex' | 'paypal'
  last4: string
  expiryMonth: number
  expiryYear: number
  isDefault: boolean
  customerId: string
}

export interface Invoice {
  id: string
  customerId: string
  projectId: string
  projectName: string
  amount: number
  status: 'paid' | 'pending' | 'overdue' | 'cancelled'
  issueDate: string
  dueDate: string
  paidDate?: string
  items: InvoiceItem[]
}

export interface InvoiceItem {
  description: string
  quantity: number
  unitPrice: number
  total: number
}

export interface BillingSettings {
  customerId: string
  emailInvoices: boolean
  autoPayEnabled: boolean
  billingAddress: {
    street: string
    city: string
    state: string
    postalCode: string
    country: string
  }
  taxId?: string
}

export interface BillingStats {
  totalSpent: number
  outstanding: number
  nextPaymentAmount: number
  nextPaymentDate: string | null
}

// Client-side API functions
export async function getBillingData(customerId: string): Promise<{
  stats: BillingStats
  paymentMethods: PaymentMethod[]
  invoices: Invoice[]
  settings: BillingSettings | null
} | null> {
  try {
    const response = await fetch(`/api/billing?customerId=${customerId}`)
    if (response.ok) {
      const result = await response.json()
      return result.success ? result.data : null
    }
    return null
  } catch (error) {
    console.error('Error fetching billing data:', error)
    return null
  }
}

export async function addPaymentMethod(customerId: string, method: Omit<PaymentMethod, 'id' | 'customerId'>): Promise<PaymentMethod | null> {
  try {
    const response = await fetch('/api/billing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        requestType: 'payment-method', 
        customerId, 
        paymentMethod: method 
      })
    })
    if (response.ok) {
      const result = await response.json()
      return result.success ? result.data : null
    }
    return null
  } catch (error) {
    console.error('Error adding payment method:', error)
    return null
  }
}
