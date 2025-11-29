import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/database'

export async function GET() {
  const results = {
    database_connection: false,
    tables_exist: {} as Record<string, boolean>,
    columns_exist: {} as Record<string, Record<string, boolean>>,
    sample_data: {} as Record<string, any>,
    errors: [] as string[]
  }

  try {
    const client = await getDatabase()
    results.database_connection = true
    
    try {
      // 1. Check if tables exist
      const tables = ['projects', 'invoices', 'quotes']
      for (const table of tables) {
        const tableExists = await client.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_name = $1
          )
        `, [table])
        results.tables_exist[table] = tableExists.rows[0].exists
      }
      
      // 2. Check if new columns exist
      const projectColumns = ['selected_package', 'features', 'complexity', 'rush_delivery', 'folder_number']
      const invoiceColumns = ['deposit_amount', 'deposit_required', 'deposit_paid']
      
      results.columns_exist.projects = {}
      for (const col of projectColumns) {
        const exists = await client.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name = 'projects' AND column_name = $1
          )
        `, [col])
        results.columns_exist.projects[col] = exists.rows[0].exists
      }
      
      results.columns_exist.invoices = {}
      for (const col of invoiceColumns) {
        const exists = await client.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name = 'invoices' AND column_name = $1
          )
        `, [col])
        results.columns_exist.invoices[col] = exists.rows[0].exists
      }
      
      // 3. Get sample data
      if (results.tables_exist.quotes) {
        const quotes = await client.query('SELECT id, selected_package, status FROM quotes LIMIT 3')
        results.sample_data.quotes = quotes.rows.map(row => ({
          id: row.id,
          has_package: !!row.selected_package,
          package_type: typeof row.selected_package,
          status: row.status
        }))
      }
      
      if (results.tables_exist.projects) {
        const projects = await client.query('SELECT id, name, selected_package, features FROM projects LIMIT 3')
        results.sample_data.projects = projects.rows.map(row => ({
          id: row.id,
          name: row.name,
          has_package: !!row.selected_package,
          has_features: !!row.features
        }))
      }
      
      if (results.tables_exist.invoices) {
        const invoices = await client.query('SELECT id, deposit_required, deposit_amount FROM invoices LIMIT 3')
        results.sample_data.invoices = invoices.rows.map(row => ({
          id: row.id,
          deposit_required: row.deposit_required,
          deposit_amount: row.deposit_amount
        }))
      }
      
      // 4. Count records
      const counts: Record<string, number> = {}
      for (const table of tables) {
        if (results.tables_exist[table]) {
          const count = await client.query(`SELECT COUNT(*) FROM ${table}`)
          counts[table] = parseInt(count.rows[0].count)
        }
      }
      results.sample_data.counts = counts
      
    } finally {
      client.release()
    }
    
    return NextResponse.json({
      success: true,
      debug_results: results
    })
    
  } catch (error) {
    results.errors.push(error instanceof Error ? error.message : 'Unknown error')
    return NextResponse.json({
      success: false,
      debug_results: results,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
