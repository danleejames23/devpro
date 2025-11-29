import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/database'

export async function GET() {
  try {
    const client = await getDatabase()
    
    try {
      // Get column types for both tables
      const projectsColumns = await client.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'projects'
        ORDER BY ordinal_position
      `)
      
      const projectFilesColumns = await client.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'project_files'
        ORDER BY ordinal_position
      `)
      
      return NextResponse.json({
        success: true,
        projects_table: projectsColumns.rows,
        project_files_table: projectFilesColumns.rows
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
