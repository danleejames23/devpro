const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://freelance_user:freelance_password_2024@localhost:5434/freelance_website'
});

async function testApprovalFlow() {
  const client = await pool.connect();
  try {
    console.log('🔍 Testing approval flow step by step...\n');

    // Step 1: Find Thomas's quote
    console.log('Step 1: Finding Thomas Porter\'s quote...');
    const quoteRes = await client.query(`
      SELECT id, quote_id, customer_id, name, email, estimated_cost, description, status
      FROM quotes 
      WHERE email = $1 OR name ILIKE $2
      ORDER BY created_at DESC LIMIT 1
    `, ['test@gmail.com', 'Thomas Porter']);

    if (quoteRes.rows.length === 0) {
      console.log('❌ No quote found for Thomas Porter');
      return;
    }

    const quote = quoteRes.rows[0];
    console.log('✅ Found quote:', {
      id: quote.quote_id || quote.id,
      status: quote.status,
      cost: quote.estimated_cost
    });

    // Step 2: Test quote update
    console.log('\nStep 2: Testing quote approval...');
    const updateRes = await client.query(`
      UPDATE quotes SET status = 'approved', updated_at = CURRENT_TIMESTAMP
      WHERE quote_id::text = $1 OR id::text = $1
      RETURNING id, quote_id, status
    `, [quote.quote_id || quote.id]);
    
    if (updateRes.rows.length > 0) {
      console.log('✅ Quote approved successfully:', updateRes.rows[0]);
    } else {
      console.log('❌ Failed to approve quote');
      return;
    }

    // Step 3: Test invoice creation
    console.log('\nStep 3: Testing invoice creation...');
    const amount = parseFloat(quote.estimated_cost) || 0;
    const dueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    
    const lineItems = [
      {
        description: quote.description || 'Project services',
        quantity: 1,
        rate: amount,
        total: amount
      }
    ];

    try {
      const invoiceRes = await client.query(`
        INSERT INTO invoices (customer_id, amount, status, created_at, due_date, line_items)
        VALUES ($1, $2, 'pending', CURRENT_TIMESTAMP, $3, $4)
        RETURNING id, amount, status
      `, [quote.customer_id, amount, dueDate, JSON.stringify(lineItems)]);
      
      console.log('✅ Invoice created successfully:', invoiceRes.rows[0]);
    } catch (invoiceError) {
      console.log('❌ Invoice creation failed:', invoiceError.message);
      return;
    }

    // Step 4: Test project creation
    console.log('\nStep 4: Testing project creation...');
    const projectName = `Project: ${(quote.description || '').slice(0, 50)}...`;
    const startDate = new Date().toISOString().slice(0, 10);
    const endDate = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

    try {
      const projectRes = await client.query(`
        INSERT INTO projects (
          name, client, customer_id, description, status, progress, budget,
          start_date, end_date, quote_id, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, 'pending', 0, $5,
          $6, $7, $8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        ) RETURNING id, name, status
      `, [
        projectName,
        quote.name,
        quote.customer_id,
        quote.description || '',
        amount,
        startDate,
        endDate,
        quote.quote_id || quote.id
      ]);
      
      console.log('✅ Project created successfully:', projectRes.rows[0]);
    } catch (projectError) {
      console.log('❌ Project creation failed:', projectError.message);
      return;
    }

    console.log('\n🎉 All steps completed successfully!');

  } catch (error) {
    console.error('❌ Error in approval flow:', error.message);
  } finally {
    try { client.release(); } catch {}
    await pool.end();
  }
}

testApprovalFlow();
