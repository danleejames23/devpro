// Production configuration with environment variables
export const config = {
  // Database
  database: {
    url: process.env.DATABASE_URL || './data/freelance.db',
    type: process.env.DATABASE_TYPE || 'sqlite' as 'sqlite' | 'postgresql'
  },
  
  // Email service (SendGrid)
  email: {
    apiKey: process.env.SENDGRID_API_KEY || '',
    fromEmail: process.env.FROM_EMAIL || 'noreply@your-domain.com',
    fromName: process.env.FROM_NAME || 'Your Freelance Business'
  },
  
  // Security
  auth: {
    jwtSecret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12'),
    sessionTimeout: parseInt(process.env.SESSION_TIMEOUT || '86400') // 24 hours
  },
  
  // App settings
  app: {
    baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
    adminEmail: process.env.ADMIN_EMAIL || 'admin@your-domain.com'
  }
}

// Validate required environment variables in production
export function validateConfig() {
  if (process.env.NODE_ENV === 'production') {
    const required = [
      'SENDGRID_API_KEY',
      'FROM_EMAIL',
      'JWT_SECRET',
      'NEXT_PUBLIC_BASE_URL',
      'ADMIN_EMAIL'
    ]
    
    const missing = required.filter(key => !process.env[key])
    
    if (missing.length > 0) {
      console.warn('⚠️  Missing required environment variables:', missing.join(', '))
      console.warn('⚠️  App will use default values, but this is not recommended for production')
    }
  }
}
