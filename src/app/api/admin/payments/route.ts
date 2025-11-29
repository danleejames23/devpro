import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Admin payments GET called')
    
    const client = await getDatabase()
    
    try {
      // Create payments table if it doesn't exist
      await client.query(`
        CREATE TABLE IF NOT EXISTS payments (
          id SERIAL PRIMARY KEY,
          invoice_id VARCHAR(255) NOT NULL,
          customer_id VARCHAR(255) NOT NULL,
          amount DECIMAL(10,2) NOT NULL,
          payment_type VARCHAR(50) NOT NULL, -- 'deposit' or 'remaining'
          payment_method VARCHAR(50) DEFAULT 'simulated',
          status VARCHAR(50) DEFAULT 'completed',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `)
      
      // Get all payments with customer and invoice information
      // Use text casting to handle UUID/integer type mismatches
      const result = await client.query(`
        SELECT 
          p.*,
          c.first_name,
          c.last_name,
          c.email,
          CONCAT(c.first_name, ' ', c.last_name) as customer_name,
          i.amount as invoice_total,
          i.status as invoice_status
        FROM payments p
        LEFT JOIN customers c ON p.customer_id::text = c.id::text
        LEFT JOIN invoices i ON p.invoice_id::text = i.id::text
        ORDER BY p.created_at DESC
      `)
      
      const payments = result.rows.map(row => ({
        id: row.id,
        invoice_id: row.invoice_id,
        customer_id: row.customer_id,
        customer_name: row.customer_name || 'Unknown Customer',
        amount: parseFloat(row.amount) || 0,
        payment_type: row.payment_type,
        payment_method: row.payment_method,
        status: row.status,
        invoice_total: parseFloat(row.invoice_total) || 0,
        invoice_status: row.invoice_status,
        created_at: row.created_at,
        updated_at: row.updated_at
      }))
      
      return NextResponse.json({
        success: true,
        payments: payments
      })
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('❌ Error fetching admin payments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch payments' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('💳 Recording new payment')
    
    const { invoice_id, customer_id, amount, payment_type } = await request.json()
    
    if (!invoice_id || !customer_id || !amount || !payment_type) {
      return NextResponse.json(
        { error: 'invoice_id, customer_id, amount, and payment_type are required' },
        { status: 400 }
      )
    }
    
    const client = await getDatabase()
    
    try {
      // Insert new payment record
      const result = await client.query(`
        INSERT INTO payments (invoice_id, customer_id, amount, payment_type, payment_method, status)
        VALUES ($1, $2, $3, $4, 'simulated', 'completed')
        RETURNING *
      `, [invoice_id, customer_id, amount, payment_type])
      
      console.log('✅ Payment recorded:', result.rows[0])
      
      return NextResponse.json({
        success: true,
        payment: result.rows[0]
      })
      
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('❌ Error recording payment:', error)
    return NextResponse.json(
      { error: 'Failed to record payment' },
      { status: 500 }
    )
  }
}
