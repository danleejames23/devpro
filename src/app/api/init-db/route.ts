import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/database'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders })
}

export async function POST() {
  try {
    console.log('🔍 Initializing database...')
    const client = await getDatabase()
    
    try {
      // Create customers table if it doesn't exist
      await client.query(`
        CREATE TABLE IF NOT EXISTS customers (
          id SERIAL PRIMARY KEY,
          first_name VARCHAR(100) NOT NULL,
          last_name VARCHAR(100) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          company VARCHAR(255),
          phone VARCHAR(50),
          address TEXT,
          website VARCHAR(255),
          job_title VARCHAR(100),
          industry VARCHAR(100),
          company_size VARCHAR(50),
          timezone VARCHAR(50),
          preferred_contact VARCHAR(50),
          linkedin VARCHAR(255),
          twitter VARCHAR(255),
          bio TEXT,
          country VARCHAR(100),
          city VARCHAR(100),
          postal_code VARCHAR(20),
          vat_number VARCHAR(50),
          business_type VARCHAR(100),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `)

      // Check if test customer exists
      const existingCustomer = await client.query(
        'SELECT id FROM customers WHERE email = $1',
        ['test@example.com']
      )

      if (existingCustomer.rows.length === 0) {
        // Create test customer with simple password (for testing only)
        await client.query(`
          INSERT INTO customers (
            first_name, last_name, email, password_hash, company
          ) VALUES ($1, $2, $3, $4, $5)
        `, ['Test', 'User', 'test@example.com', 'password123', 'Test Company'])
        
        console.log('✅ Test customer created')
      }

      return NextResponse.json({
        success: true,
        message: 'Database initialized successfully',
        testCredentials: {
          email: 'test@example.com',
          password: 'password123'
        }
      }, { headers: corsHeaders })
      
    } finally {
      client.release()
    }
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500, headers: corsHeaders })
  }
}
