const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://freelance_user:freelance_password_2024@localhost:5434/freelance_website',
  connectionTimeoutMillis: 5000
});

async function checkStatus() {
  try {
    const client = await pool.connect();
    
    console.log('Current quote statuses:');
    const result = await client.query('SELECT quote_id, status, name FROM quotes ORDER BY created_at DESC LIMIT 10');
    console.table(result.rows);
    
    client.release();
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkStatus();
