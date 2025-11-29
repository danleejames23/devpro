import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getDatabase } from '@/lib/database'

interface CustomerAccount {
  id: string
  first_name: string
  last_name: string
  email: string
  company?: string
  password_hash: string
  created_at: string
}

export async function POST(request: NextRequest) {
  let client
  try {
    const body = await request.json()
    const { name, email, password, company } = body

    // Validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, error: 'Name, email, and password are required' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters long' },
        { status: 400 }
      )
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid email address' },
        { status: 400 }
      )
    }

    // Split name into first and last name
    const nameParts = name.trim().split(' ')
    const firstName = nameParts[0] || ''
    const lastName = nameParts.slice(1).join(' ') || ''

    // Connect to database
    client = await getDatabase()

    // Check if email already exists
    const existingCustomer = await client.query(
      'SELECT id FROM customers WHERE email = $1',
      [email.toLowerCase().trim()]
    )

    if (existingCustomer.rows.length > 0) {
      return NextResponse.json(
        { success: false, error: 'An account with this email already exists' },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create new customer
    const result = await client.query(
      `INSERT INTO customers (first_name, last_name, email, company, password_hash) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING id, first_name, last_name, email, company, created_at`,
      [firstName, lastName, email.toLowerCase().trim(), company?.trim() || null, hashedPassword]
    )

    const newCustomer = result.rows[0]

    // Return customer data (without password)
    return NextResponse.json({
      success: true,
      customer: {
        id: newCustomer.id,
        name: `${newCustomer.first_name} ${newCustomer.last_name}`.trim(),
        email: newCustomer.email,
        company: newCustomer.company,
        createdAt: newCustomer.created_at
      },
      message: 'Account created successfully'
    })

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    if (client) {
      client.release()
    }
  }
}
