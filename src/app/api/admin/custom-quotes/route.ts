import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

// GET - Get all custom quotes for admin
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    let sql = `
      SELECT cq.*, 
             c.first_name as customer_first_name,
             c.last_name as customer_last_name
      FROM custom_quotes cq
      LEFT JOIN customers c ON cq.customer_id = c.id
    `
    const params: string[] = []

    if (status && status !== 'all') {
      sql += ' WHERE cq.status = $1'
      params.push(status)
    }

    sql += ' ORDER BY cq.created_at DESC'

    const result = await query(sql, params)

    return NextResponse.json({
      success: true,
      customQuotes: result.rows
    })

  } catch (error) {
    console.error('Error fetching custom quotes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch custom quotes' },
      { status: 500 }
    )
  }
}

// PATCH - Update custom quote status, add pricing, approve/reject
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      customQuoteId, 
      status, 
      adminNotes, 
      quotedPrice, 
      quotedTimeline,
      adminId 
    } = body

    if (!customQuoteId) {
      return NextResponse.json(
        { error: 'Custom quote ID required' },
        { status: 400 }
      )
    }

    // Get the custom quote first
    const existingQuote = await query(
      'SELECT * FROM custom_quotes WHERE id = $1',
      [customQuoteId]
    )

    if (existingQuote.rows.length === 0) {
      return NextResponse.json(
        { error: 'Custom quote not found' },
        { status: 404 }
      )
    }

    const customQuote = existingQuote.rows[0]

    // If approving with a price, create a formal quote and project
    if (status === 'approved' && quotedPrice) {
      // Generate quote ID
      const quoteCountResult = await query(
        "SELECT COUNT(*) FROM quotes WHERE quote_id LIKE 'QT-' || to_char(CURRENT_DATE, 'YYYY') || '-%'"
      )
      const quoteCount = parseInt(quoteCountResult.rows[0].count) + 1
      const quoteId = `QT-${new Date().getFullYear()}-${String(quoteCount).padStart(3, '0')}`

      // Create the formal quote
      const newQuote = await query(
        `INSERT INTO quotes (
          quote_id, customer_id, name, email, company, description,
          estimated_cost, estimated_timeline, status, selected_package
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending', $9)
        RETURNING *`,
        [
          quoteId,
          customQuote.customer_id,
          `${customQuote.first_name} ${customQuote.last_name}`,
          customQuote.email,
          customQuote.company,
          customQuote.project_description,
          quotedPrice,
          quotedTimeline || customQuote.preferred_timeline || '4-8 weeks',
          JSON.stringify({
            type: 'custom',
            projectType: customQuote.project_type,
            projectTitle: customQuote.project_title,
            features: customQuote.features,
            integrations: customQuote.integrations
          })
        ]
      )

      // Create a project in planning status
      const newProject = await query(
        `INSERT INTO projects (
          customer_id, quote_id, name, description, status
        ) VALUES ($1, $2, $3, $4, 'planning')
        RETURNING *`,
        [
          customQuote.customer_id,
          newQuote.rows[0].id,
          customQuote.project_title,
          customQuote.project_description
        ]
      )

      // Update the custom quote with references
      await query(
        `UPDATE custom_quotes SET
          status = $1,
          admin_notes = $2,
          quoted_price = $3,
          quoted_timeline = $4,
          reviewed_by = $5,
          reviewed_at = CURRENT_TIMESTAMP,
          resulting_quote_id = $6,
          resulting_project_id = $7,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $8`,
        [
          status,
          adminNotes || null,
          quotedPrice,
          quotedTimeline || null,
          adminId || null,
          newQuote.rows[0].id,
          newProject.rows[0].id,
          customQuoteId
        ]
      )

      // Create notification for customer
      if (customQuote.customer_id) {
        await query(
          `INSERT INTO notifications (customer_id, type, title, message)
           VALUES ($1, 'quote_ready', 'Custom Quote Ready', $2)`,
          [
            customQuote.customer_id,
            `Your custom quote for "${customQuote.project_title}" is ready! The quoted price is £${quotedPrice}. Please review and accept to proceed.`
          ]
        )
      }

      return NextResponse.json({
        success: true,
        message: 'Custom quote approved, formal quote and project created',
        quote: newQuote.rows[0],
        project: newProject.rows[0]
      })

    } else {
      // Just update status/notes without creating quote
      await query(
        `UPDATE custom_quotes SET
          status = COALESCE($1, status),
          admin_notes = COALESCE($2, admin_notes),
          quoted_price = COALESCE($3, quoted_price),
          quoted_timeline = COALESCE($4, quoted_timeline),
          reviewed_by = COALESCE($5, reviewed_by),
          reviewed_at = CASE WHEN $1 IS NOT NULL THEN CURRENT_TIMESTAMP ELSE reviewed_at END,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $6`,
        [
          status || null,
          adminNotes || null,
          quotedPrice || null,
          quotedTimeline || null,
          adminId || null,
          customQuoteId
        ]
      )

      // Notify customer of status change
      if (customQuote.customer_id && status) {
        let notificationMessage = ''
        if (status === 'reviewing') {
          notificationMessage = `Your custom quote request for "${customQuote.project_title}" is now being reviewed.`
        } else if (status === 'rejected') {
          notificationMessage = `Unfortunately, we are unable to proceed with your custom quote request for "${customQuote.project_title}". ${adminNotes || ''}`
        }

        if (notificationMessage) {
          await query(
            `INSERT INTO notifications (customer_id, type, title, message)
             VALUES ($1, 'quote_update', 'Quote Request Update', $2)`,
            [customQuote.customer_id, notificationMessage]
          )
        }
      }

      return NextResponse.json({
        success: true,
        message: 'Custom quote updated'
      })
    }

  } catch (error) {
    console.error('Error updating custom quote:', error)
    return NextResponse.json(
      { error: 'Failed to update custom quote' },
      { status: 500 }
    )
  }
}
