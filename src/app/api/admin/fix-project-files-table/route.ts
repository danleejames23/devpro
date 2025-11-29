import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/database'

export async function GET() {
  return await fixProjectFilesTable()
}

export async function POST() {
  return await fixProjectFilesTable()
}

async function fixProjectFilesTable() {
  try {
    const client = await getDatabase()
    
    try {
      // Check if project_files table exists
      const tableExists = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'project_files'
        )
      `)
      
      if (!tableExists.rows[0].exists) {
        // Create the table with all necessary columns
        await client.query(`
          CREATE TABLE project_files (
            id SERIAL PRIMARY KEY,
            project_id INTEGER,
            file_name VARCHAR(255),
            original_name VARCHAR(255),
            file_path VARCHAR(500),
            file_size BIGINT,
            file_type VARCHAR(100),
            uploaded_by_admin BOOLEAN DEFAULT true,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `)
        console.log('✅ Created project_files table with all columns')
        
        return NextResponse.json({
          success: true,
          message: 'project_files table created successfully'
        })
      }
      
      // Table exists, check and add missing columns
      const columns = [
        { name: 'created_at', type: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP' },
        { name: 'updated_at', type: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP' },
        { name: 'original_name', type: 'VARCHAR(255)' },
        { name: 'file_path', type: 'VARCHAR(500)' }
      ]
      
      const addedColumns = []
      
      for (const column of columns) {
        const columnExists = await client.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'project_files' 
            AND column_name = $1
          )
        `, [column.name])
        
        if (!columnExists.rows[0].exists) {
          await client.query(`
            ALTER TABLE project_files 
            ADD COLUMN ${column.name} ${column.type}
          `)
          addedColumns.push(column.name)
          console.log(`✅ Added ${column.name} column to project_files table`)
        }
      }
      
      // Update existing rows to have timestamps if they don't
      if (addedColumns.includes('created_at') || addedColumns.includes('updated_at')) {
        await client.query(`
          UPDATE project_files 
          SET created_at = COALESCE(created_at, CURRENT_TIMESTAMP),
              updated_at = COALESCE(updated_at, CURRENT_TIMESTAMP)
          WHERE created_at IS NULL OR updated_at IS NULL
        `)
        console.log('✅ Updated existing rows with timestamps')
      }
      
      return NextResponse.json({
        success: true,
        message: `project_files table updated. Added columns: ${addedColumns.length > 0 ? addedColumns.join(', ') : 'none (all existed)'}`
      })
      
    } finally {
      client.release()
    }
    
  } catch (error) {
    console.error('❌ Error fixing project_files table:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fix table'
    }, { status: 500 })
  }
}
