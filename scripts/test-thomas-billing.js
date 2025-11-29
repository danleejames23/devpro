const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://freelance_user:freelance_password_2024@localhost:5434/freelance_website'
});

async function testThomasBilling() {
  const client = await pool.connect();
  try {
    console.log('🔍 Testing Thomas Porter billing...\n');

    // Step 1: Find Thomas's customer ID
    const customerRes = await client.query(`
      SELECT id, first_name, last_name, email 
      FROM customers 
      WHERE email = $1 OR (first_name || ' ' || last_name) ILIKE $2
    `, ['test@gmail.com', 'Thomas Porter']);

    if (customerRes.rows.length === 0) {
      console.log('❌ Thomas Porter not found in customers table');
      return;
    }

    const customer = customerRes.rows[0];
    console.log('✅ Found Thomas:', {
      id: customer.id,
      name: `${customer.first_name} ${customer.last_name}`,
      email: customer.email
    });

    // Step 2: Check for approved quotes
    const quotesRes = await client.query(`
      SELECT id, quote_id, status, estimated_cost, description
      FROM quotes 
      WHERE customer_id = $1 AND status IN ('approved', 'accepted', 'quoted')
    `, [customer.id]);

    console.log('\n📋 Approved quotes for Thomas:');
    if (quotesRes.rows.length === 0) {
      console.log('❌ No approved quotes found');
    } else {
      quotesRes.rows.forEach(quote => {
        console.log(`- Quote ${quote.quote_id}: ${quote.status}, $${quote.estimated_cost}`);
      });
    }

    // Step 3: Check existing invoices
    const invoicesRes = await client.query(`
      SELECT id, customer_id, amount, status, deposit_paid, deposit_amount, remaining_amount, created_at
      FROM invoices 
      WHERE customer_id = $1
      ORDER BY created_at DESC
    `, [customer.id]);

    console.log('\n💰 Existing invoices for Thomas:');
    if (invoicesRes.rows.length === 0) {
      console.log('❌ No invoices found');
    } else {
      invoicesRes.rows.forEach(invoice => {
        console.log(`- Invoice ${invoice.id}: $${invoice.amount}, status: ${invoice.status}, deposit_paid: ${invoice.deposit_paid}`);
      });
    }

    // Step 4: Test the resolveInvoiceIdHelper logic
    console.log('\n🔍 Testing invoice resolution logic...');
    const candidates = invoicesRes.rows.filter(inv => inv.status !== 'paid' && !inv.deposit_paid);
    console.log('Candidates for payment:', candidates.length);
    
    if (candidates.length > 0) {
      const latest = candidates.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()).pop();
      console.log('✅ Latest payable invoice:', {
        id: latest.id,
        amount: latest.amount,
        deposit_amount: latest.deposit_amount
      });
    } else {
      console.log('❌ No payable invoices found');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    try { client.release(); } catch {}
    await pool.end();
  }
}

testThomasBilling();
