const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://freelance_user:freelance_password_2024@localhost:5434/freelance_website'
});

async function updateQuote() {
  try {
    const client = await pool.connect();
    
    const result = await client.query(
      "UPDATE quotes SET status = 'pending' WHERE quote_id = 'QT-1762239393053-S287541DI' RETURNING quote_id, status, name"
    );
    
    console.log('Updated quote:');
    console.table(result.rows);
    
    client.release();
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

updateQuote();
