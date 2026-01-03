import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/database'

// POST - Client accepts a quoted custom quote, creates project and quote
export async function POST(request: NextRequest) {
  const client = await getDatabase()
  try {
    const { customQuoteId } = await request.json()

    if (!customQuoteId) {
      return NextResponse.json(
        { error: 'Custom quote ID required' },
        { status: 400 }
      )
    }

    // Get the custom quote
    const customQuoteResult = await client.query(
      'SELECT * FROM custom_quotes WHERE id = $1',
      [customQuoteId]
    )

    if (customQuoteResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Custom quote not found' },
        { status: 404 }
      )
    }

    const customQuote = customQuoteResult.rows[0]

    // Verify it's in 'quoted' status
    if (customQuote.status !== 'quoted') {
      return NextResponse.json(
        { error: 'This quote cannot be accepted. Status: ' + customQuote.status },
        { status: 400 }
      )
    }

    // Start transaction
    await client.query('BEGIN')

    try {
      // Create a new quote record
      const quoteResult = await client.query(
        `INSERT INTO quotes (
          customer_id,
          name,
          email,
          company,
          project_name,
          description,
          estimated_cost,
          estimated_timeline,
          status,
          created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'accepted', NOW())
        RETURNING *`,
        [
          customQuote.customer_id,
          `${customQuote.first_name} ${customQuote.last_name}`,
          customQuote.email,
          customQuote.company,
          customQuote.project_title,
          customQuote.project_description,
          customQuote.quoted_price,
          customQuote.quoted_timeline
        ]
      )

      const newQuote = quoteResult.rows[0]

      // Create a new project record
      const projectResult = await client.query(
        `INSERT INTO projects (
          customer_id,
          quote_id,
          name,
          description,
          status,
          progress,
          start_date,
          estimated_completion,
          budget,
          created_at
        ) VALUES ($1, $2, $3, $4, 'in_progress', 0, NOW(), NOW() + INTERVAL '30 days', $5, NOW())
        RETURNING *`,
        [
          customQuote.customer_id,
          newQuote.id,
          customQuote.project_title,
          customQuote.project_description,
          customQuote.quoted_price
        ]
      )

      const newProject = projectResult.rows[0]

      // Update the custom quote status to 'approved' and link to quote/project
      await client.query(
        `UPDATE custom_quotes 
         SET status = 'approved', 
             resulting_quote_id = $1, 
             resulting_project_id = $2,
             updated_at = NOW()
         WHERE id = $3`,
        [newQuote.id, newProject.id, customQuoteId]
      )

      await client.query('COMMIT')

      return NextResponse.json({
        success: true,
        message: 'Quote accepted successfully',
        quote: newQuote,
        project: newProject
      })

    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    }

  } catch (error: any) {
    console.error('Error accepting custom quote:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to accept custom quote' },
      { status: 500 }
    )
  } finally {
    client.release()
  }
}
