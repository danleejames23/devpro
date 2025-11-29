import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/database'

export async function GET() {
  try {
    const client = await getDatabase()
    
    try {
      // Get all columns in project_files table
      const columnsResult = await client.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'project_files'
        ORDER BY ordinal_position
      `)
      
      // Get sample data to see what's actually in the table
      let sampleData = []
      try {
        const sampleResult = await client.query('SELECT * FROM project_files LIMIT 3')
        sampleData = sampleResult.rows
      } catch (e) {
        sampleData = [`Error getting sample data: ${e instanceof Error ? e.message : String(e)}`]
      }
      
      // Check if table exists
      const tableExists = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'project_files'
        )
      `)
      
      return NextResponse.json({
        success: true,
        tableExists: tableExists.rows[0].exists,
        columns: columnsResult.rows,
        sampleData: sampleData,
        rowCount: sampleData.length
      })
      
    } finally {
      client.release()
    }
    
  } catch (error) {
    console.error('Debug error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Debug failed'
    }, { status: 500 })
  }
}
