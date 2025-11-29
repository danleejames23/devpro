const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://freelance_user:freelance_password_2024@localhost:5434/freelance_website'
});

(async () => {
  const client = await pool.connect();
  try {
    // Find Thomas by email or full name
    const customerRes = await client.query(
      "SELECT id, first_name, last_name, email FROM customers WHERE email = $1 OR (first_name || ' ' || last_name) ILIKE $2 LIMIT 1",
      ['test@gmail.com', 'Thomas Porter']
    );

    if (customerRes.rows.length === 0) {
      console.log('No customer found for Thomas Porter / test@gmail.com');
      return;
    }

    const customerId = customerRes.rows[0].id;
    console.log('Thomas customer_id:', customerId);

    const before = await client.query(
      'SELECT id, status, deposit_paid, amount, due_date FROM invoices WHERE customer_id = $1 ORDER BY created_at DESC',
      [customerId]
    );
    console.log('Invoices before update:', before.rows);

    const update = await client.query(
      "UPDATE invoices SET status='pending', deposit_paid = FALSE, paid_date = NULL, updated_at = CURRENT_TIMESTAMP WHERE customer_id = $1 RETURNING id, status, deposit_paid",
      [customerId]
    );

    if (update.rowCount === 0) {
      console.log('No invoices updated for Thomas (none exist yet).');
    } else {
      console.log('Invoices after update:', update.rows);
    }
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    try { client.release(); } catch {}
    await pool.end();
  }
})();
