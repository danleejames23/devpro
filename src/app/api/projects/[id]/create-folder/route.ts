import { NextRequest, NextResponse } from 'next/server'
import { mkdir } from 'fs/promises'
import { join } from 'path'
import { getDatabase } from '@/lib/database'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    console.log('🔍 Creating folder for project:', id)
    
    // Get project details from database
    const client = await getDatabase()
    let project
    
    try {
      const result = await client.query('SELECT * FROM projects WHERE id = $1', [id])
      if (result.rows.length === 0) {
        return NextResponse.json({ success: false, error: 'Project not found' }, { status: 404 })
      }
      project = result.rows[0]
    } finally {
      client.release()
    }
    
    // Create folder path: uploads/projects/project-{id}-{sanitized-name}
    const sanitizedName = project.name.replace(/[^a-zA-Z0-9\-_]/g, '-').toLowerCase()
    const folderName = `project-${id}-${sanitizedName}`
    const uploadsDir = join(process.cwd(), 'uploads')
    const projectsDir = join(uploadsDir, 'projects')
    const projectDir = join(projectsDir, folderName)
    
    // Create directories if they don't exist
    await mkdir(projectsDir, { recursive: true })
    await mkdir(projectDir, { recursive: true })
    
    console.log('✅ Created project folder:', projectDir)
    
    return NextResponse.json({
      success: true,
      folder_path: `/uploads/projects/${folderName}`,
      folder_name: folderName,
      project_id: id
    })
    
  } catch (error) {
    console.error('❌ Error creating project folder:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create folder'
    }, { status: 500 })
  }
}
