import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/database'

export async function GET(request: NextRequest) {
  console.log('🔍 Admin invoices GET called - testing database connection')
  
  try {
    // TODO: Add admin authentication check
    
    const client = await getDatabase()
    
    try {
      // Helper: ensure paid_date column exists
      const ensurePaidDateColumn = async () => {
        try {
          await client.query(`ALTER TABLE invoices ADD COLUMN IF NOT EXISTS paid_date DATE`)
        } catch (e) {
          console.warn('⚠️ Could not add paid_date column:', e)
        }
      }

      // Helper: mark invoice fully paid by id (id as text for safety)
      const markFullyPaidById = async (idText: string) => {
        try {
          return await client.query(`
            UPDATE invoices
            SET status = 'paid', deposit_paid = TRUE, paid_date = CURRENT_DATE, updated_at = CURRENT_TIMESTAMP
            WHERE id::text = $1
            RETURNING id, status, deposit_paid, paid_date
          `, [idText])
        } catch (err: any) {
          if (String(err?.message || '').includes('column "paid_date"') || err?.code === '42703') {
            await ensurePaidDateColumn()
            return await client.query(`
              UPDATE invoices
              SET status = 'paid', deposit_paid = TRUE, paid_date = CURRENT_DATE, updated_at = CURRENT_TIMESTAMP
              WHERE id::text = $1
              RETURNING id, status, deposit_paid, paid_date
            `, [idText])
          }
          throw err
        }
      }
      // Ensure required columns exist in invoices table
      const columnsToAdd = [
        { name: 'project_name', type: 'VARCHAR(255)' },
        { name: 'deposit_required', type: 'BOOLEAN DEFAULT TRUE' },
        { name: 'deposit_amount', type: 'DECIMAL(10,2)' },
        { name: 'deposit_paid', type: 'BOOLEAN DEFAULT FALSE' },
        { name: 'remaining_amount', type: 'DECIMAL(10,2)' },
        { name: 'project_id', type: 'INTEGER' },
        { name: 'paid_date', type: 'DATE' }
      ]
      
      for (const col of columnsToAdd) {
        try {
          await client.query(`ALTER TABLE invoices ADD COLUMN IF NOT EXISTS ${col.name} ${col.type}`)
        } catch (e) {
          // Column might already exist, ignore
        }
      }
      
      // First, check if we need to create invoices from approved quotes
      const invoiceCount = await client.query('SELECT COUNT(*) FROM invoices')
      console.log('📊 Current invoice count:', invoiceCount.rows[0].count)
      
      if (parseInt(invoiceCount.rows[0].count) === 0) {
        console.log('📝 No invoices found, creating from approved quotes...')
        // Get approved quotes
        const quotesResult = await client.query(`
          SELECT q.*, c.first_name, c.last_name 
          FROM quotes q 
          LEFT JOIN customers c ON q.customer_id::text = c.id::text
          WHERE q.status IN ('approved', 'accepted', 'quoted', 'in_progress', 'completed')
        `)
        
        console.log(`📋 Found ${quotesResult.rows.length} approved quotes`)
        
        for (const quote of quotesResult.rows) {
          const amount = parseFloat(quote.estimated_cost) || 0
          const depositAmount = amount * 0.2
          const remainingAmount = amount * 0.8
          const projectName = quote.selected_package?.name || quote.description?.substring(0, 50) || 'Web Development Services'
          
          await client.query(`
            INSERT INTO invoices (
              customer_id, quote_id, project_name, amount, status, due_date,
              deposit_required, deposit_amount, deposit_paid, remaining_amount,
              description, created_at, updated_at
            ) VALUES (
              $1, $2, $3, $4, 'pending', CURRENT_DATE + INTERVAL '30 days',
              TRUE, $5, FALSE, $6, $7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
            )
            ON CONFLICT DO NOTHING
          `, [
            quote.customer_id,
            quote.quote_id || quote.id,
            projectName,
            amount,
            depositAmount,
            remainingAmount,
            quote.description || 'Invoice for approved quote'
          ])
        }
        console.log('✅ Invoices created from quotes')
      }
      
      // Get all invoices with customer information
      // Use text casting to handle UUID/integer type mismatches
      const result = await client.query(`
        SELECT 
          i.*,
          c.first_name,
          c.last_name,
          c.email,
          c.company,
          CONCAT(c.first_name, ' ', c.last_name) as customer_name
        FROM invoices i
        LEFT JOIN customers c ON i.customer_id::text = c.id::text
        ORDER BY i.created_at DESC
      `)
      
      // Transform to match expected format
      const invoices = result.rows.map(row => {
        const amount = parseFloat(row.amount) || 0
        const depositAmount = parseFloat(row.deposit_amount) || (amount * 0.2)
        const remainingAmount = parseFloat(row.remaining_amount) || (amount * 0.8)
        const depositPaid = row.deposit_paid || false
        
        // Calculate amount due based on deposit status
        const amountDue = row.status === 'paid' ? 0 : (
          !depositPaid ? depositAmount : remainingAmount
        )
        
        return {
          id: row.id,
          customer_id: row.customer_id,
          customer_name: row.customer_name || 'Unknown Customer',
          quote_id: row.quote_id,
          project_id: row.project_id,
          project_name: row.project_name || 'No Project',
          amount: amount,
          amount_due: amountDue,
          status: row.status || 'pending',
          issue_date: row.created_at,
          due_date: row.due_date,
          paid_date: row.paid_date,
          items: row.line_items || row.items || [],
          deposit_required: row.deposit_required || true, // Default to true for all invoices
          deposit_amount: depositAmount,
          deposit_paid: depositPaid,
          deposit_due_date: row.deposit_due_date,
          remaining_amount: remainingAmount,
          invoice_number: row.invoice_number,
          email: row.email,
          company: row.company,
          description: row.description
        }
      })
      
      return NextResponse.json({
        success: true,
        invoices: invoices
      })
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('❌ Error fetching admin invoices:', error)
    return NextResponse.json(
      { error: 'Failed to fetch invoices' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // TODO: Add admin authentication check
    
    const { 
      customer_id, 
      project_id, 
      quote_id, 
      amount, 
      due_date, 
      description,
      deposit_amount,
      deposit_required,
      deposit_paid,
      remaining_amount,
      items, 
      line_items 
    } = await request.json()
    
    if (!customer_id || !amount) {
      return NextResponse.json(
        { error: 'customer_id and amount are required' },
        { status: 400 }
      )
    }
    
    const client = await getDatabase()
    
    try {
      // Prefer provided items, else support line_items from approval flow
      const itemsJson = JSON.stringify((items ?? line_items ?? []))

      // Detect if project_id column exists; build insert accordingly
      const cols = await client.query(`
        SELECT column_name FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'invoices'
      `)
      const hasProjectId = cols.rows.some((r: any) => r.column_name === 'project_id')

      let result
      if (hasProjectId) {
        result = await client.query(
          `INSERT INTO invoices (
             customer_id, quote_id, project_id, amount, status, created_at, due_date, line_items, description,
             deposit_required, deposit_amount, deposit_paid, remaining_amount
           )
           VALUES ($1, $2, $3, $4, 'pending', CURRENT_TIMESTAMP, $5, $6, $7, $8, $9, $10, $11)
           RETURNING *`,
          [
            customer_id, 
            quote_id ?? null, 
            project_id ?? null, 
            amount, 
            due_date, 
            itemsJson,
            description ?? null,
            typeof deposit_required === 'boolean' ? deposit_required : true,
            deposit_amount ?? null,
            typeof deposit_paid === 'boolean' ? deposit_paid : false,
            remaining_amount ?? null
          ]
        )
      } else {
        result = await client.query(
          `INSERT INTO invoices (
             customer_id, quote_id, amount, status, created_at, due_date, line_items, description,
             deposit_required, deposit_amount, deposit_paid, remaining_amount
           )
           VALUES ($1, $2, $3, 'pending', CURRENT_TIMESTAMP, $4, $5, $6, $7, $8, $9, $10)
           RETURNING *`,
          [
            customer_id, 
            quote_id ?? null, 
            amount, 
            due_date, 
            itemsJson,
            description ?? null,
            typeof deposit_required === 'boolean' ? deposit_required : true,
            deposit_amount ?? null,
            typeof deposit_paid === 'boolean' ? deposit_paid : false,
            remaining_amount ?? null
          ]
        )
      }
      
      return NextResponse.json({
        success: true,
        invoice: result.rows[0]
      })
      
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Error creating invoice:', error)
    return NextResponse.json(
      { error: 'Failed to create invoice' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  console.log('🚀 Admin invoices PATCH endpoint called - v2')
  
  try {
    console.log('📥 Parsing request body...')
    const body = await request.json()
    console.log('🔧 Admin invoices PATCH received:', body)
    
    let { invoice_id, action, deposit_paid, customer_id } = body
    
    if (!invoice_id || !action) {
      console.error('❌ Missing required fields:', { invoice_id, action })
      return NextResponse.json(
        { error: 'invoice_id and action are required' },
        { status: 400 }
      )
    }
    
    console.log('✅ Processing action:', action, 'for invoice:', invoice_id)
  
    const client = await getDatabase()
    
    try {
      // Helpers scoped to PATCH: ensure paid_date exists and mark fully paid
      const ensurePaidDateColumn = async () => {
        try {
          await client.query(`ALTER TABLE invoices ADD COLUMN IF NOT EXISTS paid_date DATE`)
        } catch (e) {
          console.warn('⚠️ Could not add paid_date column (PATCH):', e)
        }
      }

      const markFullyPaidById = async (idText: string) => {
        try {
          return await client.query(`
            UPDATE invoices
            SET status = 'paid', deposit_paid = TRUE, paid_date = CURRENT_DATE, updated_at = CURRENT_TIMESTAMP
            WHERE id::text = $1
            RETURNING id, status, deposit_paid, paid_date
          `, [idText])
        } catch (err: any) {
          if (String(err?.message || '').includes('column "paid_date"') || err?.code === '42703') {
            await ensurePaidDateColumn()
            return await client.query(`
              UPDATE invoices
              SET status = 'paid', deposit_paid = TRUE, paid_date = CURRENT_DATE, updated_at = CURRENT_TIMESTAMP
              WHERE id::text = $1
              RETURNING id, status, deposit_paid, paid_date
            `, [idText])
          }
          throw err
        }
      }
      if (action === 'mark_deposit_paid') {
        console.log('💳 Marking deposit as paid for key:', invoice_id)
        const key = String(invoice_id)
        
        // 1) Try direct match by id::text to avoid type cast errors (uuid/integer)
        // Check if deposit is already paid, if so mark as fully paid
        const checkDepositStatus = await client.query(`
          SELECT id, deposit_paid, status FROM invoices WHERE id::text = $1
        `, [key])
        
        console.log('🔍 Checking invoice with key:', key)
        console.log('🔍 Found invoices:', checkDepositStatus.rows)
        
        // Debug: Show all invoices in database
        const allInvoicesDebug = await client.query('SELECT id, deposit_paid, status FROM invoices LIMIT 10')
        console.log('📊 All invoices in database:', allInvoicesDebug.rows)
        
        if (checkDepositStatus.rows.length > 0) {
          const invoice = checkDepositStatus.rows[0]
          console.log('📋 Current invoice status:', invoice)
          
          if (invoice.deposit_paid) {
            // Deposit already paid, mark as fully paid
            const updateById = await markFullyPaidById(key)
            console.log('✅ Invoice marked as fully paid:', updateById.rows)
            return NextResponse.json({ success: true })
          } else {
            // Mark deposit as paid
            const updateById = await client.query(`
              UPDATE invoices
              SET deposit_paid = TRUE, updated_at = CURRENT_TIMESTAMP
              WHERE id::text = $1
              RETURNING id, deposit_paid
            `, [key])
            console.log('✅ Deposit marked as paid:', updateById.rows)
            return NextResponse.json({ success: true })
          }
        }
        
        // 2) Fall back: if customer_id provided, mark latest pending invoice for that customer
        if (customer_id) {
          console.log('🔁 Falling back to latest pending invoice for customer:', customer_id)
          const updateLatestForCustomer = await client.query(`
            UPDATE invoices SET deposit_paid = TRUE, updated_at = CURRENT_TIMESTAMP
            WHERE id IN (
              SELECT id FROM invoices
              WHERE customer_id::text = $1
                AND (status IS NULL OR status <> 'paid')
                AND COALESCE(deposit_paid, FALSE) = FALSE
              ORDER BY created_at DESC
              LIMIT 1
            )
            RETURNING id, deposit_paid
          `, [String(customer_id)])
          if (updateLatestForCustomer.rowCount && updateLatestForCustomer.rowCount > 0) {
            console.log('✅ Deposit marked paid by customer fallback:', updateLatestForCustomer.rows)
            return NextResponse.json({ success: true })
          }
        }
        
        return NextResponse.json({ success: false, error: 'No matching invoice found to mark deposit paid' }, { status: 404 })
      } else if (action === 'mark_fully_paid') {
        // Mark entire invoice as paid
        await markFullyPaidById(String(invoice_id))
        
      } else if (action === 'update_deposit_status') {
        // Update deposit status
        await client.query(`
          UPDATE invoices 
          SET deposit_paid = $2, updated_at = CURRENT_TIMESTAMP
          WHERE id = $1
        `, [invoice_id, deposit_paid])
      }
      
      console.log('✅ Invoice update successful')
      return NextResponse.json({ success: true })
      
    } finally {
      client.release()
    }
  } catch (error: any) {
    console.error('💥 Admin Invoices API Error:', error)
    console.error('💥 Error message:', error?.message)
    console.error('💥 Error stack:', error?.stack)
    return NextResponse.json(
      { error: `Failed to update invoice: ${error?.message || 'Unknown error'}` },
      { status: 500 }
    )
  }
}