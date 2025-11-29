import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/database'
import { notifyQuoteStatusChange } from '@/lib/notification-integration'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // TODO: Add admin authentication check
    
    const { id: quoteId } = await params
    const body = await request.json()
    const { status, admin_notes, final_quote } = body
    
    const client = await getDatabase()
    
    try {
      // Update quote
      const result = await client.query(`
        UPDATE quotes 
        SET 
          status = COALESCE($1, status),
          admin_notes = COALESCE($2, admin_notes),
          final_quote = COALESCE($3, final_quote),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $4
        RETURNING *
      `, [status, admin_notes, final_quote ? JSON.stringify(final_quote) : null, quoteId])
      
      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: 'Quote not found' },
          { status: 404 }
        )
      }
      
      const updatedQuote = result.rows[0]
      
      // Send notification to client if status changed
      if (status && updatedQuote.customer_id) {
        await notifyQuoteStatusChange(
          updatedQuote.customer_id,
          quoteId,
          status,
          updatedQuote.description
        )
      }
      
      return NextResponse.json({
        success: true,
        quote: updatedQuote
      })
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('❌ Error updating quote:', error)
    return NextResponse.json(
      { error: 'Failed to update quote' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // TODO: Add admin authentication check
    
    const { id: quoteId } = await params
    const client = await getDatabase()
    
    try {
      const result = await client.query(
        'DELETE FROM quotes WHERE id = $1 RETURNING *',
        [quoteId]
      )
      
      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: 'Quote not found' },
          { status: 404 }
        )
      }
      
      return NextResponse.json({
        success: true,
        message: 'Quote deleted successfully'
      })
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('❌ Error deleting quote:', error)
    return NextResponse.json(
      { error: 'Failed to delete quote' },
      { status: 500 }
    )
  }
}
