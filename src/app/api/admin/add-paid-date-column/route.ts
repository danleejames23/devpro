import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/database'

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Adding paid_date column to invoices table...')
    
    const client = await getDatabase()
    
    try {
      // Check if paid_date column exists
      const columnExists = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_schema = 'public' 
          AND table_name = 'invoices' 
          AND column_name = 'paid_date'
        )
      `)
      
      if (!columnExists.rows[0].exists) {
        // Add paid_date column
        await client.query(`
          ALTER TABLE invoices 
          ADD COLUMN paid_date DATE
        `)
        console.log('✅ Added paid_date column to invoices table')
        
        return NextResponse.json({
          success: true,
          message: 'paid_date column added to invoices table'
        })
      } else {
        return NextResponse.json({
          success: true,
          message: 'paid_date column already exists'
        })
      }
      
    } finally {
      client.release()
    }
    
  } catch (error) {
    console.error('❌ Error adding paid_date column:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to add column'
    }, { status: 500 })
  }
}
