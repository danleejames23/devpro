// Production email service with SendGrid
import sgMail from '@sendgrid/mail'
import { config } from './config'
import { Customer, Quote } from './database'

// Initialize SendGrid
if (config.email.apiKey) {
  sgMail.setApiKey(config.email.apiKey)
} else {
  console.warn('⚠️  SendGrid API key not configured. Emails will be logged to console.')
}

interface EmailTemplate {
  subject: string
  html: string
  text: string
}

// Email templates
function getWelcomeEmailTemplate(customer: Customer, tempPassword: string, quote: Quote): EmailTemplate {
  const loginUrl = `${config.app.baseUrl}/client`
  
  return {
    subject: '🎉 Welcome! Your Quote Request Has Been Received',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .quote-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
          .login-box { background: #667eea; color: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to ${config.email.fromName}!</h1>
            <p>Your quote request has been received and we're excited to work with you.</p>
          </div>
          
          <div class="content">
            <h2>Hi ${customer.first_name}! 👋</h2>
            
            <p>Thank you for your interest in our services. We've received your quote request and created a customer account for you to track the progress.</p>
            
            <div class="quote-details">
              <h3>📋 Quote Details</h3>
              <p><strong>Quote ID:</strong> ${quote.id}</p>
              <p><strong>Quoted Price:</strong> £${quote.estimated_cost.toLocaleString()}</p>
              <p><strong>Timeline:</strong> ${quote.estimated_timeline}</p>
              <p><strong>Rush Delivery:</strong> ${quote.rush_delivery}</p>
              ${quote.selected_package ? `<p><strong>Package:</strong> ${quote.selected_package}</p>` : ''}
            </div>
            
            <div class="login-box">
              <h3>🔐 Your Account Access</h3>
              <p><strong>Email:</strong> ${customer.email}</p>
              <p><strong>Temporary Password:</strong> <code style="background: rgba(255,255,255,0.2); padding: 4px 8px; border-radius: 4px;">${tempPassword}</code></p>
              <p style="margin-top: 20px;">
                <a href="${loginUrl}" class="button">Access Customer Portal</a>
              </p>
              <p style="font-size: 14px; margin-top: 15px; opacity: 0.9;">
                ⚠️ Please change your password after logging in for security.
              </p>
            </div>
            
            <h3>🚀 What happens next?</h3>
            <ul>
              <li>Our team will review your requirements within 24 hours</li>
              <li>You'll receive a detailed quote with project breakdown</li>
              <li>Track progress in your customer portal</li>
              <li>Direct communication with your project manager</li>
            </ul>
            
            <p>If you have any questions, feel free to reply to this email or contact us at <a href="mailto:${config.app.adminEmail}">${config.app.adminEmail}</a>.</p>
            
            <p>Best regards,<br>
            The ${config.email.fromName} Team</p>
          </div>
          
          <div class="footer">
            <p>This email was sent to ${customer.email}</p>
            <p>© ${new Date().getFullYear()} ${config.email.fromName}. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Welcome to ${config.email.fromName}!

Hi ${customer.first_name} ${customer.last_name},

Thank you for your quote request. We've created a customer account for you.

Quote Details:
- Quote ID: ${quote.id}
- Quoted Price: £${quote.estimated_cost.toLocaleString()}
- Timeline: ${quote.estimated_timeline}
- Rush Delivery: ${quote.rush_delivery}
${quote.selected_package ? `- Package: ${quote.selected_package}` : ''}

Your Account Access:
- Email: ${customer.email}
- Temporary Password: ${tempPassword}
- Login: ${loginUrl}

⚠️ Please change your password after logging in.

What happens next:
- Our team will review your requirements within 24 hours
- You'll receive a detailed quote with project breakdown
- Track progress in your customer portal

Questions? Contact us at ${config.app.adminEmail}

Best regards,
The ${config.email.fromName} Team
    `
  }
}

function getAdminNotificationTemplate(quote: Quote, customer: Customer): EmailTemplate {
  const adminUrl = `${config.app.baseUrl}/admin/dashboard`
  
  return {
    subject: `🔔 New Quote Request - ${quote.id}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #f59e0b; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .quote-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .customer-info { background: #e0f2fe; padding: 15px; border-radius: 6px; margin: 15px 0; }
          .button { display: inline-block; background: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; }
          .urgent { background: #fee2e2; border-left: 4px solid #ef4444; padding: 15px; border-radius: 6px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔔 New Quote Request</h1>
            <p>A new customer has submitted a quote request</p>
          </div>
          
          <div class="content">
            ${quote.rush_delivery !== 'standard' ? `
            <div class="urgent">
              <strong>⚡ ${quote.rush_delivery.toUpperCase()} DELIVERY REQUESTED</strong>
            </div>
            ` : ''}
            
            <div class="customer-info">
              <h3>👤 Customer Information</h3>
              <p><strong>Name:</strong> ${customer.first_name} ${customer.last_name}</p>
              <p><strong>Email:</strong> ${customer.email}</p>
              ${customer.company ? `<p><strong>Company:</strong> ${customer.company}</p>` : ''}
              <p><strong>Customer ID:</strong> ${customer.id}</p>
            </div>
            
            <div class="quote-details">
              <h3>📋 Quote Details</h3>
              <p><strong>Quote ID:</strong> ${quote.id}</p>
              <p><strong>Quoted Price:</strong> £${quote.estimated_cost.toLocaleString()}</p>
              <p><strong>Timeline:</strong> ${quote.estimated_timeline}</p>
              <p><strong>Rush Delivery:</strong> ${quote.rush_delivery}</p>
              ${quote.selected_package ? `<p><strong>Package:</strong> ${quote.selected_package}</p>` : ''}
              <p><strong>Status:</strong> ${quote.status}</p>
              <p><strong>Submitted:</strong> ${new Date(quote.created_at).toLocaleString()}</p>
            </div>
            
            <div class="quote-details">
              <h3>📝 Project Description</h3>
              <p style="white-space: pre-wrap;">${quote.description}</p>
            </div>
            
            <p style="text-align: center; margin: 30px 0;">
              <a href="${adminUrl}" class="button">Review in Admin Dashboard</a>
            </p>
            
            <p><strong>Action Required:</strong> Please review this quote request and provide a detailed response within 24 hours.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
New Quote Request - ${quote.id}

${quote.rush_delivery !== 'standard' ? `⚡ ${quote.rush_delivery.toUpperCase()} DELIVERY REQUESTED\n` : ''}

Customer Information:
- Name: ${customer.first_name} ${customer.last_name}
- Email: ${customer.email}
${customer.company ? `- Company: ${customer.company}` : ''}
- Customer ID: ${customer.id}

Quote Details:
- Quote ID: ${quote.id}
- Quoted Price: £${quote.estimated_cost.toLocaleString()}
- Timeline: ${quote.estimated_timeline}
- Rush Delivery: ${quote.rush_delivery}
${quote.selected_package ? `- Package: ${quote.selected_package}` : ''}
- Status: ${quote.status}
- Submitted: ${new Date(quote.created_at).toLocaleString()}

Project Description:
${quote.description}

Review in Admin Dashboard: ${adminUrl}

Action Required: Please review this quote request and provide a detailed response within 24 hours.
    `
  }
}

// Email sending functions
export async function sendWelcomeEmail(customer: Customer, tempPassword: string, quote: Quote): Promise<boolean> {
  try {
    const template = getWelcomeEmailTemplate(customer, tempPassword, quote)
    
    const msg = {
      to: customer.email,
      from: {
        email: config.email.fromEmail,
        name: config.email.fromName
      },
      subject: template.subject,
      text: template.text,
      html: template.html
    }
    
    if (config.email.apiKey) {
      await sgMail.send(msg)
      console.log(`✅ Welcome email sent to: ${customer.email}`)
    } else {
      console.log(`📧 [DEMO] Welcome email would be sent to: ${customer.email}`)
      console.log(`Subject: ${template.subject}`)
      console.log(`Temp Password: ${tempPassword}`)
    }
    
    return true
  } catch (error) {
    console.error('❌ Error sending welcome email:', error)
    return false
  }
}

export async function sendAdminNotification(quote: Quote, customer: Customer): Promise<boolean> {
  try {
    const template = getAdminNotificationTemplate(quote, customer)
    
    const msg = {
      to: config.app.adminEmail,
      from: {
        email: config.email.fromEmail,
        name: config.email.fromName
      },
      subject: template.subject,
      text: template.text,
      html: template.html
    }
    
    if (config.email.apiKey) {
      await sgMail.send(msg)
      console.log(`✅ Admin notification sent for quote: ${quote.id}`)
    } else {
      console.log(`📧 [DEMO] Admin notification would be sent for quote: ${quote.id}`)
      console.log(`Subject: ${template.subject}`)
    }
    
    return true
  } catch (error) {
    console.error('❌ Error sending admin notification:', error)
    return false
  }
}

// Email validation
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}
