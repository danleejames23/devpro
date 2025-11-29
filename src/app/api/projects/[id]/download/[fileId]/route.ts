import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { join } from 'path'
import { getDatabase } from '@/lib/database'

export async function GET(
  request: NextRequest, 
  { params }: { params: Promise<{ id: string; fileId: string }> }
) {
  try {
    const { id, fileId } = await params
    console.log('🔍 Downloading file:', fileId, 'for project:', id)
    
    const client = await getDatabase()
    let fileRecord
    
    try {
      const result = await client.query(`
        SELECT * FROM project_files 
        WHERE id = $1 AND project_id = $2
      `, [fileId, id])
      
      if (result.rows.length === 0) {
        return NextResponse.json({ error: 'File not found' }, { status: 404 })
      }
      
      fileRecord = result.rows[0]
    } finally {
      client.release()
    }
    
    // Read file from disk
    const filePath = join(process.cwd(), fileRecord.file_path.replace(/^\//, ''))
    
    try {
      const fileBuffer = await readFile(filePath)
      
      // Return file with proper headers
      return new NextResponse(fileBuffer, {
        headers: {
          'Content-Type': fileRecord.file_type || 'application/octet-stream',
          'Content-Disposition': `attachment; filename="${fileRecord.original_name}"`,
          'Content-Length': fileBuffer.length.toString(),
        },
      })
    } catch (fileError) {
      console.error('❌ File not found on disk:', filePath)
      return NextResponse.json({ error: 'File not found on disk' }, { status: 404 })
    }
    
  } catch (error) {
    console.error('❌ Error downloading file:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Failed to download file'
    }, { status: 500 })
  }
}
