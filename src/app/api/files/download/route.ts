import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

// File paths
const FILES_FILE = path.join(process.cwd(), 'data', 'project-files.json')
const UPLOAD_DIR = path.join(process.cwd(), 'uploads')

// Ensure data directory exists
async function ensureDataDir() {
  const dataDir = path.join(process.cwd(), 'data')
  try {
    await fs.access(dataDir)
  } catch {
    await fs.mkdir(dataDir, { recursive: true })
  }
}

// Generic file operations
async function readJsonFile<T>(filePath: string, defaultValue: T): Promise<T> {
  try {
    await ensureDataDir()
    const data = await fs.readFile(filePath, 'utf-8')
    return JSON.parse(data)
  } catch {
    return defaultValue
  }
}

// GET /api/files/download - Download file
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const fileId = searchParams.get('fileId')

    if (!fileId) {
      return NextResponse.json(
        { success: false, error: 'File ID is required' },
        { status: 400 }
      )
    }

    // Load existing files
    const files: any[] = await readJsonFile(FILES_FILE, [])
    
    // Find the file
    const fileRecord = files.find(file => file.id === fileId && file.type === 'file')
    
    if (!fileRecord) {
      return NextResponse.json(
        { success: false, error: 'File not found' },
        { status: 404 }
      )
    }

    // Find the actual file in uploads directory
    // Since we store files with generated names, we need to find the matching file
    try {
      const uploadFiles = await fs.readdir(UPLOAD_DIR)
      const uploadedFile = uploadFiles.find(uploadFileName => 
        uploadFileName.includes(fileRecord.id.split('-')[1]) // Match by timestamp part
      )

      if (!uploadedFile) {
        return NextResponse.json(
          { success: false, error: 'File not found on disk' },
          { status: 404 }
        )
      }

      const filePath = path.join(UPLOAD_DIR, uploadedFile)
      const fileBuffer = await fs.readFile(filePath)

      // Return the file with appropriate headers
      return new NextResponse(fileBuffer, {
        headers: {
          'Content-Type': fileRecord.mimeType || 'application/octet-stream',
          'Content-Disposition': `attachment; filename="${fileRecord.name}"`,
          'Content-Length': fileBuffer.length.toString(),
        },
      })

    } catch (fileError) {
      console.error('Error reading file from disk:', fileError)
      return NextResponse.json(
        { success: false, error: 'Failed to read file' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Error downloading file:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to download file' },
      { status: 500 }
    )
  }
}
