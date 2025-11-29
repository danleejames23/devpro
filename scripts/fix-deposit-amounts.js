const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://freelance_user:freelance_password_2024@localhost:5434/freelance_website'
});

(async () => {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      UPDATE invoices 
      SET 
        deposit_amount = amount * 0.2, 
        remaining_amount = amount * 0.8 
      WHERE customer_id = (
        SELECT id FROM customers WHERE email = $1
      )
      RETURNING id, amount, deposit_amount, remaining_amount
    `, ['test@gmail.com']);
    
    console.log('✅ Updated invoice deposit amounts:');
    result.rows.forEach(inv => {
      console.log(`Invoice ${inv.id}: Total $${inv.amount}, Deposit $${inv.deposit_amount}, Remaining $${inv.remaining_amount}`);
    });
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    try { client.release(); } catch {}
    await pool.end();
  }
})();
