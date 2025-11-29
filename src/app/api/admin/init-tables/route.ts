import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/database'

// Allow both GET and POST for easy browser access
export async function GET() {
  return POST()
}

export async function POST() {
  try {
    console.log('🔍 Initializing admin tables...')
    const client = await getDatabase()
    
    try {
      // Create quotes table if it doesn't exist
      await client.query(`
        CREATE TABLE IF NOT EXISTS quotes (
          id SERIAL PRIMARY KEY,
          quote_id VARCHAR(50) UNIQUE,
          customer_id UUID,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) NOT NULL,
          company VARCHAR(255),
          description TEXT,
          estimated_cost DECIMAL(10,2),
          estimated_timeline VARCHAR(100),
          status VARCHAR(50) DEFAULT 'pending',
          rush_delivery VARCHAR(20) DEFAULT 'standard',
          selected_package JSONB,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `)
      console.log('✅ Quotes table ready')

      // Create messages table if it doesn't exist
      await client.query(`
        CREATE TABLE IF NOT EXISTS messages (
          id SERIAL PRIMARY KEY,
          customer_id UUID,
          subject VARCHAR(255),
          message TEXT,
          sender_type VARCHAR(20) DEFAULT 'customer',
          is_read BOOLEAN DEFAULT false,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `)
      console.log('✅ Messages table ready')

      // Create projects table if it doesn't exist
      await client.query(`
        CREATE TABLE IF NOT EXISTS projects (
          id SERIAL PRIMARY KEY,
          customer_id UUID,
          name VARCHAR(255) NOT NULL,
          client VARCHAR(255) NOT NULL,
          description TEXT,
          status VARCHAR(50) DEFAULT 'pending',
          progress INTEGER DEFAULT 0,
          budget DECIMAL(10,2),
          start_date DATE,
          end_date DATE,
          quote_id VARCHAR(50),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `)
      console.log('✅ Projects table ready')

      // Create invoices table if it doesn't exist
      await client.query(`
        CREATE TABLE IF NOT EXISTS invoices (
          id SERIAL PRIMARY KEY,
          invoice_number VARCHAR(50) UNIQUE,
          customer_id UUID,
          quote_id VARCHAR(50),
          amount DECIMAL(10,2),
          description TEXT,
          due_date DATE,
          line_items JSONB,
          tax_rate DECIMAL(5,2) DEFAULT 0,
          tax_amount DECIMAL(10,2) DEFAULT 0,
          total_amount DECIMAL(10,2),
          currency VARCHAR(3) DEFAULT 'GBP',
          notes TEXT,
          status VARCHAR(50) DEFAULT 'pending',
          payment_date DATE,
          payment_method VARCHAR(100),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `)
      console.log('✅ Invoices table ready')

      // Check if customers table exists, if not create it
      const customerTableExists = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' AND table_name = 'customers'
        )
      `)

      if (!customerTableExists.rows[0].exists) {
        await client.query(`
          CREATE TABLE customers (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            first_name VARCHAR(100) NOT NULL,
            last_name VARCHAR(100) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            password_hash VARCHAR(255),
            company VARCHAR(255),
            phone VARCHAR(50),
            address TEXT,
            website VARCHAR(255),
            job_title VARCHAR(100),
            industry VARCHAR(100),
            company_size VARCHAR(50),
            timezone VARCHAR(50),
            preferred_contact VARCHAR(50),
            linkedin VARCHAR(255),
            twitter VARCHAR(255),
            bio TEXT,
            country VARCHAR(100),
            city VARCHAR(100),
            postal_code VARCHAR(20),
            vat_number VARCHAR(50),
            business_type VARCHAR(100),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `)
        console.log('✅ Customers table created')
      } else {
        console.log('✅ Customers table already exists')
      }

      return NextResponse.json({
        success: true,
        message: 'All admin tables initialized successfully'
      })
      
    } finally {
      client.release()
    }
    
  } catch (error) {
    console.error('❌ Database table initialization failed:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
