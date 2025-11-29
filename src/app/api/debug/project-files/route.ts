import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    
    if (!projectId) {
      return NextResponse.json({ error: 'projectId required' }, { status: 400 })
    }
    
    const client = await getDatabase()
    
    try {
      // Check if project exists and has folder_number
      const projectResult = await client.query('SELECT * FROM projects WHERE id = $1', [projectId])
      
      // Check if project_files table exists
      const tableExists = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' AND table_name = 'project_files'
        )
      `)
      
      // Get all project_files for this project
      let filesResult = { rows: [] }
      if (tableExists.rows[0].exists) {
        filesResult = await client.query('SELECT * FROM project_files WHERE project_id = $1', [projectId])
      }
      
      // Check folder_number column exists
      const folderColumnExists = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_schema = 'public' 
          AND table_name = 'projects' 
          AND column_name = 'folder_number'
        )
      `)
      
      return NextResponse.json({
        success: true,
        debug: {
          projectId,
          project: projectResult.rows[0] || null,
          projectExists: projectResult.rows.length > 0,
          folderNumber: projectResult.rows[0]?.folder_number || null,
          folderColumnExists: folderColumnExists.rows[0].exists,
          projectFilesTableExists: tableExists.rows[0].exists,
          projectFilesCount: filesResult.rows.length,
          projectFiles: filesResult.rows
        }
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
