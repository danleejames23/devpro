import { NextResponse } from 'next/server'
import { getDatabase } from '@/lib/database'

export async function GET() {
  try {
    console.log('🔍 Testing database connection...')
    const client = await getDatabase()
    
    try {
      // Test basic connection
      const timeResult = await client.query('SELECT NOW() as current_time')
      console.log('✅ Database connection successful:', timeResult.rows[0].current_time)
      
      // Check what tables exist
      const tablesResult = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        ORDER BY table_name
      `)
      
      const tables = tablesResult.rows.map(row => row.table_name)
      console.log('📋 Available tables:', tables)
      
      // Check each table for data
      const tableData: any = {}
      for (const table of tables) {
        try {
          const countResult = await client.query(`SELECT COUNT(*) FROM ${table}`)
          tableData[table] = parseInt(countResult.rows[0].count)
        } catch (error) {
          tableData[table] = `Error: ${error}`
        }
      }
      
      console.log('📊 Table row counts:', tableData)
      
      return NextResponse.json({
        success: true,
        connection: 'OK',
        current_time: timeResult.rows[0].current_time,
        tables: tables,
        table_counts: tableData
      })
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('❌ Database test failed:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error instanceof Error ? error.stack : 'No details'
    }, { status: 500 })
  }
}
