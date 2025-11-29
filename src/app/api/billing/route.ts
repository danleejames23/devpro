import { NextRequest, NextResponse } from 'next/server'
import {
  getBillingStats,
  getPaymentMethodsByCustomerId,
  getInvoicesByCustomerId,
  getBillingSettingsByCustomerId,
  createPaymentMethod,
  createInvoice,
  createOrUpdateBillingSettings,
  getDatabase
} from '@/lib/database'

// GET /api/billing - Get billing data for a customer
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const customerId = searchParams.get('customerId')
    
    if (!customerId) {
      return NextResponse.json(
        { success: false, error: 'Customer ID is required' },
        { status: 400 }
      )
    }

    const [stats, paymentMethods, rawInvoices, settings] = await Promise.all([
      getBillingStats(customerId),
      getPaymentMethodsByCustomerId(customerId),
      getInvoicesByCustomerId(customerId),
      getBillingSettingsByCustomerId(customerId)
    ])

    // If no invoices found, create them from approved quotes
    let invoices = rawInvoices
    if (invoices.length === 0) {
      const client = await getDatabase()
      try {
        // Get approved quotes for this customer
        const quotesResult = await client.query(`
          SELECT * FROM quotes 
          WHERE customer_id = $1 AND status IN ('approved', 'accepted', 'quoted')
        `, [customerId])
        
        // Create invoices from quotes
        for (const quote of quotesResult.rows) {
          const amount = parseFloat(quote.estimated_cost) || 0
          const depositAmount = amount * 0.2
          const remainingAmount = amount * 0.8
          
          await client.query(`
            INSERT INTO invoices (
              customer_id, project_name, amount, status, due_date,
              deposit_required, deposit_amount, deposit_paid, remaining_amount,
              created_at, updated_at
            ) VALUES (
              $1, $2, $3, 'pending', CURRENT_DATE + INTERVAL '30 days',
              TRUE, $4, FALSE, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
            )
          `, [
            quote.customer_id,
            quote.selectedPackage?.name || 'Web Development Services',
            amount,
            depositAmount,
            remainingAmount
          ])
        }
        
        // Re-fetch invoices after creation
        invoices = await getInvoicesByCustomerId(customerId)
      } finally {
        client.release()
      }
    }

    // Transform data to match expected format
    const transformedPaymentMethods = paymentMethods.map(method => ({
      id: method.id,
      type: method.type,
      last4: method.last4,
      expiryMonth: method.expiry_month,
      expiryYear: method.expiry_year,
      isDefault: method.is_default,
      customerId: method.customer_id
    }))

    const transformedInvoices = invoices.map((invoice: any) => ({
      id: invoice.id,
      quoteId: invoice.quote_id,
      customerId: invoice.customer_id,
      projectId: invoice.project_id,
      projectName: invoice.project_name,
      amount: invoice.amount,
      status: invoice.status,
      issueDate: invoice.created_at,
      dueDate: invoice.due_date,
      paidDate: invoice.paid_date,
      items: invoice.items,
      // Include deposit-related fields
      depositRequired: invoice.deposit_required,
      depositAmount: invoice.deposit_amount,
      depositPaid: invoice.deposit_paid,
      depositDueDate: invoice.deposit_due_date,
      remainingAmount: invoice.remaining_amount
    }))

    const transformedSettings = settings ? {
      customerId: settings.customer_id,
      emailInvoices: settings.email_invoices,
      autoPayEnabled: settings.auto_pay_enabled,
      billingAddress: settings.billing_address,
      taxId: settings.tax_id
    } : null

    return NextResponse.json({
      success: true,
      data: {
        stats,
        paymentMethods: transformedPaymentMethods,
        invoices: transformedInvoices,
        settings: transformedSettings
      }
    })

  } catch (error) {
    console.error('Error fetching billing data:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/billing - Create payment method, invoice, or update billing settings
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, customerId, ...data } = body

    if (!customerId) {
      return NextResponse.json(
        { success: false, error: 'Customer ID is required' },
        { status: 400 }
      )
    }

    if (type === 'payment-method') {
      const { cardType, cardNumber, expiryMonth, expiryYear, isDefault } = data
      
      if (!cardType || !cardNumber || !expiryMonth || !expiryYear) {
        return NextResponse.json(
          { success: false, error: 'Missing required payment method fields' },
          { status: 400 }
        )
      }

      const paymentMethod = await createPaymentMethod({
        customer_id: customerId,
        type: cardType,
        last4: cardNumber.slice(-4),
        expiry_month: parseInt(expiryMonth),
        expiry_year: parseInt(expiryYear),
        is_default: isDefault || false
      })

      return NextResponse.json({
        success: true,
        message: 'Payment method added successfully',
        paymentMethod: {
          id: paymentMethod.id,
          type: paymentMethod.type,
          last4: paymentMethod.last4,
          expiryMonth: paymentMethod.expiry_month,
          expiryYear: paymentMethod.expiry_year,
          isDefault: paymentMethod.is_default,
          customerId: paymentMethod.customer_id
        }
      })
      
    } else if (type === 'invoice') {
      const { projectId, projectName, amount, issueDate, dueDate, items } = data
      
      if (!projectName || !amount || !issueDate || !dueDate || !items) {
        return NextResponse.json(
          { success: false, error: 'Missing required invoice fields' },
          { status: 400 }
        )
      }

      const invoice = await createInvoice({
        customer_id: customerId,
        project_id: projectId,
        project_name: projectName,
        amount: parseFloat(amount),
        issue_date: issueDate,
        due_date: dueDate,
        items: items
      })

      return NextResponse.json({
        success: true,
        message: 'Invoice created successfully',
        invoice: {
          id: invoice.id,
          customerId: invoice.customer_id,
          projectId: invoice.project_id,
          projectName: invoice.project_name,
          amount: invoice.amount,
          status: invoice.status,
          issueDate: invoice.issue_date,
          dueDate: invoice.due_date,
          items: invoice.items
        }
      })
      
    } else if (type === 'billing-settings') {
      const { emailInvoices, autoPayEnabled, billingAddress, taxId } = data
      
      const settings = await createOrUpdateBillingSettings({
        customer_id: customerId,
        email_invoices: emailInvoices,
        auto_pay_enabled: autoPayEnabled,
        billing_address: billingAddress,
        tax_id: taxId
      })

      return NextResponse.json({
        success: true,
        message: 'Billing settings updated successfully',
        settings: {
          customerId: settings.customer_id,
          emailInvoices: settings.email_invoices,
          autoPayEnabled: settings.auto_pay_enabled,
          billingAddress: settings.billing_address,
          taxId: settings.tax_id
        }
      })
    }

    return NextResponse.json(
      { success: false, error: 'Invalid type specified. Must be "payment-method", "invoice", or "billing-settings"' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Error creating billing data:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH /api/billing - Process payment for invoice
export async function PATCH(request: NextRequest) {
  console.log('🚀 Billing API PATCH called')
  try {
    console.log('📥 Parsing request body...')
    const body = await request.json()
    console.log('📋 Request body:', body)
    
    const { invoice_id, action, customer_id } = body
    
    if (!invoice_id || !action || !customer_id) {
      return NextResponse.json(
        { success: false, error: 'invoice_id, action, and customer_id are required' },
        { status: 400 }
      )
    }
    
    // pay_now: decide whether to mark deposit or remaining based on current invoice state
    if (action === 'pay_now') {
      console.log('💳 Processing payment for invoice:', invoice_id)
      // Determine current state of the invoice
      const existingRaw = await getInvoicesByCustomerId(customer_id) as any
      const existing: any[] = Array.isArray(existingRaw) ? existingRaw : []
      const target: any = existing.find((inv: any) => String(inv.id) === String(invoice_id))
        || existing.find((inv: any) => String(inv.quote_id) === String(invoice_id))
        || existing
          .filter((inv: any) => (inv.status ?? 'pending') !== 'paid' && !(inv.deposit_paid ?? false))
          .sort((a: any, b: any) => new Date(a.created_at || a.issue_date || 0).getTime() - new Date(b.created_at || b.issue_date || 0).getTime())
          .pop()

      if (!target) {
        return NextResponse.json({ success: false, error: 'Invoice not found' }, { status: 404 })
      }

      const depositAlreadyPaid = !!target.deposit_paid
      const isFullyPaid = (target.status ?? 'pending') === 'paid'
      const adminAction = isFullyPaid ? null : (depositAlreadyPaid ? 'mark_fully_paid' : 'mark_deposit_paid')

      if (!adminAction) {
        return NextResponse.json({ success: true, message: 'Invoice already fully paid' })
      }

      // Call the admin invoices API to update payment status appropriately
      const apiUrl = new URL('/api/admin/invoices', request.url).toString()
      const requestBody = {
        invoice_id: String(target.id),
        action: adminAction,
        customer_id
      }

      console.log('📤 Calling admin API:', apiUrl)
      console.log('📤 Request body:', requestBody)

      const response = await fetch(apiUrl, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      })

      console.log('📥 Admin API response status:', response.status)
      const responseData = await response.json().catch(() => ({}))
      console.log('📥 Admin API response data:', responseData)

      if (!response.ok || responseData?.success === false) {
        console.error('❌ Admin API failed:', responseData)
        throw new Error(`Failed to update invoice status: ${responseData?.error || 'Unknown error'}`)
      }

      // Record the payment in the payments table
      try {
        const paymentAmount = adminAction === 'mark_deposit_paid' ? target.deposit_amount : target.remaining_amount
        const paymentType = adminAction === 'mark_deposit_paid' ? 'deposit' : 'remaining'
        
        await fetch(new URL('/api/admin/payments', request.url).toString(), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            invoice_id: String(target.id),
            customer_id: String(customer_id),
            amount: paymentAmount,
            payment_type: paymentType
          })
        })
        console.log('✅ Payment recorded successfully')
      } catch (paymentError) {
        console.warn('⚠️ Failed to record payment:', paymentError)
        // Don't fail the main payment flow if recording fails
      }

      // Re-fetch updated invoice
      const afterRaw = await getInvoicesByCustomerId(customer_id) as any
      const after: any[] = Array.isArray(afterRaw) ? afterRaw : []
      const updated: any = after.find((inv: any) => String(inv.id) === String(target.id)) || target

      // Return minimal updated invoice for client UI refresh
      const updatedInvoice = {
        id: updated.id,
        customerId: updated.customer_id,
        projectId: updated.project_id,
        projectName: updated.project_name,
        amount: updated.amount,
        status: updated.status || 'pending',
        issueDate: updated.created_at,
        dueDate: updated.due_date,
        paidDate: updated.paid_date,
        items: updated.items,
        depositRequired: updated.deposit_required,
        depositAmount: updated.deposit_amount,
        depositPaid: updated.deposit_paid,
        depositDueDate: updated.deposit_due_date,
        remainingAmount: updated.remaining_amount,
        quoteId: updated.quote_id
      }

      return NextResponse.json({
        success: true,
        message: 'Payment processed successfully',
        updatedInvoice
      })
    }
    
    return NextResponse.json(
      { success: false, error: 'Invalid action specified' },
      { status: 400 }
    )
    
  } catch (error: any) {
    console.error('💥 Billing API Error:', error)
    console.error('💥 Error message:', error?.message)
    console.error('💥 Error stack:', error?.stack)
    return NextResponse.json(
      { success: false, error: `Failed to process payment: ${error?.message || 'Unknown error'}` },
      { status: 500 }
    )
  }
}
