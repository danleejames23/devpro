import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/database'

export async function POST(request: NextRequest) {
  try {
    const client = await getDatabase()

    try {
      // Check if read_at column already exists
      const columnCheck = await client.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'inquiries' 
        AND column_name = 'read_at'
      `)

      if (columnCheck.rows.length > 0) {
        return NextResponse.json({
          success: true,
          message: 'read_at column already exists'
        })
      }

      // Add read_at column to inquiries table
      await client.query(`
        ALTER TABLE inquiries 
        ADD COLUMN read_at TIMESTAMP WITH TIME ZONE
      `)

      console.log('✅ Added read_at column to inquiries table')

      return NextResponse.json({
        success: true,
        message: 'read_at column added successfully'
      })

    } finally {
      client.release()
    }

  } catch (error) {
    console.error('❌ Error adding read_at column:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to add read_at column',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
