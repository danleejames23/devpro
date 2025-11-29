import { NextRequest, NextResponse } from 'next/server'
import { getCustomerByEmail } from '@/lib/database'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders })
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Missing email query parameter' },
        { status: 400, headers: corsHeaders }
      )
    }

    const customer = await getCustomerByEmail(email)

    if (!customer) {
      return NextResponse.json(
        { success: true, exists: false },
        { status: 200, headers: corsHeaders }
      )
    }

    // Sanitize output
    const safe = {
      id: customer.id,
      email: customer.email,
      first_name: customer.first_name,
      last_name: customer.last_name,
      company: customer.company,
      created_at: (customer as any).created_at,
      updated_at: (customer as any).updated_at,
    }

    return NextResponse.json(
      { success: true, exists: true, customer: safe },
      { status: 200, headers: corsHeaders }
    )
  } catch (error) {
    console.error('Error looking up customer by email:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500, headers: corsHeaders }
    )
  }
}
