import { NextRequest, NextResponse } from 'next/server'
import { checkDatabaseSchema, createMissingTables } from '@/lib/check-database'

// GET /api/check-database - Check database schema
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Database check API called')
    
    const schemaCheck = await checkDatabaseSchema()
    
    return NextResponse.json({
      success: true,
      schema: schemaCheck
    })
    
  } catch (error) {
    console.error('❌ Database check API error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: `Database check failed: ${(error as Error).message}` 
      },
      { status: 500 }
    )
  }
}

// POST /api/check-database - Fix database schema
export async function POST(request: NextRequest) {
  try {
    console.log('🔨 Database fix API called')
    
    // First check current state
    const schemaCheck = await checkDatabaseSchema()
    
    // Create missing tables/columns
    const fixResult = await createMissingTables()
    
    // Check again after fixes
    const schemaCheckAfter = await checkDatabaseSchema()
    
    return NextResponse.json({
      success: true,
      message: 'Database schema fix completed',
      before: schemaCheck,
      fixResult,
      after: schemaCheckAfter
    })
    
  } catch (error) {
    console.error('❌ Database fix API error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: `Database fix failed: ${(error as Error).message}` 
      },
      { status: 500 }
    )
  }
}
