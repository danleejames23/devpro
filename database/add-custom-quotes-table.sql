-- Custom Quotes table for enterprise/large project requests
CREATE TABLE custom_quotes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    
    -- Contact Information (for new users who register during submission)
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    company VARCHAR(255),
    
    -- Project Details
    project_type VARCHAR(100) NOT NULL, -- e.g., 'enterprise_web_app', 'saas', 'ecommerce', 'ai_solution', 'other'
    project_title VARCHAR(255) NOT NULL,
    project_description TEXT NOT NULL,
    
    -- Requirements
    features TEXT[], -- Array of required features
    integrations TEXT[], -- Third-party integrations needed
    target_audience TEXT,
    competitors TEXT, -- Reference websites/apps
    
    -- Technical Requirements
    preferred_tech_stack TEXT,
    hosting_preference VARCHAR(100),
    has_existing_system BOOLEAN DEFAULT false,
    existing_system_details TEXT,
    
    -- Timeline & Budget
    preferred_timeline VARCHAR(100), -- e.g., '1-2 months', '3-6 months', 'flexible'
    budget_range VARCHAR(100), -- e.g., '1500-3000', '3000-5000', '5000-10000', '10000+'
    
    -- Additional Info
    additional_notes TEXT,
    attachments JSONB, -- Array of file URLs/references
    
    -- Admin Response
    status VARCHAR(50) DEFAULT 'pending', -- pending, reviewing, quoted, approved, rejected
    admin_notes TEXT,
    quoted_price DECIMAL(10,2),
    quoted_timeline VARCHAR(100),
    reviewed_by UUID REFERENCES admin_users(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    
    -- Resulting quote/project (when approved)
    resulting_quote_id UUID REFERENCES quotes(id),
    resulting_project_id UUID REFERENCES projects(id),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_custom_quotes_customer_id ON custom_quotes(customer_id);
CREATE INDEX idx_custom_quotes_status ON custom_quotes(status);
CREATE INDEX idx_custom_quotes_email ON custom_quotes(email);

-- Create trigger for updated_at
CREATE TRIGGER update_custom_quotes_updated_at BEFORE UPDATE ON custom_quotes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
