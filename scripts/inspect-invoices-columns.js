const { Pool } = require('pg');

(async () => {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://freelance_user:freelance_password_2024@localhost:5434/freelance_website',
  });

  try {
    const res = await pool.query(
      `SELECT column_name, data_type
       FROM information_schema.columns
       WHERE table_name = 'invoices'
       ORDER BY ordinal_position`
    );
    console.log(res.rows);
  } catch (err) {
    console.error('Error inspecting columns:', err);
  } finally {
    await pool.end();
  }
})();
