import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    // Get customer ID from authentication (for now, we'll use query param)
    const { searchParams } = new URL(request.url)
    const customer_id = searchParams.get('customer_id')
    
    if (!customer_id) {
      return NextResponse.json(
        { success: false, error: 'Customer ID is required' },
        { status: 400 }
      )
    }
    
    const client = await getDatabase()
    
    try {
      // Check if invoices table exists
      const tableCheck = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'invoices'
        )
      `)
      
      if (!tableCheck.rows[0].exists) {
        console.log('Creating invoices table...')
        await client.query(`
          CREATE TABLE invoices (
            id SERIAL PRIMARY KEY,
            invoice_number VARCHAR(50) UNIQUE,
            customer_id UUID,
            quote_id VARCHAR(50),
            amount DECIMAL(10,2),
            description TEXT,
            due_date DATE,
            line_items JSONB,
            tax_rate DECIMAL(5,2) DEFAULT 0,
            tax_amount DECIMAL(10,2) DEFAULT 0,
            total_amount DECIMAL(10,2),
            notes TEXT,
            status VARCHAR(50) DEFAULT 'pending',
            payment_date DATE,
            payment_method VARCHAR(100),
            currency VARCHAR(3) DEFAULT 'GBP',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `)
        console.log('✅ invoices table created')
      }
      
      // Get invoices for specific client only
      const result = await client.query(`
        SELECT * FROM invoices 
        WHERE customer_id::text = $1::text 
        ORDER BY created_at DESC
      `, [customer_id])
      
      return NextResponse.json({
        success: true,
        invoices: result.rows
      })
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Error fetching client invoices:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch invoices' },
      { status: 500 }
    )
  }
}
