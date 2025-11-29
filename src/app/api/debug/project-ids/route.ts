import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/database'

export async function GET() {
  try {
    const client = await getDatabase()
    
    try {
      // Get all projects to see their actual IDs
      const projectsResult = await client.query(`
        SELECT id, customer_id, name, folder_number, quote_id
        FROM projects 
        ORDER BY created_at ASC
        LIMIT 10
      `)
      
      // Get all quotes to see their IDs too
      const quotesResult = await client.query(`
        SELECT id, quote_id, customer_id, name, status
        FROM quotes 
        ORDER BY created_at ASC
        LIMIT 10
      `)
      
      return NextResponse.json({
        success: true,
        projects: projectsResult.rows,
        quotes: quotesResult.rows,
        projectCount: projectsResult.rows.length,
        quoteCount: quotesResult.rows.length
      })
      
    } finally {
      client.release()
    }
    
  } catch (error) {
    console.error('Debug error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Debug failed'
    }, { status: 500 })
  }
}
