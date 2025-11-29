import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/database'

// Get all customer conversations for admin
export async function GET(request: NextRequest) {
  try {
    // TODO: Add admin authentication check
    
    const client = await getDatabase()
    
    try {
      // Get all messages with customer info from existing database
      const result = await client.query(`
        SELECT 
          m.*,
          c.first_name,
          c.last_name,
          c.email,
          CONCAT(c.first_name, ' ', c.last_name) as customer_name,
          c.id as customer_id
        FROM messages m
        LEFT JOIN customers c ON m.customer_id = c.id
        ORDER BY m.created_at DESC
      `)
      
      // Transform to match expected format
      const messages = result.rows.map(row => ({
        id: row.id,
        customer_id: row.customer_id,
        customer_name: row.customer_name || 'Unknown Customer',
        customer_avatar: null,
        subject: row.subject || 'No Subject',
        message: row.message,
        is_from_admin: row.is_from_admin,
        created_at: row.created_at,
        is_read: row.is_read,
        attachments: [],
        thread_id: null,
        reply_to: null,
        priority: 'medium',
        tags: []
      }))
      
      return NextResponse.json({
        success: true,
        messages: messages
      })
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('❌ Error fetching admin messages:', error)
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    )
  }
}

// Send a message from admin to customer
export async function POST(request: NextRequest) {
  try {
    // TODO: Add admin authentication check
    
    const { customer_id, message } = await request.json()
    
    if (!customer_id || !message || message.trim().length === 0) {
      return NextResponse.json(
        { error: 'customer_id and message are required' },
        { status: 400 }
      )
    }
    
    const client = await getDatabase()
    
    try {
      // Insert new message from admin
      const result = await client.query(`
        INSERT INTO messages (customer_id, subject, message, is_from_admin)
        VALUES ($1, 'Admin Reply', $2, TRUE)
        RETURNING id, created_at
      `, [customer_id, message.trim()])
      
      return NextResponse.json({
        success: true,
        message: {
          id: result.rows[0].id,
          sender_type: 'admin',
          message: message.trim(),
          created_at: result.rows[0].created_at,
          read_at: null
        }
      })
      
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Error sending admin message:', error)
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    )
  }
}

// Mark messages as read
export async function PATCH(request: NextRequest) {
  try {
    // TODO: Add admin authentication check
    
    const { message_ids, is_read } = await request.json()
    
    if (!message_ids || !Array.isArray(message_ids) || message_ids.length === 0) {
      return NextResponse.json(
        { error: 'message_ids array is required' },
        { status: 400 }
      )
    }
    
    const client = await getDatabase()
    
    try {
      // Update messages to mark as read
      const placeholders = message_ids.map((_, index) => `$${index + 1}`).join(', ')
      const result = await client.query(`
        UPDATE messages 
        SET is_read = $${message_ids.length + 1}
        WHERE id IN (${placeholders})
        RETURNING id
      `, [...message_ids, is_read])
      
      return NextResponse.json({
        success: true,
        updated_count: result.rows.length,
        message: `${result.rows.length} messages marked as ${is_read ? 'read' : 'unread'}`
      })
      
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Error updating message read status:', error)
    return NextResponse.json(
      { error: 'Failed to update message read status' },
      { status: 500 }
    )
  }
}

