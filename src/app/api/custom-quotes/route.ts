import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import bcrypt from 'bcryptjs'

// POST - Submit a new custom quote request (with optional user registration)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      // Contact Info
      firstName,
      lastName,
      email,
      phone,
      company,
      password, // For new user registration
      
      // Project Details
      projectType,
      projectTitle,
      projectDescription,
      
      // Requirements
      features,
      integrations,
      targetAudience,
      competitors,
      
      // Technical
      preferredTechStack,
      hostingPreference,
      hasExistingSystem,
      existingSystemDetails,
      
      // Timeline & Budget
      preferredTimeline,
      budgetRange,
      
      // Additional
      additionalNotes,
    } = body

    // Validate required fields
    if (!firstName || !lastName || !email || !projectType || !projectTitle || !projectDescription) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if user exists
    const existingUser = await query(
      'SELECT id FROM customers WHERE email = $1',
      [email.toLowerCase()]
    )

    let customerId: string | null = null

    if (existingUser.rows.length > 0) {
      // User exists
      customerId = existingUser.rows[0].id
    } else if (password) {
      // Create new user account
      const passwordHash = await bcrypt.hash(password, 12)
      
      const newUser = await query(
        `INSERT INTO customers (first_name, last_name, email, password_hash, phone, company)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id`,
        [firstName, lastName, email.toLowerCase(), passwordHash, phone || null, company || null]
      )
      
      customerId = newUser.rows[0].id
    }

    // Insert custom quote request
    const result = await query(
      `INSERT INTO custom_quotes (
        customer_id,
        first_name,
        last_name,
        email,
        phone,
        company,
        project_type,
        project_title,
        project_description,
        features,
        integrations,
        target_audience,
        competitors,
        preferred_tech_stack,
        hosting_preference,
        has_existing_system,
        existing_system_details,
        preferred_timeline,
        budget_range,
        additional_notes,
        status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, 'pending')
      RETURNING *`,
      [
        customerId,
        firstName,
        lastName,
        email.toLowerCase(),
        phone || null,
        company || null,
        projectType,
        projectTitle,
        projectDescription,
        features || [],
        integrations || [],
        targetAudience || null,
        competitors || null,
        preferredTechStack || null,
        hostingPreference || null,
        hasExistingSystem || false,
        existingSystemDetails || null,
        preferredTimeline || null,
        budgetRange || null,
        additionalNotes || null
      ]
    )

    return NextResponse.json({
      success: true,
      customQuote: result.rows[0],
      userCreated: !existingUser.rows.length && !!password,
      customerId
    })

  } catch (error) {
    console.error('Error creating custom quote:', error)
    return NextResponse.json(
      { error: 'Failed to submit custom quote request' },
      { status: 500 }
    )
  }
}

// GET - Get custom quotes for a customer
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const customerId = searchParams.get('customerId')

    if (!customerId) {
      return NextResponse.json(
        { error: 'Customer ID required' },
        { status: 400 }
      )
    }

    const result = await query(
      `SELECT * FROM custom_quotes 
       WHERE customer_id = $1 
       ORDER BY created_at DESC`,
      [customerId]
    )

    return NextResponse.json({
      success: true,
      customQuotes: result.rows
    })

  } catch (error) {
    console.error('Error fetching custom quotes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch custom quotes' },
      { status: 500 }
    )
  }
}
