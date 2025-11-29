import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/database'

export async function GET() {
  try {
    console.log('🔍 Testing database connection...')
    const client = await getDatabase()
    
    try {
      // Test basic connection
      const result = await client.query('SELECT NOW() as current_time')
      console.log('✅ Database connection successful:', result.rows[0].current_time)
      
      // Check what tables exist
      const tables = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name
      `)
      
      const tableNames = tables.rows.map(row => row.table_name)
      console.log('📋 Existing tables:', tableNames)
      
      return NextResponse.json({
        success: true,
        message: 'Database connection successful',
        current_time: result.rows[0].current_time,
        existing_tables: tableNames
      })
      
    } finally {
      client.release()
    }
    
  } catch (error) {
    console.error('❌ Database connection test failed:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error instanceof Error ? error.stack : 'No details'
    }, { status: 500 })
  }
}
