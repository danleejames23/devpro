import { NextRequest, NextResponse } from 'next/server'
import { 
  getNotificationPreferences,
  updateNotificationPreferences
} from '@/lib/database'
import { verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload || !payload.customerId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Get notification preferences
    const preferences = await getNotificationPreferences(payload.customerId)
    
    return NextResponse.json({ 
      preferences,
      success: true 
    })

  } catch (error) {
    console.error('❌ Error fetching notification preferences:', error)
    return NextResponse.json(
      { error: 'Failed to fetch notification preferences' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload || !payload.customerId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const body = await request.json()
    
    // Update notification preferences
    const preferences = await updateNotificationPreferences(payload.customerId, body)
    
    return NextResponse.json({ 
      preferences,
      success: true 
    })

  } catch (error) {
    console.error('❌ Error updating notification preferences:', error)
    return NextResponse.json(
      { error: 'Failed to update notification preferences' },
      { status: 500 }
    )
  }
}
