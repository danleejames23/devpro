import { 
  createQuoteStatusNotification,
  createMessageNotification,
  createBillingNotification,
  createInvoiceNotification,
  createProjectUpdateNotification,
  createSystemNotification
} from './database'

/**
 * Notification Integration Helper
 * 
 * This file provides helper functions to automatically create notifications
 * for various events throughout the application.
 */

// Quote Events
export async function notifyQuoteStatusChange(customerId: string, quoteId: string, status: string, quoteTitle?: string) {
  try {
    await createQuoteStatusNotification(customerId, quoteId, status, quoteTitle)
    console.log(`📬 Quote status notification sent to customer ${customerId} for quote ${quoteId}`)
  } catch (error) {
    console.error('❌ Failed to send quote status notification:', error)
  }
}

// Message Events
export async function notifyNewMessage(customerId: string, messageCount: number = 1) {
  try {
    await createMessageNotification(customerId, messageCount)
    console.log(`📬 Message notification sent to customer ${customerId}`)
  } catch (error) {
    console.error('❌ Failed to send message notification:', error)
  }
}

// Billing Events
export async function notifyPaymentDue(customerId: string, amount: number, dueDate: string, invoiceId?: string) {
  try {
    await createBillingNotification(customerId, amount, dueDate, invoiceId)
    console.log(`📬 Billing notification sent to customer ${customerId} for amount £${amount}`)
  } catch (error) {
    console.error('❌ Failed to send billing notification:', error)
  }
}

export async function notifyNewInvoice(customerId: string, invoiceId: string, amount: number) {
  try {
    await createInvoiceNotification(customerId, invoiceId, amount)
    console.log(`📬 Invoice notification sent to customer ${customerId} for amount £${amount}`)
  } catch (error) {
    console.error('❌ Failed to send invoice notification:', error)
  }
}

// Project Events
export async function notifyProjectUpdate(customerId: string, projectId: string, update: string) {
  try {
    await createProjectUpdateNotification(customerId, projectId, update)
    console.log(`📬 Project update notification sent to customer ${customerId} for project ${projectId}`)
  } catch (error) {
    console.error('❌ Failed to send project update notification:', error)
  }
}

// System Events
export async function notifySystemMessage(customerId: string, title: string, message: string, priority: 'low' | 'medium' | 'high' | 'urgent' = 'low') {
  try {
    await createSystemNotification(customerId, title, message, priority)
    console.log(`📬 System notification sent to customer ${customerId}: ${title}`)
  } catch (error) {
    console.error('❌ Failed to send system notification:', error)
  }
}

// Welcome Notification
export async function sendWelcomeNotification(customerId: string, customerName: string) {
  try {
    await createSystemNotification(
      customerId,
      'Welcome to Your Dashboard!',
      `Hi ${customerName}! Welcome to your client dashboard. You can manage your projects, track quotes, and communicate with our team here.`,
      'medium'
    )
    console.log(`📬 Welcome notification sent to customer ${customerId}`)
  } catch (error) {
    console.error('❌ Failed to send welcome notification:', error)
  }
}

// Quote Request Confirmation
export async function notifyQuoteRequestReceived(customerId: string, quoteTitle: string) {
  try {
    await createSystemNotification(
      customerId,
      'Quote Request Received',
      `Your quote request for "${quoteTitle}" has been received. Our team will review it and get back to you shortly.`,
      'medium'
    )
    console.log(`📬 Quote request confirmation sent to customer ${customerId}`)
  } catch (error) {
    console.error('❌ Failed to send quote request confirmation:', error)
  }
}

// Payment Confirmation
export async function notifyPaymentConfirmation(customerId: string, amount: number, invoiceId: string) {
  try {
    await createSystemNotification(
      customerId,
      'Payment Confirmed',
      `Your payment of £${amount.toFixed(2)} for invoice ${invoiceId} has been successfully processed. Thank you!`,
      'high'
    )
    console.log(`📬 Payment confirmation sent to customer ${customerId}`)
  } catch (error) {
    console.error('❌ Failed to send payment confirmation:', error)
  }
}

// Project Completion
export async function notifyProjectCompletion(customerId: string, projectName: string) {
  try {
    await createSystemNotification(
      customerId,
      'Project Completed! 🎉',
      `Congratulations! Your project "${projectName}" has been completed successfully. You can now review and download the final deliverables.`,
      'high'
    )
    console.log(`📬 Project completion notification sent to customer ${customerId}`)
  } catch (error) {
    console.error('❌ Failed to send project completion notification:', error)
  }
}

// Security Alerts
export async function notifySecurityAlert(customerId: string, alertType: string, details: string) {
  try {
    await createSystemNotification(
      customerId,
      'Security Alert',
      `${alertType}: ${details}`,
      'urgent'
    )
    console.log(`📬 Security alert sent to customer ${customerId}`)
  } catch (error) {
    console.error('❌ Failed to send security alert:', error)
  }
}

// Maintenance Notice
export async function notifyMaintenance(customerId: string, scheduledTime: string, duration: string) {
  try {
    await createSystemNotification(
      customerId,
      'Scheduled Maintenance',
      `We will be performing maintenance on ${scheduledTime} for approximately ${duration}. You may experience temporary service disruptions.`,
      'medium'
    )
    console.log(`📬 Maintenance notice sent to customer ${customerId}`)
  } catch (error) {
    console.error('❌ Failed to send maintenance notice:', error)
  }
}

/**
 * Integration Points for Automatic Notifications
 * 
 * These functions should be called at the appropriate points in your application:
 * 
 * 1. Quote Management:
 *    - notifyQuoteStatusChange() when quote status updates
 *    - notifyQuoteRequestReceived() when new quote is submitted
 * 
 * 2. Messaging:
 *    - notifyNewMessage() when new message is sent
 * 
 * 3. Billing:
 *    - notifyPaymentDue() when payment is due
 *    - notifyNewInvoice() when invoice is generated
 *    - notifyPaymentConfirmation() when payment is processed
 * 
 * 4. Projects:
 *    - notifyProjectUpdate() when project status changes
 *    - notifyProjectCompletion() when project is finished
 * 
 * 5. User Management:
 *    - sendWelcomeNotification() when user registers
 *    - notifySecurityAlert() on suspicious activity
 * 
 * 6. System:
 *    - notifyMaintenance() for scheduled downtime
 *    - notifySystemMessage() for general announcements
 */
