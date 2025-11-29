import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/database'

export async function POST() {
  const results = {
    projects_updated: false,
    invoices_updated: false,
    errors: [] as string[]
  }

  try {
    const client = await getDatabase()
    
    try {
      console.log('🔧 Setting up database for package/features and deposit system...')
      
      // 1. Update Projects table
      try {
        // Check and add projects columns
        const projectColumns = [
          { name: 'selected_package', type: 'JSONB' },
          { name: 'features', type: 'JSONB' },
          { name: 'complexity', type: 'VARCHAR(50)' },
          { name: 'rush_delivery', type: 'VARCHAR(50)' },
          { name: 'folder_number', type: 'VARCHAR(10)' }
        ]
        
        for (const col of projectColumns) {
          const exists = await client.query(`
            SELECT EXISTS (
              SELECT FROM information_schema.columns 
              WHERE table_schema = 'public' 
              AND table_name = 'projects' 
              AND column_name = $1
            )
          `, [col.name])
          
          if (!exists.rows[0].exists) {
            await client.query(`ALTER TABLE projects ADD COLUMN ${col.name} ${col.type}`)
            console.log(`✅ Added ${col.name} to projects table`)
          } else {
            console.log(`ℹ️ Column ${col.name} already exists in projects table`)
          }
        }
        
        results.projects_updated = true
      } catch (projectError) {
        console.error('❌ Error updating projects table:', projectError)
        const errorMessage = projectError instanceof Error ? projectError.message : String(projectError)
        results.errors.push(`Projects: ${errorMessage}`)
      }
      
      // 2. Update Invoices table
      try {
        // Check and add invoice columns
        const invoiceColumns = [
          { name: 'deposit_amount', type: 'DECIMAL(10,2) DEFAULT 0' },
          { name: 'deposit_required', type: 'BOOLEAN DEFAULT false' },
          { name: 'deposit_paid', type: 'BOOLEAN DEFAULT false' }
        ]
        
        for (const col of invoiceColumns) {
          const exists = await client.query(`
            SELECT EXISTS (
              SELECT FROM information_schema.columns 
              WHERE table_schema = 'public' 
              AND table_name = 'invoices' 
              AND column_name = $1
            )
          `, [col.name])
          
          if (!exists.rows[0].exists) {
            await client.query(`ALTER TABLE invoices ADD COLUMN ${col.name} ${col.type}`)
            console.log(`✅ Added ${col.name} to invoices table`)
          } else {
            console.log(`ℹ️ Column ${col.name} already exists in invoices table`)
          }
        }
        
        results.invoices_updated = true
      } catch (invoiceError) {
        console.error('❌ Error updating invoices table:', invoiceError)
        const errorMessage = invoiceError instanceof Error ? invoiceError.message : String(invoiceError)
        results.errors.push(`Invoices: ${errorMessage}`)
      }
      
      // 3. Check current data
      const projectCount = await client.query('SELECT COUNT(*) as count FROM projects')
      const invoiceCount = await client.query('SELECT COUNT(*) as count FROM invoices')
      const quoteCount = await client.query('SELECT COUNT(*) as count FROM quotes')
      
      console.log(`📊 Current data: ${projectCount.rows[0].count} projects, ${invoiceCount.rows[0].count} invoices, ${quoteCount.rows[0].count} quotes`)
      
      return NextResponse.json({
        success: true,
        message: 'Database setup completed successfully',
        results: {
          ...results,
          data_counts: {
            projects: parseInt(projectCount.rows[0].count),
            invoices: parseInt(invoiceCount.rows[0].count),
            quotes: parseInt(quoteCount.rows[0].count)
          }
        }
      })
      
    } finally {
      client.release()
    }
    
  } catch (error) {
    console.error('❌ Database setup failed:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      results
    }, { status: 500 })
  }
}
