import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/database'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { customer_id, invoice_id, deposit_amount, total_amount } = body
    
    const client = await getDatabase()
    
    try {
      // Check if notifications table exists
      const tableExists = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' AND table_name = 'notifications'
        )
      `)
      
      if (tableExists.rows[0].exists) {
        // Create a notification for the client about the deposit requirement
        await client.query(`
          INSERT INTO notifications (
            customer_id, 
            title, 
            message, 
            type, 
            related_id, 
            created_at, 
            is_read
          ) VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, false)
        `, [
          customer_id,
          'Deposit Required - Project Approved!',
          `Great news! Your project has been approved. To begin work, a 20% deposit of ${deposit_amount} is required. Total project cost: ${total_amount}. Please contact us to arrange payment.`,
          'deposit_required',
          invoice_id
        ])
        
        console.log('✅ Deposit notification sent to customer:', customer_id)
      } else {
        console.log('⚠️ Notifications table does not exist, skipping notification')
      }
      
      return NextResponse.json({
        success: true,
        message: 'Deposit notification processed successfully'
      })
      
    } finally {
      client.release()
    }
    
  } catch (error) {
    console.error('❌ Error sending deposit notification:', error)
    // Don't fail - just log the error and return success
    console.log('⚠️ Continuing without notification due to error')
    return NextResponse.json({
      success: true,
      message: 'Approval completed (notification skipped due to error)'
    })
  }
}
