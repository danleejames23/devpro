import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/database'
import bcrypt from 'bcryptjs'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders })
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Simple login attempt started...')
    const { email, password } = await request.json()
    console.log('📧 Login attempt for email:', email)

    if (!email || !password) {
      console.log('❌ Missing email or password')
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400, headers: corsHeaders }
      )
    }

    // Test database connection with timeout
    console.log('🔍 Testing database connection...')
    
    // Create a timeout promise
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Database connection timeout')), 12000)
    })
    
    // Race between database connection and timeout
    const client = await Promise.race([
      getDatabase(),
      timeoutPromise
    ])
    
    try {
      // Simple test query
      await client.query('SELECT NOW()')
      console.log('✅ Database connection successful')
      
      // For now, check email and password directly (simplified auth)
      const result = await client.query(
        'SELECT id, first_name, last_name, email, password_hash FROM customers WHERE email = $1',
        [email]
      )
      
      if (result.rows.length === 0) {
        console.log('❌ Customer not found for email:', email)
        return NextResponse.json(
          { success: false, error: 'Invalid email or password' },
          { status: 401, headers: corsHeaders }
        )
      }
      
      const customer = result.rows[0]
      
      // Password check: try bcrypt first, fallback to plaintext equality
      let isValid = false
      try {
        isValid = await bcrypt.compare(password, customer.password_hash)
      } catch (e) {
        isValid = false
      }
      if (!isValid && customer.password_hash === password) {
        isValid = true
      }
      if (!isValid) {
        console.log('❌ Invalid password for email:', email)
        return NextResponse.json(
          { success: false, error: 'Invalid email or password' },
          { status: 401, headers: corsHeaders }
        )
      }
      
      console.log('✅ Customer authenticated:', customer.email)
      
      // Simple token (just base64 encoded email for now)
      const token = Buffer.from(email).toString('base64')
      
      return NextResponse.json({
        success: true,
        token,
        customer: {
          id: customer.id,
          name: `${customer.first_name} ${customer.last_name}`,
          email: customer.email
        }
      }, { headers: corsHeaders })
      
    } finally {
      client.release()
    }

  } catch (error) {
    console.error('❌ Simple login failed:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Database connection failed' },
      { status: 500, headers: corsHeaders }
    )
  }
}
