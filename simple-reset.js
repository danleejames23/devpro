const { Pool } = require('pg');

console.log('Starting reset script...');

const pool = new Pool({
  connectionString: 'postgresql://freelance_user:freelance_password_2024@localhost:5434/freelance_website',
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 5000
});

async function quickReset() {
  try {
    console.log('Connecting to database...');
    const client = await pool.connect();
    console.log('Connected!');
    
    const result = await client.query(
      "UPDATE quotes SET status = 'under_review' WHERE status = 'approved'"
    );
    console.log(`Updated ${result.rowCount} quotes`);
    
    client.release();
    console.log('✅ Done');
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

quickReset();
