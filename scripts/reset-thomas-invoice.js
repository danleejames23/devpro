const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://freelance_user:freelance_password_2024@localhost:5434/freelance_website'
});

(async () => {
  const client = await pool.connect();
  try {
    // Find Thomas's customer ID
    const customerRes = await client.query(
      "SELECT id FROM customers WHERE email = $1 OR (first_name || ' ' || last_name) ILIKE $2",
      ['test@gmail.com', 'Thomas Porter']
    );

    if (customerRes.rows.length === 0) {
      console.log('❌ Thomas Porter not found');
      return;
    }

    const customerId = customerRes.rows[0].id;
    console.log('Thomas customer_id:', customerId);

    // Reset his invoices to unpaid state
    const result = await client.query(`
      UPDATE invoices 
      SET 
        status = 'pending',
        deposit_paid = FALSE,
        paid_date = NULL,
        updated_at = CURRENT_TIMESTAMP
      WHERE customer_id = $1
      RETURNING id, amount, status, deposit_paid, deposit_amount
    `, [customerId]);

    if (result.rowCount === 0) {
      console.log('❌ No invoices found to reset');
    } else {
      console.log('✅ Reset invoices:');
      result.rows.forEach(invoice => {
        console.log(`- Invoice ${invoice.id}: $${invoice.amount}, deposit: $${invoice.deposit_amount}, deposit_paid: ${invoice.deposit_paid}`);
      });
    }

  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    try { client.release(); } catch {}
    await pool.end();
  }
})();
