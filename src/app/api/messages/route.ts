import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/database'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// Get messages for a customer
export async function GET(request: NextRequest) {
  try {
    // Try to get customer ID from query params first (for client dashboard)
    const { searchParams } = new URL(request.url)
    const customerId = searchParams.get('customerId')
    
    let customerEmail = null
    
    if (customerId) {
      // Direct customer ID provided
      console.log('Using customer ID from query:', customerId)
    } else {
      // Try JWT authentication
      const authHeader = request.headers.get('authorization')
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json(
          { success: true, messages: [] }, // Return empty instead of error
          { status: 200 }
        )
      }

      try {
        const token = authHeader.substring(7)
        const decoded = jwt.verify(token, JWT_SECRET) as any
        customerEmail = decoded.email
      } catch (jwtError) {
        console.log('JWT verification failed:', jwtError)
        return NextResponse.json(
          { success: true, messages: [] },
          { status: 200 }
        )
      }
    }
    
    const client = await getDatabase()
    
    try {
      let actualCustomerId = customerId
      
      if (!actualCustomerId && customerEmail) {
        // Get customer ID from email
        const customerResult = await client.query(
          'SELECT id FROM customers WHERE email = $1',
          [customerEmail]
        )
        
        if (customerResult.rows.length === 0) {
          return NextResponse.json(
            { success: true, messages: [] },
            { status: 200 }
          )
        }
        
        actualCustomerId = customerResult.rows[0].id
      }
      
      if (!actualCustomerId) {
        return NextResponse.json(
          { success: true, messages: [] },
          { status: 200 }
        )
      }
      
      // Get all messages for this customer
      const messagesResult = await client.query(`
        SELECT 
          id,
          sender_type,
          message,
          created_at,
          read_at
        FROM messages 
        WHERE customer_id = $1 
        ORDER BY created_at ASC
      `, [actualCustomerId])
      
      // Mark all admin messages as read
      await client.query(`
        UPDATE messages 
        SET read_at = CURRENT_TIMESTAMP 
        WHERE customer_id = $1 AND sender_type = 'admin' AND read_at IS NULL
      `, [actualCustomerId])
      
      return NextResponse.json({
        success: true,
        messages: messagesResult.rows
      })
      
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    )
  }
}

// Send a new message
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization required' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, JWT_SECRET) as any
    const { message } = await request.json()
    
    if (!message || message.trim().length === 0) {
      return NextResponse.json(
        { error: 'Message content is required' },
        { status: 400 }
      )
    }
    
    const client = await getDatabase()
    
    try {
      // Get customer ID from email
      const customerResult = await client.query(
        'SELECT id FROM customers WHERE email = $1',
        [decoded.email]
      )
      
      if (customerResult.rows.length === 0) {
        return NextResponse.json(
          { error: 'Customer not found' },
          { status: 404 }
        )
      }
      
      const customerId = customerResult.rows[0].id
      
      // Insert new message
      const result = await client.query(`
        INSERT INTO messages (customer_id, sender_type, message)
        VALUES ($1, 'client', $2)
        RETURNING id, created_at
      `, [customerId, message.trim()])
      
      return NextResponse.json({
        success: true,
        message: {
          id: result.rows[0].id,
          sender_type: 'client',
          message: message.trim(),
          created_at: result.rows[0].created_at,
          read_at: null
        }
      })
      
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Error sending message:', error)
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    )
  }
}
