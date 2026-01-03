import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/database'

// POST - Client declines a quoted custom quote
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
        { error: 'This quote cannot be declined. Status: ' + customQuote.status },
        { status: 400 }
      )
    }

    // Update the custom quote status to 'rejected'
    await client.query(
      `UPDATE custom_quotes 
       SET status = 'rejected', 
           updated_at = NOW()
       WHERE id = $1`,
      [customQuoteId]
    )

    return NextResponse.json({
      success: true,
      message: 'Quote declined successfully'
    })

  } catch (error: any) {
    console.error('Error declining custom quote:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to decline custom quote' },
      { status: 500 }
    )
  } finally {
    client.release()
  }
}
