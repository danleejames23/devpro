-- Add quote_id column to existing quotes table
ALTER TABLE quotes ADD COLUMN quote_id VARCHAR(50) UNIQUE;

-- Generate quote IDs for existing records
UPDATE quotes 
SET quote_id = 'QT-' || EXTRACT(EPOCH FROM created_at)::bigint || '-' || substr(md5(id::text), 1, 8)
WHERE quote_id IS NULL;

-- Make the column NOT NULL after populating it
ALTER TABLE quotes ALTER COLUMN quote_id SET NOT NULL;

-- Create index for better performance
CREATE INDEX idx_quotes_quote_id ON quotes(quote_id);
