import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/database'

export async function POST(request: NextRequest) {
  try {
    const client = await getDatabase()
    
    try {
      console.log('🚀 Setting up messages table...')
      
      // Create messages table
      await client.query(`
        CREATE TABLE IF NOT EXISTS messages (
          id SERIAL PRIMARY KEY,
          customer_id INTEGER NOT NULL,
          sender_type VARCHAR(10) NOT NULL CHECK (sender_type IN ('client', 'admin')),
          message TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          read_at TIMESTAMP NULL,
          FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
        )
      `)
      
      // Create index for faster queries
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_messages_customer_id ON messages(customer_id)
      `)
      
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at)
      `)
      
      console.log('✅ Messages table created successfully!')
      
      return NextResponse.json({
        success: true,
        message: 'Messages table setup complete'
      })
      
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('❌ Error setting up messages table:', error)
    return NextResponse.json(
      { error: 'Failed to setup messages table', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Use POST to setup messages table'
  })
}
