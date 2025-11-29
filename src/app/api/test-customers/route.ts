import { NextResponse } from 'next/server'
import { getDatabase } from '@/lib/database'

export async function GET() {
  try {
    console.log('🔍 Testing customer database...')
    const client = await getDatabase()
    
    try {
      // Check if customers table exists
      const tableExists = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'customers'
        )
      `)
      
      if (!tableExists.rows[0].exists) {
        return NextResponse.json({
          success: false,
          error: 'Customers table does not exist',
          customers: []
        })
      }
      
      // Get count of customers
      const countResult = await client.query('SELECT COUNT(*) FROM customers')
      const totalCustomers = countResult.rows[0].count
      console.log('📊 Total customers in database:', totalCustomers)
      
      // Get first few customers
      const result = await client.query(`
        SELECT id, first_name, last_name, email, company, created_at
        FROM customers 
        ORDER BY created_at DESC 
        LIMIT 5
      `)
      
      console.log('👥 Sample customers:', result.rows)
      
      return NextResponse.json({
        success: true,
        total_customers: totalCustomers,
        sample_customers: result.rows
      })
      
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('❌ Error testing customers:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error instanceof Error ? error.stack : 'No details'
    }, { status: 500 })
  }
}
