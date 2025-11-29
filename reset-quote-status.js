const { Pool } = require('pg');

async function resetQuoteStatus() {
  const pool = new Pool({
    connectionString: 'postgresql://freelance_user:freelance_password_2024@localhost:5434/freelance_website'
  });

  try {
    console.log('Connecting to database...');
    const client = await pool.connect();
    
    // First, let's see what quotes we have
    console.log('Current quotes:');
    const result = await client.query('SELECT quote_id, status, name FROM quotes ORDER BY created_at DESC LIMIT 5');
    console.table(result.rows);
    
    // Update any quotes with status 'approved' back to 'under_review'
    const updateResult = await client.query(
      "UPDATE quotes SET status = 'under_review' WHERE status = 'approved' RETURNING quote_id, status, name"
    );
    
    console.log('\nUpdated quotes:');
    console.table(updateResult.rows);
    
    // Also clean up any invoices and projects created for testing
    console.log('\nCleaning up test invoices and projects...');
    
    const deleteInvoices = await client.query(
      "DELETE FROM invoices WHERE quote_id IN (SELECT quote_id FROM quotes WHERE status = 'under_review') RETURNING invoice_id"
    );
    console.log('Deleted invoices:', deleteInvoices.rows.length);
    
    const deleteProjects = await client.query(
      "DELETE FROM projects WHERE quote_id IN (SELECT quote_id FROM quotes WHERE status = 'under_review') RETURNING project_id"
    );
    console.log('Deleted projects:', deleteProjects.rows.length);
    
    client.release();
    console.log('✅ Quote status reset and cleanup completed');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
  }
}

resetQuoteStatus();
