import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/database'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    console.log('🔍 Getting files for project:', id)
    
    const client = await getDatabase()
    
    try {
      // Ensure project_files table exists early exit if not
      const tableExists = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' AND table_name = 'project_files'
        )
      `)

      if (!tableExists.rows[0].exists) {
        return NextResponse.json({ success: true, files: [] })
      }

      // Get the project's folder number so we can scope to its folder path
      let folderNumber: string | null = null
      try {
        const projRes = await client.query('SELECT folder_number FROM projects WHERE id = $1', [id])
        if (projRes.rows.length > 0) {
          folderNumber = projRes.rows[0].folder_number || null
        }
        // If project has no folder_number yet, derive one like in upload route
        if (!folderNumber) {
          const countResult = await client.query('SELECT COUNT(*) as count FROM projects WHERE id <= $1', [id])
          folderNumber = countResult.rows[0].count.toString().padStart(3, '0')
          await client.query('UPDATE projects SET folder_number = $1 WHERE id = $2', [folderNumber, id])
        }
      } catch (e) {
        console.warn('⚠️ Could not determine folder_number, will fallback to project_id filter only:', e)
      }

      let rows: any[] = []
      
      // Since projects.id is integer but project_files.project_id is UUID,
      // we need to get the customer_id for this project and use that to find files
      let customerIdForProject = null
      try {
        const projectResult = await client.query('SELECT customer_id FROM projects WHERE id = $1', [id])
        if (projectResult.rows.length > 0) {
          customerIdForProject = projectResult.rows[0].customer_id
        }
      } catch (e) {
        console.warn('Could not get customer_id for project:', e)
      }
      
      // Query using the customer-based mapping approach
      try {
        if (customerIdForProject) {
          // Use customer_id as project_id (our mapping approach)
          if (folderNumber) {
            // Try to scope by folder path if available
            const result = await client.query(`
              SELECT * FROM project_files 
              WHERE project_id = $1 
                AND (file_path LIKE $2 OR file_path IS NULL)
              ORDER BY COALESCE(uploaded_at, created_at, updated_at, CURRENT_TIMESTAMP) DESC
            `, [customerIdForProject, `/uploads/projects/${folderNumber}/%`])
            rows = result.rows
            
            // If no results with folder scoping, try without folder filter
            if (rows.length === 0) {
              const fallbackResult = await client.query(`
                SELECT * FROM project_files 
                WHERE project_id = $1
                ORDER BY COALESCE(uploaded_at, created_at, updated_at, CURRENT_TIMESTAMP) DESC
              `, [customerIdForProject])
              rows = fallbackResult.rows
            }
          } else {
            // No folder number, just query by customer_id as project_id
            const result = await client.query(`
              SELECT * FROM project_files 
              WHERE project_id = $1
              ORDER BY COALESCE(uploaded_at, created_at, updated_at, CURRENT_TIMESTAMP) DESC
            `, [customerIdForProject])
            rows = result.rows
          }
        }
        
        console.log(`📁 Found ${rows.length} files for project ${id} (customer: ${customerIdForProject}, folder: ${folderNumber})`)
        
      } catch (queryErr) {
        console.log('Query failed:', queryErr instanceof Error ? queryErr.message : String(queryErr))
        rows = []
      }

      const files = rows.map((row: any) => ({
        id: row.id,
        name: row.name,
        original_name: row.original_name || row.name,
        path: row.file_path || row.download_url || null,
        size: row.size ?? 0,
        type: row.mime_type || 'application/octet-stream',
        uploaded_by_admin: row.uploaded_by_admin ?? false,
        created_at: row.uploaded_at || row.created_at || new Date().toISOString(),
        download_url: `/api/projects/${id}/download/${row.id}`
      }))

      return NextResponse.json({ success: true, files })
      
    } finally {
      client.release()
    }
    
  } catch (error) {
    console.error('❌ Error getting project files:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get files'
    }, { status: 500 })
  }
}
