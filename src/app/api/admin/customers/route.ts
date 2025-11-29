import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    // TODO: Add admin authentication check
    
    const client = await getDatabase()
    
    try {
      console.log('🔍 Fetching customers from existing database...')
      
      // First, let's try a simple query to see if we can get customers at all
      const simpleResult = await client.query('SELECT COUNT(*) FROM customers')
      console.log('📊 Total customers in database:', simpleResult.rows[0].count)
      
      // Get all customers with project stats from existing database
      const result = await client.query(`
        SELECT 
          c.*,
          CONCAT(c.first_name, ' ', c.last_name) as customer_name,
          COUNT(q.id) as total_projects,
          COALESCE(SUM(CASE WHEN q.status = 'completed' THEN q.estimated_cost ELSE 0 END), 0) as total_spent,
          CASE 
            WHEN COUNT(q.id) = 0 THEN 'pending'
            WHEN MAX(q.created_at) > NOW() - INTERVAL '30 days' THEN 'active'
            ELSE 'inactive'
          END as status,
          MAX(q.created_at) as last_activity
        FROM customers c
        LEFT JOIN quotes q ON c.id = q.customer_id
        GROUP BY c.id
        ORDER BY c.created_at DESC
      `)
      
      console.log('✅ Found', result.rows.length, 'customers with stats')
      console.log('📋 Sample customer data:', result.rows[0] ? {
        id: result.rows[0].id,
        name: result.rows[0].customer_name,
        email: result.rows[0].email
      } : 'No customers found')
      
      return NextResponse.json({
        success: true,
        customers: result.rows
      })
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('❌ Error fetching admin customers:', error)
    console.error('❌ Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace'
    })
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch customers',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // TODO: Add admin authentication check
    
    const body = await request.json()
    const { 
      first_name, last_name, email, company, phone, 
      password_hash, send_welcome_email = true 
    } = body
    
    const client = await getDatabase()
    
    try {
      // Check if customer already exists
      const existingCustomer = await client.query(
        'SELECT id FROM customers WHERE email = $1',
        [email]
      )
      
      if (existingCustomer.rows.length > 0) {
        return NextResponse.json(
          { error: 'Customer with this email already exists' },
          { status: 400 }
        )
      }
      
      // Create new customer
      const result = await client.query(`
        INSERT INTO customers (
          first_name, last_name, email, company, phone, password_hash,
          created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING *
      `, [first_name, last_name, email, company, phone, password_hash])
      
      const newCustomer = result.rows[0]
      
      // Send welcome notification if requested
      if (send_welcome_email) {
        const { sendWelcomeNotification } = await import('@/lib/notification-integration')
        await sendWelcomeNotification(
          newCustomer.id, 
          `${first_name} ${last_name}`.trim()
        )
      }
      
      return NextResponse.json({
        success: true,
        customer: newCustomer
      })
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('❌ Error creating customer:', error)
    return NextResponse.json(
      { error: 'Failed to create customer' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Customer ID is required' },
        { status: 400 }
      )
    }

    const client = await getDatabase()

    try {
      // Check if customer exists
      const customerCheck = await client.query(
        'SELECT first_name, last_name, email FROM customers WHERE id = $1',
        [id]
      )

      if (customerCheck.rows.length === 0) {
        return NextResponse.json(
          { success: false, error: 'Customer not found' },
          { status: 404 }
        )
      }

      const customer = customerCheck.rows[0]

      // Delete customer (CASCADE will handle related records)
      await client.query('DELETE FROM customers WHERE id = $1', [id])

      console.log('✅ Customer deleted:', {
        id,
        name: `${customer.first_name} ${customer.last_name}`,
        email: customer.email
      })

      return NextResponse.json({
        success: true,
        message: 'Customer deleted successfully'
      })

    } finally {
      client.release()
    }

  } catch (error) {
    console.error('❌ Error deleting customer:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete customer' },
      { status: 500 }
    )
  }
}
