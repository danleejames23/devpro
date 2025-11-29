import { NextRequest, NextResponse } from 'next/server'
import { updateQuoteStatus } from '@/lib/database'

// PUT /api/quotes/[quoteId]/cancel - Cancel a quote
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ quoteId: string }> }
) {
  try {
    const { quoteId } = await params
    console.log('Cancel API called with quoteId:', quoteId)
    
    // Update quote status to cancelled
    const updatedQuote = await updateQuoteStatus(quoteId, 'cancelled')
    console.log('Updated quote result:', updatedQuote)
    
    if (!updatedQuote) {
      console.log('Quote not found for ID:', quoteId)
      return NextResponse.json(
        { success: false, error: 'Quote not found' },
        { status: 404 }
      )
    }
    
    console.log('Quote cancelled successfully:', updatedQuote.quote_id || updatedQuote.id)
    return NextResponse.json({
      success: true,
      quote: {
        id: updatedQuote.quote_id || updatedQuote.id,
        status: updatedQuote.status,
        updatedAt: updatedQuote.updated_at
      }
    })
    
  } catch (error) {
    console.error('Error canceling quote:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
