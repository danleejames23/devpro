import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { getCustomerByEmail } from '@/lib/database'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, Content-Type',
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders })
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: 'No token provided' }, { status: 401, headers: corsHeaders })
    }

    const token = authHeader.substring(7) // Remove 'Bearer ' prefix

    // Try JWT verify first; if it fails, fall back to base64 email token
    let email: string | null = null
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { email: string }
      email = decoded.email
    } catch {
      // Fallback: base64 email token (from simple-login)
      try {
        const decodedEmail = Buffer.from(token, 'base64').toString('utf8')
        // rudimentary validation
        if (/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(decodedEmail)) {
          email = decodedEmail
        }
      } catch {
        // ignore
      }
    }

    if (!email) {
      return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401, headers: corsHeaders })
    }

    // Get customer from database
    const customer = await getCustomerByEmail(email)
    
    if (!customer) {
      return NextResponse.json({ success: false, error: 'Customer not found' }, { status: 401, headers: corsHeaders })
    }

    return NextResponse.json({
      success: true,
      customer: {
        id: customer.id,
        name: `${customer.first_name} ${customer.last_name}`,
        email: customer.email,
        company: customer.company
      }
    }, { headers: corsHeaders })

  } catch (error) {
    console.error('Auth verification failed:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500, headers: corsHeaders })
  }
}
