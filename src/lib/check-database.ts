// Database schema verification script
import { getDatabase } from './database'

export async function checkDatabaseSchema() {
  console.log('🔍 Checking database schema...')
  const client = await getDatabase()
  
  try {
    // Check if tables exist
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `)
    
    console.log('📋 Existing tables:')
    const tables = tablesResult.rows.map(row => row.table_name)
    tables.forEach(table => console.log(`  - ${table}`))
    
    // Check customers table structure
    if (tables.includes('customers')) {
      const customersColumns = await client.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'customers' 
        ORDER BY ordinal_position
      `)
      
      console.log('👥 Customers table structure:')
      customersColumns.rows.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`)
      })
    }
    
    // Check quotes table structure
    if (tables.includes('quotes')) {
      const quotesColumns = await client.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'quotes' 
        ORDER BY ordinal_position
      `)
      
      console.log('💼 Quotes table structure:')
      quotesColumns.rows.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`)
      })
      
      // Check if quote_id column exists in quotes table
      const hasQuoteId = quotesColumns.rows.some(col => col.column_name === 'quote_id')
      if (!hasQuoteId) {
        console.log('⚠️  WARNING: quote_id column is missing from quotes table!')
        return { hasQuoteIdColumn: false, tables, error: 'Missing quote_id column' }
      }
      
      // Check customer table columns for profile fields
      const customersColumns = await client.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'customers' 
        ORDER BY ordinal_position
      `)
      
      const requiredCustomerColumns = [
        'phone', 'address', 'website', 'job_title', 'industry', 'company_size',
        'timezone', 'preferred_contact', 'linkedin', 'twitter', 'bio',
        'avatar', 'country', 'city', 'postal_code', 'vat_number', 'business_type'
      ]
      
      const missingCustomerColumns = requiredCustomerColumns.filter(col => 
        !customersColumns.rows.some(dbCol => dbCol.column_name === col)
      )
      
      if (missingCustomerColumns.length > 0) {
        console.log('⚠️  WARNING: Missing customer profile columns:', missingCustomerColumns)
        return { 
          hasQuoteIdColumn: true, 
          hasCustomerProfileColumns: false,
          missingCustomerColumns,
          tables, 
          error: 'Missing customer profile columns' 
        }
      }
    }
    
    // Test database connection with a simple query
    const testResult = await client.query('SELECT NOW() as current_time')
    console.log('✅ Database connection test successful:', testResult.rows[0].current_time)
    
    return { 
      hasQuoteIdColumn: true, 
      hasCustomerProfileColumns: true,
      tables, 
      connectionWorking: true 
    }
    
  } catch (error) {
    console.error('❌ Database schema check failed:', error)
    return { 
      hasQuoteIdColumn: false, 
      hasCustomerProfileColumns: false,
      tables: [], 
      connectionWorking: false, 
      error: (error as Error).message 
    }
  } finally {
    client.release()
  }
}

export async function createMissingTables() {
  console.log('🔨 Creating missing database tables...')
  const client = await getDatabase()
  
  try {
    // Create customers table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS customers (
        id SERIAL PRIMARY KEY,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        company VARCHAR(255),
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    console.log('✅ Customers table ready')
    
    // Add missing customer profile columns
    const customerProfileColumns = [
      { name: 'phone', type: 'VARCHAR(50)' },
      { name: 'address', type: 'TEXT' },
      { name: 'website', type: 'VARCHAR(500)' },
      { name: 'job_title', type: 'VARCHAR(100)' },
      { name: 'industry', type: 'VARCHAR(100)' },
      { name: 'company_size', type: 'VARCHAR(50)' },
      { name: 'timezone', type: 'VARCHAR(50)' },
      { name: 'preferred_contact', type: 'VARCHAR(50)' },
      { name: 'linkedin', type: 'VARCHAR(500)' },
      { name: 'twitter', type: 'VARCHAR(500)' },
      { name: 'bio', type: 'TEXT' },
      { name: 'avatar', type: 'VARCHAR(500)' },
      { name: 'country', type: 'VARCHAR(100)' },
      { name: 'city', type: 'VARCHAR(100)' },
      { name: 'postal_code', type: 'VARCHAR(20)' },
      { name: 'vat_number', type: 'VARCHAR(50)' },
      { name: 'business_type', type: 'VARCHAR(50)' }
    ]
    
    for (const column of customerProfileColumns) {
      try {
        await client.query(`
          ALTER TABLE customers 
          ADD COLUMN IF NOT EXISTS ${column.name} ${column.type}
        `)
        console.log(`✅ Added customers.${column.name} column`)
      } catch (error) {
        console.log(`⚠️  Could not add ${column.name} column (may already exist):`, (error as Error).message)
      }
    }
    
    // Create quotes table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS quotes (
        id SERIAL PRIMARY KEY,
        quote_id VARCHAR(50) UNIQUE,
        customer_id INTEGER REFERENCES customers(id),
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        company VARCHAR(255),
        description TEXT NOT NULL,
        estimated_cost DECIMAL(10,2) NOT NULL,
        estimated_timeline VARCHAR(100) NOT NULL,
        rush_delivery VARCHAR(20) DEFAULT 'standard',
        selected_package JSONB,
        status VARCHAR(20) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    console.log('✅ Quotes table ready')
    
    // Add quote_id column if it doesn't exist
    await client.query(`
      ALTER TABLE quotes 
      ADD COLUMN IF NOT EXISTS quote_id VARCHAR(50) UNIQUE
    `)
    console.log('✅ Quote ID column ready')
    
    // Create notifications table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
        type VARCHAR(50) NOT NULL CHECK (type IN ('quote_status', 'message', 'project_update', 'billing', 'system', 'invoice')),
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        metadata JSONB,
        action_url VARCHAR(500),
        priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent'))
      )
    `)
    console.log('✅ Notifications table ready')
    
    // Create notification_preferences table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS notification_preferences (
        customer_id UUID PRIMARY KEY REFERENCES customers(id) ON DELETE CASCADE,
        email_notifications BOOLEAN DEFAULT TRUE,
        push_notifications BOOLEAN DEFAULT TRUE,
        quote_updates BOOLEAN DEFAULT TRUE,
        message_notifications BOOLEAN DEFAULT TRUE,
        billing_notifications BOOLEAN DEFAULT TRUE,
        project_updates BOOLEAN DEFAULT TRUE,
        system_notifications BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    console.log('✅ Notification preferences table ready')
    
    // Create indexes for performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_notifications_customer_id ON notifications(customer_id)
    `)
    console.log('✅ Notifications index ready')
    
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC)
    `)
    console.log('✅ Notifications timestamp index ready')
    
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(customer_id, is_read) WHERE is_read = FALSE
    `)
    console.log('✅ Unread notifications index ready')
    
    console.log('✅ Database schema setup completed')
    return { success: true }
    
  } catch (error) {
    console.error('❌ Failed to create tables:', error)
    return { success: false, error: (error as Error).message }
  } finally {
    client.release()
  }
}
