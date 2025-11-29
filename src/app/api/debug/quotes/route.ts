import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/database'

export async function GET() {
  try {
    const client = await getDatabase()
    
    try {
      // Get a sample of quotes to see their structure
      const result = await client.query(`
        SELECT id, quote_id, name, email, description, estimated_cost, 
               status, selected_package, rush_delivery, created_at
        FROM quotes 
        ORDER BY created_at DESC 
        LIMIT 5
      `)
      
      const quotes = result.rows.map(row => {
        let parsedPackage = null
        try {
          parsedPackage = row.selected_package ? 
            (typeof row.selected_package === 'string' ? JSON.parse(row.selected_package) : row.selected_package) 
            : null
        } catch (e) {
          parsedPackage = row.selected_package
        }
        
        return {
          ...row,
          selected_package_raw: row.selected_package,
          selected_package_parsed: parsedPackage,
          has_package: !!row.selected_package,
          package_type: typeof row.selected_package
        }
      })
      
      return NextResponse.json({
        success: true,
        total_quotes: result.rows.length,
        sample_quotes: quotes,
        debug_info: {
          message: 'This shows the structure of quotes in your database'
        }
      })
      
    } finally {
      client.release()
    }
    
  } catch (error) {
    console.error('❌ Error debugging quotes:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to debug quotes'
    }, { status: 500 })
  }
}
