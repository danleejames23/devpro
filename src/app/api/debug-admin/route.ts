import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/database'

export async function GET() {
  const results = {
    database_connection: null as string | null,
    existing_tables: [] as string[],
    customers_count: 0,
    quotes_count: 0,
    projects_count: 0,
    messages_count: 0,
    invoices_count: 0,
    errors: [] as string[]
  }

  try {
    console.log('🔍 Testing database connection...')
    const client = await getDatabase()
    
    try {
      // Test basic connection
      const timeResult = await client.query('SELECT NOW() as current_time')
      results.database_connection = 'SUCCESS'
      console.log('✅ Database connection successful')
      
      // Check what tables exist
      const tables = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name
      `)
      
      results.existing_tables = tables.rows.map(row => row.table_name)
      console.log('📋 Existing tables:', results.existing_tables)
      
      // Count records in each table (if they exist)
      for (const table of ['customers', 'quotes', 'projects', 'messages', 'invoices']) {
        try {
          if (results.existing_tables.includes(table)) {
            const countResult = await client.query(`SELECT COUNT(*) as count FROM ${table}`)
            const count = parseInt(countResult.rows[0].count)
            
            // Update the appropriate count property
            switch (table) {
              case 'customers':
                results.customers_count = count
                break
              case 'quotes':
                results.quotes_count = count
                break
              case 'projects':
                results.projects_count = count
                break
              case 'messages':
                results.messages_count = count
                break
              case 'invoices':
                results.invoices_count = count
                break
            }
            console.log(`📊 ${table}: ${count} records`)
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error)
          results.errors.push(`Error counting ${table}: ${errorMessage}`)
        }
      }
      
    } finally {
      client.release()
    }
    
  } catch (error) {
    console.error('❌ Database connection failed:', error)
    results.database_connection = 'FAILED'
    const errorMessage = error instanceof Error ? error.message : String(error)
    results.errors.push(`Database connection: ${errorMessage}`)
  }

  return NextResponse.json({
    success: results.database_connection === 'SUCCESS',
    debug_info: results
  })
}
