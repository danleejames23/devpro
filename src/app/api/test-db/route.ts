import { NextRequest, NextResponse } from 'next/server'
import { testConnection, getDatabase } from '@/lib/database'

export async function GET() {
  try {
    console.log('🔍 Testing database connection...')
    
    // Test basic connection
    const isConnected = await testConnection()
    if (!isConnected) {
      return NextResponse.json({
        success: false,
        error: 'Database connection failed'
      }, { status: 500 })
    }

    // Test querying tables
    const client = await getDatabase()
    try {
      const tablesResult = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
      `)
      
      const tables = tablesResult.rows.map(row => row.table_name)
      
      return NextResponse.json({
        success: true,
        message: 'Database connection successful',
        tables: tables
      })
    } finally {
      client.release()
    }
    
  } catch (error) {
    console.error('❌ Database test failed:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
