import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Test login endpoint called')
    const body = await request.json()
    console.log('📧 Received data:', body)

    return NextResponse.json({
      success: true,
      message: 'Test endpoint working',
      receivedData: body
    })
    
  } catch (error) {
    console.error('❌ Test login error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Test login endpoint is working'
  })
}
