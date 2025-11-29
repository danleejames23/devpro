import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/database'

export async function POST() {
  const results = []
  
  try {
    const client = await getDatabase()
    
    try {
      console.log('🔧 Setting up all required database columns...')
      
      // 1. Projects table columns
      const projectColumns = [
        'selected_package JSONB',
        'features JSONB', 
        'complexity VARCHAR(50)',
        'rush_delivery VARCHAR(50)',
        'folder_number VARCHAR(10)'
      ]
      
      for (const column of projectColumns) {
        try {
          const columnName = column.split(' ')[0]
          const exists = await client.query(`
            SELECT column_name FROM information_schema.columns 
            WHERE table_name = 'projects' AND column_name = $1
          `, [columnName])
          
          if (exists.rows.length === 0) {
            await client.query(`ALTER TABLE projects ADD COLUMN ${column}`)
            results.push(`✅ Added ${columnName} to projects`)
            console.log(`✅ Added ${columnName} to projects`)
          } else {
            results.push(`ℹ️ ${columnName} already exists in projects`)
          }
        } catch (error) {
          results.push(`❌ Error adding ${column}: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
      }
      
      // 2. Invoices table columns  
      const invoiceColumns = [
        'deposit_amount DECIMAL(10,2) DEFAULT 0',
        'deposit_required BOOLEAN DEFAULT false',
        'deposit_paid BOOLEAN DEFAULT false'
      ]
      
      for (const column of invoiceColumns) {
        try {
          const columnName = column.split(' ')[0]
          const exists = await client.query(`
            SELECT column_name FROM information_schema.columns 
            WHERE table_name = 'invoices' AND column_name = $1
          `, [columnName])
          
          if (exists.rows.length === 0) {
            await client.query(`ALTER TABLE invoices ADD COLUMN ${column}`)
            results.push(`✅ Added ${columnName} to invoices`)
            console.log(`✅ Added ${columnName} to invoices`)
          } else {
            results.push(`ℹ️ ${columnName} already exists in invoices`)
          }
        } catch (error) {
          results.push(`❌ Error adding ${column}: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
      }
      
      // 3. Check current data counts
      const projectCount = await client.query('SELECT COUNT(*) FROM projects')
      const invoiceCount = await client.query('SELECT COUNT(*) FROM invoices') 
      const quoteCount = await client.query('SELECT COUNT(*) FROM quotes')
      
      results.push(`📊 Data: ${projectCount.rows[0].count} projects, ${invoiceCount.rows[0].count} invoices, ${quoteCount.rows[0].count} quotes`)
      
      // 4. Test a sample quote to see if it has package data
      const sampleQuote = await client.query('SELECT selected_package FROM quotes LIMIT 1')
      if (sampleQuote.rows.length > 0) {
        const hasPackage = !!sampleQuote.rows[0].selected_package
        results.push(`📦 Sample quote has package data: ${hasPackage}`)
      }
      
      return NextResponse.json({
        success: true,
        message: 'Database setup completed',
        results: results
      })
      
    } finally {
      client.release()
    }
    
  } catch (error) {
    console.error('❌ Setup failed:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      results: results
    }, { status: 500 })
  }
}

export async function GET() {
  return POST()
}
