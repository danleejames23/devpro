import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/database'

// Get messages for a specific customer (admin view)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ customerId: string }> }
) {
  try {
    // TODO: Add admin authentication check
    
    const { customerId } = await params
    const client = await getDatabase()
    
    try {
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
      `, [customerId])
      
      // Mark all client messages as read (admin has seen them)
      await client.query(`
        UPDATE messages 
        SET read_at = CURRENT_TIMESTAMP 
        WHERE customer_id = $1 AND sender_type = 'client' AND read_at IS NULL
      `, [customerId])
      
      // Get customer info
      const customerResult = await client.query(`
        SELECT id, first_name, last_name, email
        FROM customers 
        WHERE id = $1
      `, [customerId])
      
      if (customerResult.rows.length === 0) {
        return NextResponse.json(
          { error: 'Customer not found' },
          { status: 404 }
        )
      }
      
      const customer = customerResult.rows[0]
      
      return NextResponse.json({
        success: true,
        customer: {
          id: customer.id,
          name: `${customer.first_name} ${customer.last_name}`,
          email: customer.email
        },
        messages: messagesResult.rows
      })
      
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Error fetching customer messages:', error)
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    )
  }
}
