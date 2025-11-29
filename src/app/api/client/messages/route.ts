import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const customer_id = searchParams.get('customer_id')

    if (!customer_id) {
      return NextResponse.json(
        { success: false, error: 'Customer ID is required' },
        { status: 400 }
      )
    }

    const client = await getDatabase()

    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS messages (
          id SERIAL PRIMARY KEY,
          customer_id UUID,
          subject VARCHAR(255) NOT NULL,
          message TEXT NOT NULL,
          is_from_admin BOOLEAN DEFAULT FALSE,
          is_read BOOLEAN DEFAULT FALSE,
          attachments JSONB,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `)

      const typeCheck = await client.query(`
        SELECT data_type FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'messages' AND column_name = 'customer_id'
      `)
      if (typeCheck.rows.length && typeCheck.rows[0].data_type !== 'uuid') {
        await client.query('DROP TABLE IF EXISTS messages CASCADE')
        await client.query(`
          CREATE TABLE messages (
            id SERIAL PRIMARY KEY,
            customer_id UUID,
            subject VARCHAR(255) NOT NULL,
            message TEXT NOT NULL,
            is_from_admin BOOLEAN DEFAULT FALSE,
            is_read BOOLEAN DEFAULT FALSE,
            attachments JSONB,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `)
      }

      const result = await client.query(
        `SELECT 
          id, 
          message, 
          CASE WHEN is_from_admin THEN 'admin' ELSE 'client' END as sender_type,
          created_at,
          is_read as read_at
        FROM messages 
        WHERE customer_id::text = $1::text 
        ORDER BY created_at ASC`,
        [customer_id]
      )

      return NextResponse.json({ success: true, messages: result.rows })
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Error fetching client messages:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch messages' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { customer_id, subject, message } = body

    if (!customer_id || !message) {
      return NextResponse.json(
        { success: false, error: 'customer_id and message are required' },
        { status: 400 }
      )
    }

    const client = await getDatabase()

    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS messages (
          id SERIAL PRIMARY KEY,
          customer_id UUID,
          subject VARCHAR(255) NOT NULL,
          message TEXT NOT NULL,
          is_from_admin BOOLEAN DEFAULT FALSE,
          is_read BOOLEAN DEFAULT FALSE,
          attachments JSONB,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `)

      const result = await client.query(
        `INSERT INTO messages (customer_id, subject, message, is_from_admin, attachments, created_at, updated_at)
         VALUES ($1, $2, $3, FALSE, '[]'::jsonb, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         RETURNING *`,
        [customer_id, subject || 'Chat Message', message]
      )

      return NextResponse.json({ success: true, message: result.rows[0] })
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Error creating client message:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create message' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { customer_id, action } = body

    if (!customer_id || action !== 'mark_read') {
      return NextResponse.json(
        { success: false, error: 'customer_id and action=mark_read are required' },
        { status: 400 }
      )
    }

    const client = await getDatabase()

    try {
      await client.query(`
        UPDATE messages
        SET is_read = TRUE, updated_at = CURRENT_TIMESTAMP
        WHERE customer_id::text = $1::text AND is_from_admin = TRUE AND is_read = FALSE
      `, [customer_id])

      return NextResponse.json({ success: true })
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Error marking messages as read:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to mark messages as read' },
      { status: 500 }
    )
  }
}
