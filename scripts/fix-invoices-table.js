const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://freelance_user:freelance_password_2024@localhost:5434/freelance_website'
});

(async () => {
  const client = await pool.connect();
  try {
    console.log('Checking invoices table structure...');
    
    // Check current columns
    const cols = await client.query(`
      SELECT column_name, data_type FROM information_schema.columns 
      WHERE table_schema='public' AND table_name='invoices'
      ORDER BY ordinal_position
    `);
    
    console.log('Current columns:');
    console.table(cols.rows);
    
    // Add missing columns if they don't exist
    const columnNames = cols.rows.map(r => r.column_name);
    
    if (!columnNames.includes('items')) {
      console.log('Adding items column...');
      await client.query('ALTER TABLE invoices ADD COLUMN items JSONB DEFAULT \'[]\'');
      console.log('✅ Added items column');
    }
    
    if (!columnNames.includes('deposit_amount')) {
      console.log('Adding deposit_amount column...');
      await client.query('ALTER TABLE invoices ADD COLUMN deposit_amount DECIMAL(10,2) DEFAULT 0');
      console.log('✅ Added deposit_amount column');
    }
    
    if (!columnNames.includes('deposit_paid')) {
      console.log('Adding deposit_paid column...');
      await client.query('ALTER TABLE invoices ADD COLUMN deposit_paid BOOLEAN DEFAULT FALSE');
      console.log('✅ Added deposit_paid column');
    }
    
    if (!columnNames.includes('deposit_required')) {
      console.log('Adding deposit_required column...');
      await client.query('ALTER TABLE invoices ADD COLUMN deposit_required BOOLEAN DEFAULT TRUE');
      console.log('✅ Added deposit_required column');
    }
    
    if (!columnNames.includes('remaining_amount')) {
      console.log('Adding remaining_amount column...');
      await client.query('ALTER TABLE invoices ADD COLUMN remaining_amount DECIMAL(10,2) DEFAULT 0');
      console.log('✅ Added remaining_amount column');
    }
    
    // Check final structure
    const finalCols = await client.query(`
      SELECT column_name, data_type FROM information_schema.columns 
      WHERE table_schema='public' AND table_name='invoices'
      ORDER BY ordinal_position
    `);
    
    console.log('\nFinal table structure:');
    console.table(finalCols.rows);
    
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    try { client.release(); } catch {}
    await pool.end();
  }
})();
