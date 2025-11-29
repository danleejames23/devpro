import { NextResponse } from 'next/server'
import { 
  sendWelcomeNotification,
  notifyQuoteStatusChange,
  notifyNewMessage,
  notifyPaymentDue,
  notifyProjectCompletion
} from '@/lib/notification-integration'
import { getAllCustomers } from '@/lib/database'

export async function POST() {
  try {
    console.log('🧪 Creating test notifications...')
    
    // Get first customer for testing
    const customers = await getAllCustomers()
    
    if (customers.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No customers found. Please create a customer account first.'
      }, { status: 400 })
    }
    
    const testCustomer = customers[0]
    const customerId = testCustomer.id
    const customerName = `${testCustomer.first_name} ${testCustomer.last_name}`.trim()
    
    // Create various test notifications
    await sendWelcomeNotification(customerId, customerName)
    
    await notifyQuoteStatusChange(
      customerId, 
      'QT-12345', 
      'quoted', 
      'Website Redesign Project'
    )
    
    await notifyNewMessage(customerId, 2)
    
    await notifyPaymentDue(
      customerId, 
      1500.00, 
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
      'INV-001'
    )
    
    await notifyProjectCompletion(
      customerId, 
      'Mobile App Development'
    )
    
    console.log('✅ Test notifications created successfully!')
    
    return NextResponse.json({
      success: true,
      message: 'Test notifications created successfully!',
      details: {
        customerId,
        customerName,
        notificationsCreated: [
          'Welcome notification',
          'Quote status update',
          'New messages',
          'Payment due reminder',
          'Project completion'
        ]
      }
    })
    
  } catch (error) {
    console.error('❌ Failed to create test notifications:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to create test notifications'
    }, { status: 500 })
  }
}
