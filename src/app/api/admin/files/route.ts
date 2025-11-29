import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    // TODO: Add admin authentication check
    
    const { searchParams } = new URL(request.url)
    const customer_id = searchParams.get('customer_id')
    const project_id = searchParams.get('project_id')
    
    const client = await getDatabase()
    
    try {
      // Check if project_files table exists
      const tableCheck = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'project_files'
        )
      `)
      
      if (!tableCheck.rows[0].exists) {
        console.log('Creating project_files table...')
        await client.query(`
          CREATE TABLE project_files (
            id SERIAL PRIMARY KEY,
            customer_id INTEGER,
            project_id INTEGER,
            file_name VARCHAR(255),
            file_size INTEGER,
            file_type VARCHAR(100),
            folder_name VARCHAR(255),
            description TEXT,
            uploaded_by_admin BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `)
        console.log('✅ project_files table created')
      }
      
      // For now, return mock data
      const mockFiles = [
        {
          id: 1,
          customer_id: 1,
          file_name: 'project-requirements.pdf',
          file_size: 1024000,
          file_type: 'application/pdf',
          folder_name: 'Project Documents',
          description: 'Initial project requirements',
          uploaded_by_admin: true,
          created_at: new Date().toISOString(),
          customer_name: 'John Smith'
        },
        {
          id: 2,
          customer_id: 2,
          file_name: 'design-mockup.fig',
          file_size: 2048000,
          file_type: 'application/figma',
          folder_name: 'Design Assets',
          description: 'UI/UX design mockup',
          uploaded_by_admin: true,
          created_at: new Date().toISOString(),
          customer_name: 'Sarah Johnson'
        }
      ]
      
      return NextResponse.json({
        success: true,
        files: mockFiles
      })
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('❌ Error fetching admin files:', error)
    return NextResponse.json(
      { error: 'Failed to fetch files' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // TODO: Add admin authentication check
    
    const formData = await request.formData()
    const files = formData.getAll('files') as File[]
    const customer_id = formData.get('customer_id') as string
    const project_id = formData.get('project_id') as string
    const folder_name = formData.get('folder_name') as string || 'Admin Uploads'
    const description = formData.get('description') as string || ''
    
    if (!customer_id) {
      return NextResponse.json(
        { error: 'Customer ID is required' },
        { status: 400 }
      )
    }
    
    const client = await getDatabase()
    const uploadedFiles = []
    
    try {
      for (const file of files) {
        if (file.size === 0) continue
        
        // Convert file to buffer for storage (in production, use cloud storage)
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        
        // Store file metadata in database
        const result = await client.query(`
          INSERT INTO project_files (
            customer_id, project_id, file_name, file_size, file_type,
            folder_name, description, file_data, uploaded_by_admin,
            created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
          RETURNING id, file_name, file_size, file_type, created_at
        `, [
          customer_id, project_id, file.name, file.size, file.type,
          folder_name, description, buffer, true
        ])
        
        uploadedFiles.push(result.rows[0])
      }
      
      // Send notification to client
      if (uploadedFiles.length > 0) {
        const { notifyProjectUpdate } = await import('@/lib/notification-integration')
        await notifyProjectUpdate(
          customer_id,
          project_id || 'general',
          `Admin uploaded ${uploadedFiles.length} new file(s) to ${folder_name}`
        )
      }
      
      return NextResponse.json({
        success: true,
        files: uploadedFiles,
        message: `${uploadedFiles.length} file(s) uploaded successfully`
      })
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('❌ Error uploading admin files:', error)
    return NextResponse.json(
      { error: 'Failed to upload files' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // TODO: Add admin authentication check
    
    const { searchParams } = new URL(request.url)
    const file_id = searchParams.get('file_id')
    
    if (!file_id) {
      return NextResponse.json(
        { error: 'File ID is required' },
        { status: 400 }
      )
    }
    
    const client = await getDatabase()
    
    try {
      const result = await client.query(
        'DELETE FROM project_files WHERE id = $1 RETURNING customer_id, file_name',
        [file_id]
      )
      
      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: 'File not found' },
          { status: 404 }
        )
      }
      
      return NextResponse.json({
        success: true,
        message: 'File deleted successfully'
      })
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('❌ Error deleting file:', error)
    return NextResponse.json(
      { error: 'Failed to delete file' },
      { status: 500 }
    )
  }
}
