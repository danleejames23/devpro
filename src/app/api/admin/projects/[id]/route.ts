import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/database'

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    console.log('🔍 Updating project:', id)
    const body = await request.json()
    console.log('📝 Request body:', body)
    const { name, client, description, status, progress, budget, start_date, end_date, github_url } = body
    console.log('🔗 GitHub URL to save:', github_url)
    
    const database = await getDatabase()
    
    try {
      // Update project
      const result = await database.query(`
        UPDATE projects 
        SET 
          name = $1,
          client = $2,
          description = $3,
          status = $4,
          progress = $5,
          budget = $6,
          start_date = $7,
          end_date = $8,
          github_url = COALESCE($9, github_url),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $10
        RETURNING *
      `, [name, client, description, status, progress, budget, start_date, end_date, github_url, id])
      
      if (result.rows.length === 0) {
        return NextResponse.json({
          success: false,
          error: 'Project not found'
        }, { status: 404 })
      }
      
      console.log('✅ Project updated successfully:', result.rows[0])
      
      return NextResponse.json({
        success: true,
        project: result.rows[0]
      })
    } finally {
      database.release()
    }
  } catch (error) {
    console.error('❌ Error updating project:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update project'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    console.log('🔍 Getting project:', id)
    const database = await getDatabase()
    
    try {
      // Get single project
      const result = await database.query(`
        SELECT * FROM projects WHERE id = $1
      `, [id])
      
      if (result.rows.length === 0) {
        return NextResponse.json({
          success: false,
          error: 'Project not found'
        }, { status: 404 })
      }
      
      return NextResponse.json({
        success: true,
        project: result.rows[0]
      })
    } finally {
      database.release()
    }
  } catch (error) {
    console.error('❌ Error getting project:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get project'
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    console.log('🔍 Deleting project:', id)
    const database = await getDatabase()
    
    try {
      // Delete project
      const result = await database.query(`
        DELETE FROM projects WHERE id = $1 RETURNING *
      `, [id])
      
      if (result.rows.length === 0) {
        return NextResponse.json({
          success: false,
          error: 'Project not found'
        }, { status: 404 })
      }
      
      console.log('✅ Project deleted successfully')
      
      return NextResponse.json({
        success: true,
        message: 'Project deleted successfully'
      })
    } finally {
      database.release()
    }
  } catch (error) {
    console.error('❌ Error deleting project:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete project'
    }, { status: 500 })
  }
}
