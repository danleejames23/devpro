const { Pool } = require('pg')

const pool = new Pool({
  connectionString: 'postgresql://freelance_user:freelance_password_2024@localhost:5434/freelance_website',
  ssl: false
})

async function setupMessaging() {
  const client = await pool.connect()
  
  try {
    console.log('🚀 Setting up messaging system...')
    
    // Create messages table
    await client.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        customer_id INTEGER NOT NULL,
        sender_type VARCHAR(10) NOT NULL CHECK (sender_type IN ('client', 'admin')),
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        read_at TIMESTAMP NULL,
        FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
      )
    `)
    
    // Create indexes for better performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_messages_customer_id ON messages(customer_id)
    `)
    
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at)
    `)
    
    console.log('✅ Messages table created successfully!')
    console.log('✅ Messaging system setup complete!')
    
  } catch (error) {
    console.error('❌ Error setting up messaging:', error)
  } finally {
    client.release()
    await pool.end()
  }
}

setupMessaging()
