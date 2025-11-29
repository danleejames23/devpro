import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const client = await getDatabase()

    try {
      let query = `
        SELECT 
          id,
          inquiry_id,
          name,
          email,
          subject,
          message,
          project_type,
          status,
          priority,
          assigned_to,
          notes,
          follow_up_date,
          contacted_at,
          read_at,
          converted_to_quote_id,
          source,
          ip_address,
          created_at,
          updated_at
        FROM inquiries
      `
      
      const params: any[] = []
      const conditions: string[] = []
      
      if (status) {
        conditions.push(`status = $${params.length + 1}`)
        params.push(status)
      }
      
      if (priority) {
        conditions.push(`priority = $${params.length + 1}`)
        params.push(priority)
      }
      
      if (conditions.length > 0) {
        query += ` WHERE ${conditions.join(' AND ')}`
      }
      
      query += ` ORDER BY 
        CASE WHEN status = 'new' THEN 1 ELSE 2 END,
        CASE priority 
          WHEN 'urgent' THEN 1 
          WHEN 'high' THEN 2 
          WHEN 'normal' THEN 3 
          WHEN 'low' THEN 4 
        END,
        created_at DESC 
        LIMIT $${params.length + 1} OFFSET $${params.length + 2}`
      params.push(limit, offset)

      const result = await client.query(query, params)

      // Get counts by status
      const statusCountsResult = await client.query(`
        SELECT 
          status,
          COUNT(*) as count
        FROM inquiries 
        GROUP BY status
      `)

      const statusCounts = statusCountsResult.rows.reduce((acc, row) => {
        acc[row.status] = parseInt(row.count)
        return acc
      }, {})

      // Get total count with filters
      let countQuery = 'SELECT COUNT(*) FROM inquiries'
      const countParams: any[] = []
      
      if (conditions.length > 0) {
        countQuery += ` WHERE ${conditions.join(' AND ')}`
        countParams.push(...params.slice(0, -2)) // Remove limit and offset
      }
      
      const countResult = await client.query(countQuery, countParams)
      const total = parseInt(countResult.rows[0].count)

      return NextResponse.json({
        success: true,
        inquiries: result.rows,
        statusCounts,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total
        }
      })

    } finally {
      client.release()
    }

  } catch (error) {
    console.error('❌ Error fetching admin inquiries:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch inquiries' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, status, priority, assigned_to, notes, follow_up_date, markAsRead } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Inquiry ID is required' },
        { status: 400 }
      )
    }

    const client = await getDatabase()

    try {
      const updates: string[] = []
      const params: any[] = []
      
      if (status) {
        updates.push(`status = $${params.length + 1}`)
        params.push(status)
        
        // If status is being changed to 'contacted', set contacted_at
        if (status === 'contacted') {
          updates.push(`contacted_at = CURRENT_TIMESTAMP`)
        }
      }
      
      if (priority) {
        updates.push(`priority = $${params.length + 1}`)
        params.push(priority)
      }
      
      if (assigned_to !== undefined) {
        updates.push(`assigned_to = $${params.length + 1}`)
        params.push(assigned_to || null)
      }
      
      if (notes !== undefined) {
        updates.push(`notes = $${params.length + 1}`)
        params.push(notes || null)
      }
      
      if (follow_up_date !== undefined) {
        updates.push(`follow_up_date = $${params.length + 1}`)
        params.push(follow_up_date || null)
      }
      
      if (markAsRead) {
        updates.push(`read_at = CURRENT_TIMESTAMP`)
      }

      if (updates.length === 0) {
        return NextResponse.json(
          { success: false, error: 'No fields to update' },
          { status: 400 }
        )
      }

      updates.push('updated_at = CURRENT_TIMESTAMP')
      params.push(id)

      const query = `
        UPDATE inquiries 
        SET ${updates.join(', ')}
        WHERE id = $${params.length}
        RETURNING *
      `

      const result = await client.query(query, params)

      if (result.rows.length === 0) {
        return NextResponse.json(
          { success: false, error: 'Inquiry not found' },
          { status: 404 }
        )
      }

      console.log('✅ Inquiry updated:', {
        id,
        inquiry_id: result.rows[0].inquiry_id,
        changes: { status, priority, assigned_to, notes, follow_up_date }
      })

      return NextResponse.json({
        success: true,
        inquiry: result.rows[0],
        message: 'Inquiry updated successfully'
      })

    } finally {
      client.release()
    }

  } catch (error) {
    console.error('❌ Error updating inquiry:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update inquiry' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Inquiry ID is required' },
        { status: 400 }
      )
    }

    const client = await getDatabase()

    try {
      const result = await client.query(
        'DELETE FROM inquiries WHERE id = $1 RETURNING inquiry_id',
        [id]
      )

      if (result.rows.length === 0) {
        return NextResponse.json(
          { success: false, error: 'Inquiry not found' },
          { status: 404 }
        )
      }

      console.log('✅ Inquiry deleted:', {
        id,
        inquiry_id: result.rows[0].inquiry_id
      })

      return NextResponse.json({
        success: true,
        message: 'Inquiry deleted successfully'
      })

    } finally {
      client.release()
    }

  } catch (error) {
    console.error('❌ Error deleting inquiry:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete inquiry' },
      { status: 500 }
    )
  }
}
