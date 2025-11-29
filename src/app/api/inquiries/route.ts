import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/database'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, subject, message, projectType } = body

    // Validation
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      )
    }

    const client = await getDatabase()

    try {
      // Get client IP and user agent for tracking
      const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
                 request.headers.get('x-real-ip') || 
                 'unknown'
      const userAgent = request.headers.get('user-agent') || 'unknown'

      console.log('🔍 Attempting to insert inquiry:', {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        subject: subject.trim(),
        message: message.trim().substring(0, 50) + '...',
        projectType: projectType || null
      })

      // Generate simple inquiry ID
      const year = new Date().getFullYear()
      const timestamp = Date.now().toString().slice(-6)
      const inquiryId = `INQ-${year}-${timestamp}`

      // Insert inquiry into database
      const result = await client.query(`
        INSERT INTO inquiries (
          inquiry_id,
          name, 
          email, 
          subject, 
          message, 
          project_type, 
          ip_address, 
          user_agent,
          status,
          priority
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING id, inquiry_id, created_at
      `, [
        inquiryId,
        name.trim(),
        email.trim().toLowerCase(),
        subject.trim(),
        message.trim(),
        projectType || null,
        ip,
        userAgent,
        'new',
        'normal'
      ])

      const inquiry = result.rows[0]

      console.log('✅ New inquiry created:', {
        id: inquiry.id,
        inquiry_id: inquiry.inquiry_id,
        name,
        email,
        project_type: projectType
      })

      return NextResponse.json({
        success: true,
        inquiry: {
          id: inquiry.id,
          inquiry_id: inquiry.inquiry_id,
          created_at: inquiry.created_at
        },
        message: 'Inquiry submitted successfully'
      })

    } finally {
      client.release()
    }

  } catch (error) {
    console.error('❌ Error creating inquiry:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to submit inquiry' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const client = await getDatabase()

    try {
      let query = `
        SELECT 
          id,
          inquiry_id,
          name,
          email,
          subject,
          message,
          project_type,
          status,
          priority,
          assigned_to,
          notes,
          follow_up_date,
          contacted_at,
          converted_to_quote_id,
          source,
          created_at,
          updated_at
        FROM inquiries
      `
      
      const params: any[] = []
      
      if (status) {
        query += ` WHERE status = $1`
        params.push(status)
      }
      
      query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`
      params.push(limit, offset)

      const result = await client.query(query, params)

      // Get total count
      let countQuery = 'SELECT COUNT(*) FROM inquiries'
      const countParams: any[] = []
      
      if (status) {
        countQuery += ' WHERE status = $1'
        countParams.push(status)
      }
      
      const countResult = await client.query(countQuery, countParams)
      const total = parseInt(countResult.rows[0].count)

      return NextResponse.json({
        success: true,
        inquiries: result.rows,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total
        }
      })

    } finally {
      client.release()
    }

  } catch (error) {
    console.error('❌ Error fetching inquiries:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch inquiries' },
      { status: 500 }
    )
  }
}
