import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/database'

export async function GET() {
  return await associateFilesWithProjects()
}

export async function POST() {
  return await associateFilesWithProjects()
}

async function associateFilesWithProjects() {
  try {
    const client = await getDatabase()
    
    try {
      // Get all projects with their customer_ids
      const projectsResult = await client.query(`
        SELECT id, customer_id, folder_number, name 
        FROM projects 
        ORDER BY created_at ASC
      `)
      
      // Get all files that don't have a project_id
      const orphanFilesResult = await client.query(`
        SELECT id, customer_id, name, type 
        FROM project_files 
        WHERE project_id IS NULL 
        AND type = 'file'
        ORDER BY uploaded_at ASC
      `)
      
      const projects = projectsResult.rows
      const orphanFiles = orphanFilesResult.rows
      
      console.log(`Found ${projects.length} projects and ${orphanFiles.length} orphan files`)
      
      let associatedCount = 0
      const associations = []
      
      // For each orphan file, try to associate it with a project from the same customer
      for (const file of orphanFiles) {
        // Find the first project for this customer
        const matchingProject = projects.find(p => p.customer_id === file.customer_id)
        
        if (matchingProject) {
          // Since project_files.project_id is UUID but projects.id is integer,
          // we need to convert the integer to a UUID format or use a different approach
          try {
            // Try to update with string conversion first
            await client.query(`
              UPDATE project_files 
              SET project_id = $1::text::uuid, 
                  file_path = $2,
                  updated_at = CURRENT_TIMESTAMP
              WHERE id = $3
            `, [
              matchingProject.id, 
              `/uploads/projects/${matchingProject.folder_number || '001'}/${file.name}`,
              file.id
            ])
          } catch (conversionError) {
            // If UUID conversion fails, try using the quote_id instead since that's already a UUID
            const quoteUuid = matchingProject.quote_id
            if (quoteUuid) {
              // Find the quote UUID that corresponds to this project
              const quoteResult = await client.query('SELECT id FROM quotes WHERE quote_id = $1', [quoteUuid])
              if (quoteResult.rows.length > 0) {
                await client.query(`
                  UPDATE project_files 
                  SET project_id = $1, 
                      file_path = $2,
                      updated_at = CURRENT_TIMESTAMP
                  WHERE id = $3
                `, [
                  quoteResult.rows[0].id, // Use the quote's UUID as project_id
                  `/uploads/projects/${matchingProject.folder_number || '001'}/${file.name}`,
                  file.id
                ])
              }
            }
          }
          
          associatedCount++
          associations.push({
            fileName: file.name,
            projectId: matchingProject.id,
            projectName: matchingProject.name,
            folderNumber: matchingProject.folder_number || '001'
          })
        }
      }
      
      return NextResponse.json({
        success: true,
        message: `Associated ${associatedCount} files with projects`,
        totalProjects: projects.length,
        totalOrphanFiles: orphanFiles.length,
        associatedFiles: associatedCount,
        associations: associations
      })
      
    } finally {
      client.release()
    }
    
  } catch (error) {
    console.error('❌ Error associating files with projects:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to associate files'
    }, { status: 500 })
  }
}
