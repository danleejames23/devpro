import { NextRequest, NextResponse } from 'next/server'
import { 
  markNotificationAsRead,
  deleteNotification
} from '@/lib/database'
import { verifyToken } from '@/lib/auth'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id: notificationId } = await params
    const body = await request.json()
    const { action } = body

    if (action === 'markRead') {
      const success = await markNotificationAsRead(notificationId, payload.customerId)
      
      if (!success) {
        return NextResponse.json(
          { error: 'Notification not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({ 
        success: true 
      })
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )

  } catch (error) {
    console.error('❌ Error updating notification:', error)
    return NextResponse.json(
      { error: 'Failed to update notification' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id: notificationId } = await params
    const success = await deleteNotification(notificationId, payload.customerId)
    
    if (!success) {
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ 
      success: true 
    })

  } catch (error) {
    console.error('❌ Error deleting notification:', error)
    return NextResponse.json(
      { error: 'Failed to delete notification' },
      { status: 500 }
    )
  }
}
