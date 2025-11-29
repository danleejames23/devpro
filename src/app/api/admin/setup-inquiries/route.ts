import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/database'

export async function POST(request: NextRequest) {
  try {
    const client = await getDatabase()

    try {
      // Check if inquiries table already exists
      const tableCheck = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'inquiries'
        );
      `)

      if (tableCheck.rows[0].exists) {
        return NextResponse.json({
          success: true,
          message: 'Inquiries table already exists'
        })
      }

      // Create inquiries table
      await client.query(`
        CREATE TABLE inquiries (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          inquiry_id VARCHAR(50) UNIQUE NOT NULL,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) NOT NULL,
          subject VARCHAR(500) NOT NULL,
          message TEXT NOT NULL,
          project_type VARCHAR(50),
          status VARCHAR(20) DEFAULT 'new',
          priority VARCHAR(20) DEFAULT 'normal',
          assigned_to VARCHAR(255),
          notes TEXT,
          follow_up_date TIMESTAMP WITH TIME ZONE,
          contacted_at TIMESTAMP WITH TIME ZONE,
          read_at TIMESTAMP WITH TIME ZONE,
          converted_to_quote_id UUID,
          source VARCHAR(50) DEFAULT 'contact_form',
          ip_address INET,
          user_agent TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `)

      // Create indexes
      await client.query(`
        CREATE INDEX idx_inquiries_status ON inquiries(status);
      `)
      await client.query(`
        CREATE INDEX idx_inquiries_created_at ON inquiries(created_at DESC);
      `)
      await client.query(`
        CREATE INDEX idx_inquiries_email ON inquiries(email);
      `)
      await client.query(`
        CREATE INDEX idx_inquiries_inquiry_id ON inquiries(inquiry_id);
      `)

      // Create function to generate inquiry ID
      await client.query(`
        CREATE OR REPLACE FUNCTION generate_inquiry_id()
        RETURNS TEXT AS $$
        DECLARE
          year_part TEXT;
          sequence_num INTEGER;
          inquiry_id TEXT;
        BEGIN
          year_part := EXTRACT(YEAR FROM CURRENT_DATE)::TEXT;
          
          SELECT COALESCE(MAX(CAST(SUBSTRING(inquiry_id FROM 'INQ-' || year_part || '-(\\d+)') AS INTEGER)), 0) + 1
          INTO sequence_num
          FROM inquiries
          WHERE inquiry_id LIKE 'INQ-' || year_part || '-%';
          
          inquiry_id := 'INQ-' || year_part || '-' || LPAD(sequence_num::TEXT, 3, '0');
          
          RETURN inquiry_id;
        END;
        $$ LANGUAGE plpgsql;
      `)

      // Create trigger function
      await client.query(`
        CREATE OR REPLACE FUNCTION set_inquiry_id()
        RETURNS TRIGGER AS $$
        BEGIN
          IF NEW.inquiry_id IS NULL OR NEW.inquiry_id = '' THEN
            NEW.inquiry_id := generate_inquiry_id();
          END IF;
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
      `)

      // Create trigger
      await client.query(`
        CREATE TRIGGER trigger_set_inquiry_id
          BEFORE INSERT ON inquiries
          FOR EACH ROW
          EXECUTE FUNCTION set_inquiry_id();
      `)

      // Create update timestamp trigger function
      await client.query(`
        CREATE OR REPLACE FUNCTION update_inquiry_timestamp()
        RETURNS TRIGGER AS $$
        BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
      `)

      // Create update timestamp trigger
      await client.query(`
        CREATE TRIGGER trigger_update_inquiry_timestamp
          BEFORE UPDATE ON inquiries
          FOR EACH ROW
          EXECUTE FUNCTION update_inquiry_timestamp();
      `)

      console.log('✅ Inquiries table and functions created successfully')

      return NextResponse.json({
        success: true,
        message: 'Inquiries table created successfully'
      })

    } finally {
      client.release()
    }

  } catch (error) {
    console.error('❌ Error setting up inquiries table:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to setup inquiries table',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
