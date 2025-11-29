import { NextResponse } from 'next/server'
import { createMissingTables } from '@/lib/check-database'

// Allow GET for browser access
export async function GET() {
  return POST()
}

export async function POST() {
  try {
    console.log('🔧 Setting up notification system...')
    
    const result = await createMissingTables()
    
    if (result.success) {
      console.log('✅ Notification system setup completed successfully!')
      
      return NextResponse.json({
        success: true,
        message: 'Notification system setup completed successfully!',
        details: {
          tables: [
            'notifications (stores all notifications)',
            'notification_preferences (stores user preferences)', 
            'Performance indexes for faster queries'
          ]
        }
      })
    } else {
      console.error('❌ Setup failed:', result.error)
      
      return NextResponse.json({
        success: false,
        error: result.error
      }, { status: 500 })
    }
  } catch (error) {
    console.error('❌ Setup error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to setup notification system'
    }, { status: 500 })
  }
}
