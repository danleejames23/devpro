import { NextResponse } from 'next/server'
import { getDatabase } from '@/lib/database'
import bcrypt from 'bcryptjs'

export async function POST() {
  try {
    console.log('🔍 Creating test customer...')
    const client = await getDatabase()
    
    try {
      // Hash password
      const hashedPassword = await bcrypt.hash('password123', 12)
      
      // Create test customer
      const result = await client.query(`
        INSERT INTO customers (first_name, last_name, email, password_hash, company, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        ON CONFLICT (email) DO NOTHING
        RETURNING id, first_name, last_name, email
      `, ['Test', 'User', 'test@example.com', hashedPassword, 'Test Company'])
      
      if (result.rows.length > 0) {
        console.log('✅ Test customer created:', result.rows[0])
        return NextResponse.json({
          success: true,
          message: 'Test customer created',
          customer: result.rows[0],
          credentials: {
            email: 'test@example.com',
            password: 'password123'
          }
        })
      } else {
        return NextResponse.json({
          success: true,
          message: 'Test customer already exists',
          credentials: {
            email: 'test@example.com',
            password: 'password123'
          }
        })
      }
      
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('❌ Error creating test customer:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
