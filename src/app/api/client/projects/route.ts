import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    // Get customer ID from authentication (for now, we'll use query param)
    const { searchParams } = new URL(request.url)
    const customer_id = searchParams.get('customer_id')
    
    if (!customer_id) {
      return NextResponse.json(
        { success: false, error: 'Customer ID is required' },
        { status: 400 }
      )
    }
    
    const client = await getDatabase()
    try {
      let result
      try {
        result = await client.query(`
          SELECT id, customer_id, name, client, description, status, progress,
                 start_date, end_date, budget, quote_id, selected_package, features,
                 complexity, rush_delivery, folder_number, github_url, created_at, updated_at
          FROM projects
          WHERE customer_id::text = $1::text
          ORDER BY created_at DESC
        `, [customer_id])
      } catch (columnError) {
        console.log('Client projects: new columns not found, using basic query')
        result = await client.query(`
          SELECT id, customer_id, name, client, description, status, progress,
                 start_date, end_date, budget, quote_id, created_at, updated_at
          FROM projects
          WHERE customer_id::text = $1::text
          ORDER BY created_at DESC
        `, [customer_id])
      }

      const projects = result.rows.map(row => ({
        ...row,
        selected_package: (row as any).selected_package
          ? (typeof (row as any).selected_package === 'string'
              ? JSON.parse((row as any).selected_package as string)
              : (row as any).selected_package)
          : null,
        features: (row as any).features
          ? (typeof (row as any).features === 'string'
              ? JSON.parse((row as any).features as string)
              : (row as any).features)
          : null,
        folder_number: (row as any).folder_number || null,
        complexity: (row as any).complexity || null,
        rush_delivery: (row as any).rush_delivery || null,
        github_url: (row as any).github_url || null
      }))

      return NextResponse.json({ success: true, projects })
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Error fetching client projects:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch projects' },
      { status: 500 }
    )
  }
}
