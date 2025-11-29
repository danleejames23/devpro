import { NextRequest, NextResponse } from 'next/server'
import { migrateQuoteIds, checkQuoteIdStatus } from '@/lib/migrate-quote-ids'

// POST /api/migrate-quotes - Run quote ID migration
export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Quote ID migration API called')
    
    // Check current status first
    const statusBefore = await checkQuoteIdStatus()
    
    // Run migration if needed
    if (statusBefore.quotes_without_id > 0) {
      await migrateQuoteIds()
      
      // Check status after migration
      const statusAfter = await checkQuoteIdStatus()
      
      return NextResponse.json({
        success: true,
        message: 'Quote ID migration completed',
        before: statusBefore,
        after: statusAfter
      })
    } else {
      return NextResponse.json({
        success: true,
        message: 'No migration needed - all quotes already have quote_id',
        status: statusBefore
      })
    }
    
  } catch (error) {
    console.error('❌ Migration API error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: `Migration failed: ${(error as Error).message}` 
      },
      { status: 500 }
    )
  }
}

// GET /api/migrate-quotes - Check quote ID status
export async function GET(request: NextRequest) {
  try {
    const status = await checkQuoteIdStatus()
    
    return NextResponse.json({
      success: true,
      status
    })
    
  } catch (error) {
    console.error('❌ Status check API error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: `Status check failed: ${(error as Error).message}` 
      },
      { status: 500 }
    )
  }
}
