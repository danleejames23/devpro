import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/database'

export async function POST() {
  try {
    const client = await getDatabase()
    
    try {
      // 1. Update an existing quote with package data
      const existingQuote = await client.query('SELECT id FROM quotes LIMIT 1')
      
      if (existingQuote.rows.length > 0) {
        const quoteId = existingQuote.rows[0].id
        
        const samplePackage = {
          name: "Premium Website Package",
          title: "Premium Website Package", 
          complexity: "advanced",
          features: [
            "Custom Design",
            "Responsive Layout", 
            "SEO Optimization",
            "Contact Forms",
            "Admin Panel",
            "Database Integration"
          ]
        }
        
        await client.query(`
          UPDATE quotes 
          SET selected_package = $1
          WHERE id = $2
        `, [JSON.stringify(samplePackage), quoteId])
        
        console.log('✅ Updated quote with package data')
      }
      
      // 2. Create a test invoice with deposit data
      const testInvoice = await client.query(`
        INSERT INTO invoices (
          invoice_number, customer_id, amount, description, due_date,
          deposit_amount, deposit_required, deposit_paid, status,
          line_items, created_at, updated_at
        ) VALUES (
          'TEST-001', 
          (SELECT id FROM customers LIMIT 1),
          1000.00,
          'Test Invoice with Deposit',
          CURRENT_DATE + INTERVAL '30 days',
          200.00,
          true,
          false,
          'pending',
          $1,
          CURRENT_TIMESTAMP,
          CURRENT_TIMESTAMP
        ) RETURNING id
      `, [JSON.stringify([
        {
          description: "Premium Website Package",
          quantity: 1,
          rate: 1000,
          total: 1000,
          package_name: "Premium Website Package",
          features: ["Custom Design", "Responsive Layout", "SEO Optimization"]
        },
        {
          description: "20% Deposit Required Before Work Starts",
          quantity: 1,
          rate: 200,
          total: 200
        }
      ])])
      
      console.log('✅ Created test invoice with deposit')
      
      return NextResponse.json({
        success: true,
        message: 'Test data added successfully',
        actions: [
          'Updated existing quote with package data',
          'Created test invoice with 20% deposit'
        ]
      })
      
    } finally {
      client.release()
    }
    
  } catch (error) {
    console.error('❌ Error adding test data:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to add test data'
    }, { status: 500 })
  }
}
