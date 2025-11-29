-- Add inquiries table for contact form submissions
-- This table stores project inquiries from the contact page

CREATE TABLE inquiries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    inquiry_id VARCHAR(50) UNIQUE NOT NULL, -- Human-readable ID like INQ-2024-001
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(500) NOT NULL,
    message TEXT NOT NULL,
    project_type VARCHAR(50), -- website, webapp, ai, mobile, ecommerce, other
    status VARCHAR(20) DEFAULT 'new', -- new, contacted, in_progress, converted, closed
    priority VARCHAR(20) DEFAULT 'normal', -- low, normal, high, urgent
    assigned_to VARCHAR(255), -- Admin who is handling this inquiry
    notes TEXT, -- Internal admin notes
    follow_up_date TIMESTAMP WITH TIME ZONE,
    contacted_at TIMESTAMP WITH TIME ZONE,
    converted_to_quote_id UUID, -- Reference to quotes table if converted
    source VARCHAR(50) DEFAULT 'contact_form', -- contact_form, phone, email, etc.
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster queries
CREATE INDEX idx_inquiries_status ON inquiries(status);
CREATE INDEX idx_inquiries_created_at ON inquiries(created_at DESC);
CREATE INDEX idx_inquiries_email ON inquiries(email);
CREATE INDEX idx_inquiries_inquiry_id ON inquiries(inquiry_id);

-- Function to generate inquiry ID
CREATE OR REPLACE FUNCTION generate_inquiry_id()
RETURNS TEXT AS $$
DECLARE
    year_part TEXT;
    sequence_num INTEGER;
    inquiry_id TEXT;
BEGIN
    year_part := EXTRACT(YEAR FROM CURRENT_DATE)::TEXT;
    
    -- Get the next sequence number for this year
    SELECT COALESCE(MAX(CAST(SUBSTRING(inquiry_id FROM 'INQ-' || year_part || '-(\d+)') AS INTEGER)), 0) + 1
    INTO sequence_num
    FROM inquiries
    WHERE inquiry_id LIKE 'INQ-' || year_part || '-%';
    
    inquiry_id := 'INQ-' || year_part || '-' || LPAD(sequence_num::TEXT, 3, '0');
    
    RETURN inquiry_id;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate inquiry_id
CREATE OR REPLACE FUNCTION set_inquiry_id()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.inquiry_id IS NULL OR NEW.inquiry_id = '' THEN
        NEW.inquiry_id := generate_inquiry_id();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_inquiry_id
    BEFORE INSERT ON inquiries
    FOR EACH ROW
    EXECUTE FUNCTION set_inquiry_id();

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_inquiry_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_inquiry_timestamp
    BEFORE UPDATE ON inquiries
    FOR EACH ROW
    EXECUTE FUNCTION update_inquiry_timestamp();
