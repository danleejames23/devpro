import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { getCustomerByEmail } from '@/lib/database'
import bcrypt from 'bcryptjs'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Client login attempt started...')
    const { email, password } = await request.json()
    console.log('📧 Login attempt for email:', email)

    if (!email || !password) {
      console.log('❌ Missing email or password')
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Get customer from database
    console.log('🔍 Looking up customer in database...')
    const customer = await getCustomerByEmail(email)
    console.log('👤 Customer found:', customer ? 'Yes' : 'No')
    
    if (!customer) {
      console.log('❌ Customer not found for email:', email)
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Check password (assuming password is stored as hash)
    console.log('🔐 Checking password...')
    const isPasswordValid = await bcrypt.compare(password, customer.password_hash)
    console.log('🔐 Password valid:', isPasswordValid)
    
    if (!isPasswordValid) {
      console.log('❌ Invalid password for email:', email)
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Generate JWT token
    console.log('🎫 Generating JWT token...')
    const token = jwt.sign(
      { email: customer.email, id: customer.id },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    console.log('✅ Login successful for:', email)
    return NextResponse.json({
      success: true,
      token,
      customer: {
        id: customer.id,
        name: `${customer.first_name} ${customer.last_name}`,
        email: customer.email,
        company: customer.company
      }
    })

  } catch (error) {
    console.error('❌ Login failed with error:', error)
    console.error('❌ Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace'
    })
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
