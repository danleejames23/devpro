import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import { createProjectFile } from '@/lib/database'

// File paths
const UPLOAD_DIR = path.join(process.cwd(), 'uploads')

// Ensure upload directory exists
async function ensureUploadDir() {
  try {
    await fs.access(UPLOAD_DIR)
  } catch {
    await fs.mkdir(UPLOAD_DIR, { recursive: true })
  }
}

function generateFileId(): string {
  return `FILE-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

// POST /api/files/upload - Upload files
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const files = formData.getAll('files') as File[]
    const customerId = formData.get('customerId') as string

    if (!customerId) {
      return NextResponse.json(
        { success: false, error: 'Customer ID is required' },
        { status: 400 }
      )
    }

    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No files provided' },
        { status: 400 }
      )
    }

    await ensureUploadDir()
    
    const uploadedFiles = []

    for (const file of files) {
      // Generate unique filename
      const fileExtension = path.extname(file.name)
      const fileName = `${generateFileId()}${fileExtension}`
      const filePath = path.join(UPLOAD_DIR, fileName)

      // Save file to disk
      const buffer = Buffer.from(await file.arrayBuffer())
      await fs.writeFile(filePath, buffer)

      // Create file record in database
      const fileRecord = await createProjectFile({
        customer_id: customerId,
        name: file.name,
        type: 'file',
        size: file.size,
        mime_type: file.type,
        is_shared: false,
        download_url: `/api/files/download?fileId=${generateFileId()}`
      })

      uploadedFiles.push({
        id: fileRecord.id,
        name: fileRecord.name,
        size: fileRecord.size,
        mimeType: fileRecord.mime_type
      })
    }

    return NextResponse.json({
      success: true,
      message: `${files.length} file(s) uploaded successfully`,
      files: uploadedFiles
    })

  } catch (error) {
    console.error('Error uploading files:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to upload files' },
      { status: 500 }
    )
  }
}
