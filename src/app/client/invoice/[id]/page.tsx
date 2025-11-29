'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'
import { useAuth } from '@/contexts/auth-context'
import { 
  ArrowLeft, 
  Download, 
  Printer, 
  Calendar, 
  CreditCard, 
  Package,
  Info,
  Building,
  Mail,
  Phone,
  MapPin
} from 'lucide-react'

interface InvoiceData {
  id: string
  quote_id?: string
  name?: string
  email?: string
  company?: string
  description?: string
  estimatedCost?: number
  estimatedTimeline?: string
  status: string
  createdAt?: string
  updatedAt?: string
  // Billing-specific fields
  customerId?: string
  projectId?: string
  projectName?: string
  amount?: number
  issueDate?: string
  dueDate?: string
  paidDate?: string
  items?: any[]
  depositRequired?: boolean
  depositAmount?: number
  depositPaid?: boolean
  depositDueDate?: string
  remainingAmount?: number
  // Quote-specific fields
  selectedPackage?: {
    id: string
    name: string
    price: number
    features: string[]
    deliveryTime: string
    category: string
    complexity: string
  }
  selectedFeatures?: string[]
  rushDelivery?: string
}

export default function InvoicePage() {
  const params = useParams()
  const router = useRouter()
  const { customer } = useAuth()
  const [invoice, setInvoice] = useState<InvoiceData | null>(null)
  const [loading, setLoading] = useState(true)
  const [isPaymentLoading, setIsPaymentLoading] = useState(false)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [projects, setProjects] = useState<any[]>([])
  const searchParams = useSearchParams()

  useEffect(() => {
    const adminMode = (searchParams?.get('admin') === '1')
    console.log('🔍 Invoice page loaded:', { customer, params, id: params.id, adminMode })
    if ((!customer && !adminMode) || !params.id) {
      console.log('❌ Missing auth or params.id:', { customer: !!customer, paramsId: params.id, adminMode })
      return
    }

    const fetchProjects = async () => {
      try {
        if (!customer) return
        const resp = await fetch(`/api/client/projects?customer_id=${customer.id}`)
        if (resp.ok) {
          const json = await resp.json()
          if (json.success) {
            setProjects(json.projects || [])
          }
        }
      } catch (e) {
        console.error('Error loading invoice projects:', e)
      }
    }

    const fetchInvoice = async () => {
      try {
        // Admin mode: fetch from admin invoices API (no customer session required)
        if (adminMode) {
          const adminResp = await fetch('/api/admin/invoices')
          if (adminResp.ok) {
            const adminData = await adminResp.json()
            const inv = (adminData.invoices || []).find((i: any) => 
              String(i.id) === String(params.id) || String(i.quote_id || i.quoteId) === String(params.id)
            )
            if (inv) {
              // Map to expected shape
              const mapped: any = {
                id: inv.id,
                amount: inv.amount,
                status: inv.status,
                issueDate: inv.issue_date || inv.created_at,
                dueDate: inv.due_date,
                paidDate: inv.paid_date,
                items: (() => {
                  const raw = inv.items || inv.line_items || []
                  if (typeof raw === 'string') {
                    try { return JSON.parse(raw) } catch { return [] }
                  }
                  return raw
                })(),
                depositRequired: inv.deposit_required,
                depositAmount: inv.deposit_amount ?? (inv.amount ? inv.amount * 0.2 : undefined),
                depositPaid: inv.deposit_paid,
                remainingAmount: inv.remaining_amount ?? (inv.amount ? inv.amount * 0.8 : undefined),
                quote_id: inv.quote_id,
                name: inv.customer_name,
                description: inv.description,
                email: inv.email,
                company: inv.company,
              }
              setInvoice(mapped)
              setLoading(false)
              return
            }
          }
        } else {
          // Client mode: First try to get from billing API (has deposit info)
          if (!customer) {
            console.log('❌ No customer session found')
            return
          }
          const billingResponse = await fetch(`/api/billing?customerId=${customer.id}`)
          if (billingResponse.ok) {
            const billingData = await billingResponse.json()
            console.log('💰 Billing data loaded:', billingData.data)
            
            const foundBillingInvoice = billingData.data?.invoices?.find((inv: any) => {
              const match = String(inv.id) === String(params.id) || String(inv.quoteId || inv.quote_id) === String(params.id)
              console.log('🔍 Checking billing invoice:', { id: inv.id, quoteId: inv.quoteId || inv.quote_id, match })
              return match
            })
            
            if (foundBillingInvoice) {
              console.log('✅ Found billing invoice:', foundBillingInvoice)
              console.log('💰 Deposit status:', { depositPaid: foundBillingInvoice.depositPaid, status: foundBillingInvoice.status })
              // Enrich with quote details (description/bill-to) if missing
              try {
                const quoteKey = String(foundBillingInvoice.quoteId || foundBillingInvoice.quote_id || params.id)
                const quotesResp = await fetch(`/api/quotes?customerId=${customer.id}`)
                if (quotesResp.ok) {
                  const quotesData = await quotesResp.json()
                  const matchQuote = (quotesData.quotes || []).find((q: any) => String(q.id || q.quote_id) === quoteKey)
                  if (matchQuote) {
                    ;(foundBillingInvoice as any).description = matchQuote.description || ''
                    ;(foundBillingInvoice as any).name = (foundBillingInvoice as any).name || matchQuote.name || ''
                    ;(foundBillingInvoice as any).email = (foundBillingInvoice as any).email || matchQuote.email || ''
                    ;(foundBillingInvoice as any).company = (foundBillingInvoice as any).company || matchQuote.company || ''
                  }
                }
              } catch (enrichErr) {
                console.warn('⚠️ Could not enrich invoice with quote details:', enrichErr)
              }
              setInvoice(foundBillingInvoice)
              setLoading(false)
              return
            }
          }
        }
        
        // Fallback to quotes API
        if (!customer) {
          console.log('❌ No customer session for quotes API fallback')
          return
        }
        const response = await fetch(`/api/quotes?customerId=${customer.id}`)
        if (response.ok) {
          const data = await response.json()
          console.log('📊 All quotes loaded:', data.quotes)
          console.log('🔍 Looking for invoice with ID:', params.id)
          
          const foundInvoice = data.quotes?.find((q: any) => {
            console.log('🔍 Checking quote:', { id: q.id, quote_id: q.quote_id, matches: q.id === params.id || q.quote_id === params.id })
            return q.id === params.id || q.quote_id === params.id
          })
          
          if (foundInvoice) {
            console.log('✅ Found invoice:', foundInvoice)
            setInvoice(foundInvoice)
          } else {
            console.log('❌ Invoice not found for ID:', params.id)
          }
        }
      } catch (error) {
        console.error('Error fetching invoice:', error)
      }
      setLoading(false)
    }

    fetchProjects()
    fetchInvoice()
  }, [customer, params.id, searchParams])

  // Auto-print support when opened with ?print=1
  useEffect(() => {
    if (!loading && invoice) {
      const p = searchParams?.get('print')
      if (p === '1') {
        setTimeout(() => {
          try { window.print() } catch {}
        }, 300)
      }
    }
  }, [loading, invoice, searchParams])

  const handlePayment = async (invoiceId: string) => {
    if (!customer) return
    
    try {
      setIsPaymentLoading(true)
      const response = await fetch('/api/billing', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          invoice_id: invoiceId, 
          action: 'pay_now', 
          customer_id: customer.id 
        }),
      })
      
      const data = await response.json()
      if (data.success) {
        // Refresh the invoice data
        const billingResponse = await fetch(`/api/billing?customerId=${customer.id}`)
        if (billingResponse.ok) {
          const billingData = await billingResponse.json()
          const updatedInvoice = billingData.data?.invoices?.find((inv: any) => inv.id === invoiceId)
          if (updatedInvoice) {
            setInvoice(updatedInvoice)
          }
        }
        setSuccessMessage(isDepositPaid ? 'Final payment processed successfully! Invoice is now fully paid.' : 'Deposit payment processed successfully!')
        setShowSuccessMessage(true)
        setTimeout(() => setShowSuccessMessage(false), 5000)
      } else {
        setSuccessMessage(`Payment failed: ${data.error}`)
        setShowSuccessMessage(true)
        setTimeout(() => setShowSuccessMessage(false), 5000)
      }
    } catch (error: any) {
      setSuccessMessage(`Payment error: ${error?.message || 'Please try again.'}`)
      setShowSuccessMessage(true)
      setTimeout(() => setShowSuccessMessage(false), 5000)
    } finally {
      setIsPaymentLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white">Loading invoice...</div>
      </div>
    )
  }

  if (!invoice) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white">Invoice not found</div>
      </div>
    )
  }

  // Handle both billing invoice and quote data structures
  const totalAmount = invoice.amount || invoice.estimatedCost || 0
  const depositAmount = invoice.depositAmount || (totalAmount * 0.2)
  const remainingAmount = invoice.remainingAmount || (totalAmount * 0.8)
  const invoiceDate = new Date(invoice.issueDate || invoice.createdAt || new Date())
  const isDepositPaid = invoice.depositPaid || false
  const quoteReference = (invoice as any).quoteId || invoice.quote_id || (typeof params.id === 'string' && String(params.id).startsWith('QT-') ? String(params.id) : '')
  const billToName = invoice.name || (((customer as any)?.first_name && (customer as any)?.last_name) ? `${(customer as any)?.first_name} ${(customer as any)?.last_name}` : (customer as any)?.name) || ''
  const billToEmail = invoice.email || (customer as any)?.email || ''
  const billToCompany = invoice.company || (customer as any)?.company || ''
  const projectDescription = (invoice as any)?.description || ''
  const relatedProject = projects.find((p: any) => String(p.quote_id) === String(quoteReference || invoice.id))
  const isProjectCompleted = (relatedProject?.status || '') === 'completed'
  const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID

  // Debug logging
  console.log('🔍 Invoice page debug:', {
    invoiceId: invoice.id,
    depositPaid: invoice.depositPaid,
    status: invoice.status,
    isDepositPaid,
    invoiceSource: invoice.amount ? 'billing' : 'quotes'
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Success Message */}
      {showSuccessMessage && (
        <div className="fixed top-4 right-4 z-50 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg">
          {successMessage}
        </div>
      )}
      
      <div className="container mx-auto px-4 pt-16 pb-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="text-white border-white/20 hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="flex space-x-2">
            <Button variant="outline" className="text-white border-white/20 hover:bg-white/10" onClick={() => window.print()}>
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
            <Button variant="outline" className="text-white border-white/20 hover:bg-white/10" onClick={() => window.print()}>
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </div>

        {/* Invoice Card */}
        <Card id="invoice-print" className="max-w-4xl mx-auto bg-white shadow-2xl">
          <CardContent className="p-8">
            {/* Invoice Header */}
            <div className="flex justify-between items-start mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">INVOICE</h1>
                <p className="text-gray-600">{quoteReference || invoice.quote_id || `QT-${invoice.id}`}</p>
              </div>
              <div className="text-right">
                <h2 className="text-2xl font-bold text-primary mb-2">Daniel James</h2>
                <p className="text-gray-600">Freelance Web Developer</p>
                <div className="mt-2 text-sm text-gray-600">
                  <p className="flex items-center justify-end"><Mail className="w-4 h-4 mr-1" /> contact@danieljames.dev</p>
                  <p className="flex items-center justify-end"><Phone className="w-4 h-4 mr-1" /> +44 123 456 7890</p>
                  <p className="flex items-center justify-end"><MapPin className="w-4 h-4 mr-1" /> London, UK</p>
                </div>
              </div>
            </div>

            {/* Bill To & Invoice Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Bill To:</h3>
                <div className="text-gray-700">
                  <p className="font-medium">{billToName || '—'}</p>
                  {billToCompany && <p>{billToCompany}</p>}
                  {billToEmail && (
                    <p className="flex items-center"><Mail className="w-4 h-4 mr-1" /> {billToEmail}</p>
                  )}
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Invoice Details:</h3>
                <div className="text-gray-700 space-y-1">
                  <p className="flex items-center"><Calendar className="w-4 h-4 mr-2" /> <strong>Issue Date:</strong> {invoiceDate.toLocaleDateString()}</p>
                  {invoice.dueDate && (
                    <p className="flex items-center"><Calendar className="w-4 h-4 mr-2" /> <strong>Due Date:</strong> {new Date(invoice.dueDate).toLocaleDateString()}</p>
                  )}
                  <div className="flex items-center">
                    <Badge className={`ml-6 ${
                      invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                      isDepositPaid ? 'bg-blue-100 text-blue-800' :
                      invoice.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {invoice.status === 'paid' ? 'FULLY PAID' :
                       isDepositPaid ? 'DEPOSIT PAID' :
                       invoice.status === 'pending' ? 'PAYMENT PENDING' :
                       invoice.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Invoice Items */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Invoice Items</h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">Description</th>
                      <th className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-900">Qty</th>
                      <th className="border border-gray-300 px-4 py-3 text-right font-semibold text-gray-900">Rate</th>
                      <th className="border border-gray-300 px-4 py-3 text-right font-semibold text-gray-900">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.items && invoice.items.length > 0 ? (
                      invoice.items.map((item: any, idx: number) => (
                        <tr key={idx}>
                          <td className="border border-gray-300 px-4 py-3 text-gray-700">{item.description}</td>
                          <td className="border border-gray-300 px-4 py-3 text-center text-gray-700">{item.quantity}</td>
                          <td className="border border-gray-300 px-4 py-3 text-right text-gray-700">{formatCurrency(item.unitPrice)}</td>
                          <td className="border border-gray-300 px-4 py-3 text-right text-gray-700">{formatCurrency(item.total)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td className="border border-gray-300 px-4 py-3 text-gray-700">
                          {invoice.selectedPackage?.name || invoice.projectName || 'Web Development Services'}
                        </td>
                        <td className="border border-gray-300 px-4 py-3 text-center text-gray-700">1</td>
                        <td className="border border-gray-300 px-4 py-3 text-right text-gray-700">{formatCurrency(totalAmount)}</td>
                        <td className="border border-gray-300 px-4 py-3 text-right text-gray-700">{formatCurrency(totalAmount)}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Invoice Summary */}
            <div className="mb-8">
              <div className="flex justify-end">
                <div className="w-full max-w-sm">
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between text-gray-700">
                      <span>Subtotal:</span>
                      <span>{formatCurrency(totalAmount)}</span>
                    </div>
                    <div className="flex justify-between text-gray-700">
                      <span>Tax (0%):</span>
                      <span>{formatCurrency(0)}</span>
                    </div>
                    <div className="border-t border-gray-300 pt-2">
                      <div className="flex justify-between text-lg font-bold text-gray-900">
                        <span>Total:</span>
                        <span>{formatCurrency(totalAmount)}</span>
                      </div>
                    </div>
                    <div className="border-t border-gray-300 pt-2 mt-3">
                      <div className="flex justify-between text-green-700 font-semibold">
                        <span>Amount Paid:</span>
                        <span>
                          {invoice.status === 'paid' ? formatCurrency(totalAmount) : 
                           isDepositPaid ? formatCurrency(depositAmount) : 
                           formatCurrency(0)}
                        </span>
                      </div>
                      <div className="flex justify-between text-orange-700 font-semibold">
                        <span>Amount Due:</span>
                        <span>
                          {invoice.status === 'paid' ? formatCurrency(0) :
                           isDepositPaid ? formatCurrency(remainingAmount) :
                           formatCurrency(depositAmount)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Project Description */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Project Description:</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700 whitespace-pre-wrap">{projectDescription || '—'}</p>
              </div>
            </div>

            {/* Payment Status */}
            {(isDepositPaid || invoice.status === 'paid') && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment History</h3>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="space-y-2">
                    {isDepositPaid && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                          <span className="text-green-800">Deposit Payment (20%)</span>
                        </div>
                        <span className="text-green-800 font-semibold">{formatCurrency(depositAmount)}</span>
                      </div>
                    )}
                    {invoice.status === 'paid' && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                          <span className="text-green-800">Final Payment (80%)</span>
                        </div>
                        <span className="text-green-800 font-semibold">{formatCurrency(remainingAmount)}</span>
                      </div>
                    )}
                    <div className="border-t border-green-300 pt-2 mt-3">
                      <div className="flex items-center justify-between font-bold">
                        <span className="text-green-800">Total Paid:</span>
                        <span className="text-green-800">
                          {invoice.status === 'paid' ? formatCurrency(totalAmount) : formatCurrency(depositAmount)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Structure */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <CreditCard className="w-5 h-5 mr-2" />
                {invoice.status === 'paid' ? 'Payment Complete' : 'Payment Required'}
              </h3>
              <div className="bg-gradient-to-r from-cyber-mint/10 to-cosmic-blue/10 border border-cyber-mint/20 rounded-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="bg-white rounded-lg p-4 border border-cyber-mint/20">
                      <p className="font-semibold mb-1 text-lg text-cyber-mint">20% Deposit Required</p>
                      <p className="text-3xl font-bold text-gray-900 mb-2">{formatCurrency(depositAmount)}</p>
                      <p className="text-gray-700 mt-1">Due before work starts</p>
                      {isDepositPaid ? (
                        <div className="mt-3 px-4 py-2 bg-cyber-mint/20 text-cyber-mint rounded-lg font-semibold">
                          ✓ Deposit Paid
                        </div>
                      ) : (
                        <Button 
                          className="mt-3 btn-gradient text-white"
                          onClick={() => handlePayment(invoice.id)}
                          disabled={isPaymentLoading}
                        >
                          {isPaymentLoading ? 'Processing...' : 'Pay Deposit Now'}
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="bg-white rounded-lg p-4 border border-cyber-mint/20">
                      <p className="font-semibold mb-1 text-lg text-cyber-mint">Remaining Amount (80%)</p>
                      <p className="text-3xl font-bold text-gray-900 mb-2">{formatCurrency(remainingAmount)}</p>
                      <p className="text-gray-700 mt-1">Due upon completion</p>
                      {isDepositPaid && invoice.status !== 'paid' && (
                        <Button 
                          className="mt-3 btn-gradient text-white"
                          onClick={() => handlePayment(invoice.id)}
                          disabled={isPaymentLoading || !isProjectCompleted}
                          title={isProjectCompleted ? undefined : 'Pay Remaining becomes available when the project is marked as completed.'}
                        >
                          {isPaymentLoading ? 'Processing...' : 'Pay Remaining Now'}
                        </Button>
                      )}
                      {invoice.status === 'paid' && (
                        <div className="mt-3 px-4 py-2 bg-cyber-mint/20 text-cyber-mint rounded-lg font-semibold">
                          ✓ Fully Paid
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="mt-6 text-center">
                  <div className="bg-white rounded-lg p-4 border-2 border-cyber-mint/30">
                    <p className="text-gray-800 font-semibold mb-1 text-lg">Total Project Value</p>
                    <p className="text-4xl font-bold text-gray-900">{formatCurrency(totalAmount)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Payment Information:</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
                  <div>
                    <p><strong>Payment Methods Accepted:</strong></p>
                    <ul className="mt-1 space-y-1">
                      <li>• Bank Transfer (GBP)</li>
                      <li>• PayPal</li>
                    </ul>
                  </div>
                  <div>
                    <p><strong>Payment Terms:</strong></p>
                    <ul className="mt-1 space-y-1">
                      <li>• 20% deposit required to start</li>
                      <li>• Remaining 80% due on completion</li>
                    </ul>
                  </div>
                </div>

                {/* Bank Transfer Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <div className="bg-white rounded-lg p-4 border-2 border-cyan-200 shadow-sm">
                    <p className="font-bold mb-4 text-lg text-cyan-700 flex items-center">
                      <CreditCard className="w-5 h-5 mr-2" />
                      Bank Transfer Details
                    </p>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-cyan-700 font-semibold">Beneficiary</span>
                        <span className="text-gray-900 font-medium">Daniel James</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-cyan-700 font-semibold">Account Number</span>
                        <span className="text-gray-900 font-medium font-mono">84726350</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-cyan-700 font-semibold">Sort Code</span>
                        <span className="text-gray-900 font-medium font-mono">04-29-09</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-cyan-700 font-semibold">Bank</span>
                        <span className="text-gray-900 font-medium">Revolut Ltd</span>
                      </div>
                      <div className="py-2 border-b border-gray-100">
                        <div className="text-cyan-700 font-semibold mb-1">Bank Address</div>
                        <div className="text-gray-900 font-medium text-sm">30 South Colonnade, E14 5HX, London, United Kingdom</div>
                      </div>
                      <div className="py-2">
                        <div className="text-cyan-700 font-semibold mb-1">Reference</div>
                        <div className="text-gray-900 font-medium font-mono bg-gray-50 px-2 py-1 rounded">
                          {quoteReference || invoice.quote_id || invoice.id}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold mb-1">PayPal Checkout</p>
                    {!paypalClientId ? (
                      <div className="mt-2 p-3 border border-yellow-300 bg-yellow-50 rounded text-yellow-800">
                        PayPal checkout is not configured yet. It will be available once credentials are added.
                        <div className="mt-2">
                          <Button disabled className="opacity-60 cursor-not-allowed">Pay with PayPal</Button>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-2">
                        <div id="paypal-buttons-invoice" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center justify-center text-gray-500 text-sm">
                <Info className="w-4 h-4 mr-2" />
                Thank you for your business! Please contact us if you have any questions about this invoice.
              </div>
            </div>
          </CardContent>
        </Card>

        <style jsx global>{`
          @media print {
            body * { visibility: hidden !important; }
            #invoice-print, #invoice-print * { visibility: visible !important; }
            #invoice-print { position: absolute; left: 0; top: 0; width: 100%; }
          }
        `}</style>
      </div>
    </div>
  )
}
