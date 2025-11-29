// Migration script to add quote_id to existing quotes
import { getDatabase } from './database'

export async function migrateQuoteIds() {
  console.log('🔄 Starting quote ID migration...')
  const client = await getDatabase()
  
  try {
    // First, check if there are quotes without quote_id
    const checkResult = await client.query(
      'SELECT id, quote_id FROM quotes WHERE quote_id IS NULL OR quote_id = \'\''
    )
    
    console.log(`Found ${checkResult.rows.length} quotes without quote_id`)
    
    if (checkResult.rows.length === 0) {
      console.log('✅ All quotes already have quote_id')
      return
    }
    
    // Update each quote without a quote_id
    for (const quote of checkResult.rows) {
      const newQuoteId = `QT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
      
      await client.query(
        'UPDATE quotes SET quote_id = $1 WHERE id = $2',
        [newQuoteId, quote.id]
      )
      
      console.log(`✅ Updated quote ${quote.id} with quote_id: ${newQuoteId}`)
      
      // Small delay to ensure unique timestamps
      await new Promise(resolve => setTimeout(resolve, 1))
    }
    
    console.log('✅ Quote ID migration completed successfully')
    
  } catch (error) {
    console.error('❌ Error during quote ID migration:', error)
    throw error
  } finally {
    client.release()
  }
}

// Function to check quote_id status
export async function checkQuoteIdStatus() {
  console.log('🔍 Checking quote ID status...')
  const client = await getDatabase()
  
  try {
    const result = await client.query(`
      SELECT 
        COUNT(*) as total_quotes,
        COUNT(quote_id) as quotes_with_id,
        COUNT(*) - COUNT(quote_id) as quotes_without_id
      FROM quotes
    `)
    
    const stats = result.rows[0]
    console.log('📊 Quote ID Statistics:')
    console.log(`  Total quotes: ${stats.total_quotes}`)
    console.log(`  Quotes with ID: ${stats.quotes_with_id}`)
    console.log(`  Quotes without ID: ${stats.quotes_without_id}`)
    
    if (stats.quotes_without_id > 0) {
      console.log('⚠️  Some quotes are missing quote_id')
      
      // Show sample quotes without IDs
      const sampleResult = await client.query(
        'SELECT id, name, email, created_at FROM quotes WHERE quote_id IS NULL OR quote_id = \'\' LIMIT 5'
      )
      
      console.log('📝 Sample quotes without quote_id:')
      sampleResult.rows.forEach(quote => {
        console.log(`  - ID: ${quote.id}, Name: ${quote.name}, Email: ${quote.email}`)
      })
    }
    
    return stats
    
  } catch (error) {
    console.error('❌ Error checking quote ID status:', error)
    throw error
  } finally {
    client.release()
  }
}
