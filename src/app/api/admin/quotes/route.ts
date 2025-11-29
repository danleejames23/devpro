import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    const client = await getDatabase()
    try {
      const tableExists = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' AND table_name = 'quotes'
        )
      `)
      
      if (!tableExists.rows[0].exists) {
        return NextResponse.json({ success: false, error: 'Quotes table does not exist', quotes: [] })
      }
      
      // Ensure project_name column exists (safe, idempotent)
      try {
        await client.query(`ALTER TABLE quotes ADD COLUMN IF NOT EXISTS project_name TEXT`)
      } catch (e) {
        console.warn('⚠️ Could not ensure quotes.project_name column:', e)
      }

      const result = await client.query(`
        SELECT id, quote_id, customer_id, name, email, company, project_name, description, 
               estimated_cost, estimated_timeline, status, rush_delivery, selected_package, created_at, updated_at
        FROM quotes ORDER BY created_at DESC
      `)
      
      const quotes = result.rows.map(row => {
        const pkg = typeof row.selected_package === 'string' ? JSON.parse(row.selected_package) : row.selected_package
        const pkgFeatures = Array.isArray(pkg?.features) ? pkg.features
          : Array.isArray(pkg?.services) ? pkg.services
          : Array.isArray(pkg?.includes) ? pkg.includes
          : Array.isArray(pkg?.items) ? pkg.items
          : []
        return {
          id: row.quote_id || row.id,
          quote_id: row.quote_id,
          customer_id: row.customer_id,
          customer_name: row.name,
          name: row.name,
          email: row.email,
          company: row.company,
          project_name: row.project_name,
          description: row.description,
          estimated_cost: row.estimated_cost,
          estimated_timeline: row.estimated_timeline,
          status: row.status,
          rush_delivery: row.rush_delivery,
          selected_package: pkg,
          selectedFeatures: pkgFeatures,
          services: pkgFeatures,
          complexity: pkg?.complexity,
          created_at: row.created_at,
          updated_at: row.updated_at
        }
      })
      
      return NextResponse.json({ success: true, quotes })
    } finally {
      client.release()
    }
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch quotes', quotes: [] }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, name, email, company, description, estimated_cost, estimated_timeline, status } = body
    const client = await getDatabase()
    
    try {
      const result = await client.query(`
        UPDATE quotes SET 
          name = COALESCE($1, name),
          email = COALESCE($2, email),
          company = COALESCE($3, company),
          description = COALESCE($4, description),
          estimated_cost = COALESCE($5, estimated_cost),
          estimated_timeline = COALESCE($6, estimated_timeline),
          status = COALESCE($7, status),
          updated_at = CURRENT_TIMESTAMP
        WHERE quote_id::text = $8 OR id::text = $8
        RETURNING *
      `, [name, email, company, description, estimated_cost, estimated_timeline, status, id])
      
      if (result.rows.length === 0) {
        return NextResponse.json({ success: false, error: 'Quote not found' }, { status: 404 })
      }
      
      return NextResponse.json({ success: true, quote: result.rows[0] })
    } finally {
      client.release()
    }
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update quote' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ success: false, error: 'Quote ID is required' }, { status: 400 })
    }
    
    const client = await getDatabase()
    try {
      const result = await client.query('DELETE FROM quotes WHERE quote_id::text = $1 OR id::text = $1 RETURNING *', [id])
      
      if (result.rows.length === 0) {
        return NextResponse.json({ success: false, error: 'Quote not found' }, { status: 404 })
      }
      
      return NextResponse.json({ success: true, message: 'Quote deleted successfully' })
    } finally {
      client.release()
    }
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete quote' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { customer_id, description, estimated_cost, estimated_timeline, admin_notes } = body
    const client = await getDatabase()
    
    try {
      const result = await client.query(`
        INSERT INTO quotes (customer_id, description, estimated_cost, estimated_timeline, status, admin_notes, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING *
      `, [customer_id, description, estimated_cost, estimated_timeline, 'quoted', admin_notes])
      
      return NextResponse.json({ success: true, quote: result.rows[0] })
    } finally {
      client.release()
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create quote' }, { status: 500 })
  }
}
