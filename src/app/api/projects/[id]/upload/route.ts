import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { getDatabase } from '@/lib/database'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    console.log('🔍 Uploading file for project:', id)
    
    // Get project details from database
    const client = await getDatabase()
    let project
    
    try {
      const result = await client.query('SELECT * FROM projects WHERE id = $1', [id])
      if (result.rows.length === 0) {
        return NextResponse.json({ success: false, error: 'Project not found' }, { status: 404 })
      }
      project = result.rows[0]
      
      // Ensure project has folder_number
      if (!project.folder_number) {
        const countResult = await client.query('SELECT COUNT(*) as count FROM projects WHERE id <= $1', [id])
        const folderNumber = countResult.rows[0].count.toString().padStart(3, '0')
        await client.query('UPDATE projects SET folder_number = $1 WHERE id = $2', [folderNumber, id])
        project.folder_number = folderNumber
      }
    } finally {
      client.release()
    }
    
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 })
    }
    
    // Create folder path: uploads/projects/{folder_number}
    const folderNumber = project.folder_number
    const uploadsDir = join(process.cwd(), 'uploads')
    const projectsDir = join(uploadsDir, 'projects')
    const projectDir = join(projectsDir, folderNumber)
    
    // Ensure directory exists
    await mkdir(projectDir, { recursive: true })
    
    // Generate unique filename
    const timestamp = Date.now()
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9\-_.]/g, '-')
    const fileName = `${timestamp}-${sanitizedFileName}`
    const filePath = join(projectDir, fileName)
    
    // Write file
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)
    
    // Store file record in database
    // Since projects.id is integer but project_files.project_id is UUID,
    // use the project's customer_id as the project_id
    const fileClient = await getDatabase()
    try {
      await fileClient.query(`
        INSERT INTO project_files (
          project_id, name, original_name, file_path, size, 
          mime_type, uploaded_by_admin, type, uploaded_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP)
      `, [
        project.customer_id, fileName, file.name, `/uploads/projects/${folderNumber}/${fileName}`,
        file.size, file.type, true, 'file'
      ])
    } catch (dbError) {
      // If table doesn't exist, create it
      await fileClient.query(`
        CREATE TABLE IF NOT EXISTS project_files (
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
      
      // Try insert again
      await fileClient.query(`
        INSERT INTO project_files (
          project_id, name, original_name, file_path, size, 
          mime_type, uploaded_by_admin, type, uploaded_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP)
      `, [
        project.customer_id, fileName, file.name, `/uploads/projects/${folderNumber}/${fileName}`,
        file.size, file.type, true, 'file'
      ])
    } finally {
      fileClient.release()
    }
    
    console.log('✅ File uploaded:', fileName)
    
    return NextResponse.json({
      success: true,
      file: {
        name: fileName,
        original_name: file.name,
        path: `/uploads/projects/${folderNumber}/${fileName}`,
        size: file.size,
        type: file.type,
        folder_number: folderNumber
      }
    })
    
  } catch (error) {
    console.error('❌ Error uploading file:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to upload file'
    }, { status: 500 })
  }
}
