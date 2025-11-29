import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/database'
import { mkdir } from 'fs/promises'
import { join } from 'path'

export async function GET() {
  try {
    const client = await getDatabase()
    try {
      // First, check if we need to create projects from approved quotes
      const projectCount = await client.query('SELECT COUNT(*) FROM projects')
      console.log('📊 Current project count:', projectCount.rows[0].count)
      
      if (parseInt(projectCount.rows[0].count) === 0) {
        console.log('📝 No projects found, creating from approved quotes...')
        // Get approved quotes
        const quotesResult = await client.query(`
          SELECT q.*, c.first_name, c.last_name, CONCAT(c.first_name, ' ', c.last_name) as customer_name
          FROM quotes q 
          LEFT JOIN customers c ON q.customer_id::text = c.id::text
          WHERE q.status IN ('approved', 'accepted', 'in_progress', 'completed')
        `)
        
        console.log(`📋 Found ${quotesResult.rows.length} approved quotes for projects`)
        
        for (const quote of quotesResult.rows) {
          const projectName = quote.selected_package?.name || quote.description?.substring(0, 50) || 'Web Development Project'
          const budget = parseFloat(quote.estimated_cost) || 0
          
          await client.query(`
            INSERT INTO projects (
              customer_id, name, client, description, status, progress, budget,
              quote_id, start_date, created_at, updated_at
            ) VALUES (
              $1, $2, $3, $4, 'pending', 0, $5,
              $6, CURRENT_DATE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
            )
            ON CONFLICT DO NOTHING
          `, [
            quote.customer_id,
            projectName,
            quote.customer_name || quote.name || 'Client',
            quote.description || 'Project from approved quote',
            budget,
            quote.quote_id || quote.id?.toString()
          ])
        }
        console.log('✅ Projects created from quotes')
      }
      
      // First try with all columns, fall back to basic columns if new ones don't exist
      let result
      try {
        result = await client.query(`
          SELECT id, customer_id, name, client, description, status, progress, 
                 start_date, end_date, budget, quote_id, selected_package, features, 
                 complexity, rush_delivery, folder_number, github_url, created_at, updated_at 
          FROM projects 
          ORDER BY created_at DESC
        `)
      } catch (columnError) {
        console.log('New columns not found, using basic query')
        // Fall back to basic columns
        result = await client.query(`
          SELECT id, customer_id, name, client, description, status, progress, 
                 start_date, end_date, budget, quote_id, github_url, created_at, updated_at 
          FROM projects 
          ORDER BY created_at DESC
        `)
      }
      
      // Parse JSON fields safely
      const projects = result.rows.map(row => ({
        ...row,
        selected_package: row.selected_package ? (typeof row.selected_package === 'string' ? JSON.parse(row.selected_package) : row.selected_package) : null,
        features: row.features ? (typeof row.features === 'string' ? JSON.parse(row.features) : row.features) : null,
        folder_number: row.folder_number || null,
        complexity: row.complexity || null,
        rush_delivery: row.rush_delivery || null,
        github_url: row.github_url || null
      }))
      
      console.log(`✅ Found ${projects.length} projects`)
      return NextResponse.json({ success: true, projects: projects })
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Error fetching projects:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch projects', projects: [] }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      name, client, customer_id, description, status, progress, budget, 
      start_date, end_date, quote_id, selected_package, features, complexity, rush_delivery 
    } = body
    const database = await getDatabase()
    
    let newProject
    try {
      const result = await database.query(`
        INSERT INTO projects (
          name, client, customer_id, description, status, progress, budget, 
          start_date, end_date, quote_id, selected_package, features, complexity, 
          rush_delivery, created_at, updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING *
      `, [
        name, client, customer_id, description, status, progress, budget, 
        start_date, end_date, quote_id, 
        selected_package ? JSON.stringify(selected_package) : null,
        features ? JSON.stringify(features) : null,
        complexity, rush_delivery
      ])
      
      newProject = result.rows[0]
      
      // Create project folder automatically with sequential numbering
      try {
        // Get the next folder number by counting existing projects
        const countResult = await database.query('SELECT COUNT(*) as count FROM projects')
        const projectCount = parseInt(countResult.rows[0].count)
        const folderNumber = projectCount.toString().padStart(3, '0') // 001, 002, etc.
        
        const uploadsDir = join(process.cwd(), 'uploads')
        const projectsDir = join(uploadsDir, 'projects')
        const projectDir = join(projectsDir, folderNumber)
        
        await mkdir(projectsDir, { recursive: true })
        await mkdir(projectDir, { recursive: true })
        
        // Update project with folder number
        await database.query(
          'UPDATE projects SET folder_number = $1 WHERE id = $2',
          [folderNumber, newProject.id]
        )
        
        newProject.folder_number = folderNumber
        console.log('✅ Created project folder:', projectDir, 'with number:', folderNumber)
      } catch (folderError) {
        console.warn('⚠️ Failed to create project folder:', folderError)
        // Don't fail the project creation if folder creation fails
      }
      
      return NextResponse.json({ success: true, project: newProject })
    } finally {
      database.release()
    }
  } catch (error) {
    console.error('Error creating project:', error)
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 })
  }
}
