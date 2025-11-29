import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/database'

export async function GET() {
  return await fixProjectFileRelationships()
}

export async function POST() {
  return await fixProjectFileRelationships()
}

async function fixProjectFileRelationships() {
  try {
    const client = await getDatabase()
    
    try {
      // Since projects.id is integer but project_files.project_id is UUID,
      // we need to create a mapping. Let's use a simple approach:
      // Associate files with projects based on customer_id and creation time
      
      // Get all projects with their customer_ids
      const projectsResult = await client.query(`
        SELECT id, customer_id, folder_number, name, created_at
        FROM projects 
        ORDER BY created_at ASC
      `)
      
      // Get all files that don't have a project_id
      const orphanFilesResult = await client.query(`
        SELECT id, customer_id, name, type, uploaded_at
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
      
      // Create a UUID mapping for each project based on customer
      const projectUuidMap = new Map()
      
      // For each customer, create a consistent UUID for their first project
      for (const project of projects) {
        const customerId = project.customer_id
        if (!projectUuidMap.has(customerId)) {
          // Generate a deterministic UUID based on customer_id and project_id
          // We'll use the customer_id as the project_id for files
          projectUuidMap.set(customerId, customerId)
        }
      }
      
      // Now associate files with their customer's "project UUID" (which is their customer_id)
      for (const file of orphanFiles) {
        const projectUuid = projectUuidMap.get(file.customer_id)
        const matchingProject = projects.find(p => p.customer_id === file.customer_id)
        
        if (projectUuid && matchingProject) {
          await client.query(`
            UPDATE project_files 
            SET project_id = $1, 
                file_path = $2,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $3
          `, [
            projectUuid, // Use customer_id as project_id (both are UUIDs)
            `/uploads/projects/${matchingProject.folder_number || '001'}/${file.name}`,
            file.id
          ])
          
          associatedCount++
          associations.push({
            fileName: file.name,
            projectId: matchingProject.id,
            projectUuid: projectUuid,
            projectName: matchingProject.name,
            folderNumber: matchingProject.folder_number || '001'
          })
        }
      }
      
      return NextResponse.json({
        success: true,
        message: `Associated ${associatedCount} files with projects using customer-based mapping`,
        totalProjects: projects.length,
        totalOrphanFiles: orphanFiles.length,
        associatedFiles: associatedCount,
        associations: associations,
        projectUuidMap: Object.fromEntries(projectUuidMap)
      })
      
    } finally {
      client.release()
    }
    
  } catch (error) {
    console.error('❌ Error fixing project file relationships:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fix relationships'
    }, { status: 500 })
  }
}
