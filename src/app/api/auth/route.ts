import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getDatabase } from '@/lib/database'

// POST /api/auth - Authenticate customer
export async function POST(request: NextRequest) {
  let client
  try {
    const { email, password } = await request.json()
    
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      )
    }
    
    // Connect to database
    client = await getDatabase()
    
    // Find customer with matching email
    const result = await client.query(
      'SELECT id, first_name, last_name, email, company, password_hash, created_at FROM customers WHERE email = $1',
      [email.toLowerCase().trim()]
    )
    
    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      )
    }
    
    const customer = result.rows[0]
    
    // Verify password
    const isValidPassword = await bcrypt.compare(password, customer.password_hash)
    
    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      )
    }
    
    // Return customer data (without password)
    const customerData = {
      id: customer.id,
      name: `${customer.first_name} ${customer.last_name}`.trim(),
      email: customer.email,
      company: customer.company,
      createdAt: customer.created_at
    }
    
    return NextResponse.json({ 
      success: true, 
      customer: customerData 
    })
    
  } catch (error) {
    console.error('Error authenticating customer:', error)
    return NextResponse.json(
      { success: false, error: 'Authentication failed' },
      { status: 500 }
    )
  } finally {
    if (client) {
      client.release()
    }
  }
}
