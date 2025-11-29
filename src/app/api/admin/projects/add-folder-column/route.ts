import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/database'

export async function POST() {
  try {
    const client = await getDatabase()
    
    try {
      // Check if folder_number column exists
      const columnExists = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_schema = 'public' 
          AND table_name = 'projects' 
          AND column_name = 'folder_number'
        )
      `)
      
      if (!columnExists.rows[0].exists) {
        // Add folder_number column
        await client.query(`
          ALTER TABLE projects 
          ADD COLUMN folder_number VARCHAR(10)
        `)
        console.log('✅ Added folder_number column to projects table')
        
        // Update existing projects with folder numbers
        const existingProjects = await client.query(`
          SELECT id FROM projects 
          WHERE folder_number IS NULL 
          ORDER BY id ASC
        `)
        
        for (let i = 0; i < existingProjects.rows.length; i++) {
          const folderNumber = (i + 1).toString().padStart(3, '0')
          await client.query(
            'UPDATE projects SET folder_number = $1 WHERE id = $2',
            [folderNumber, existingProjects.rows[i].id]
          )
        }
        
        console.log(`✅ Updated ${existingProjects.rows.length} existing projects with folder numbers`)
      }
      
      return NextResponse.json({
        success: true,
        message: 'Projects table updated with folder_number column'
      })
      
    } finally {
      client.release()
    }
    
  } catch (error) {
    console.error('❌ Error updating projects table:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update table'
    }, { status: 500 })
  }
}
