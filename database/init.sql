-- Freelance Website Database Schema
-- This file initializes the PostgreSQL database with all required tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Customers table
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    company VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    website VARCHAR(255),
    job_title VARCHAR(100),
    industry VARCHAR(100),
    company_size VARCHAR(50),
    timezone VARCHAR(50),
    preferred_contact VARCHAR(20) DEFAULT 'email',
    linkedin VARCHAR(255),
    twitter VARCHAR(255),
    bio TEXT,
    avatar VARCHAR(255),
    country VARCHAR(100),
    city VARCHAR(100),
    postal_code VARCHAR(20),
    vat_number VARCHAR(50),
    business_type VARCHAR(50) DEFAULT 'individual',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Quotes table
CREATE TABLE quotes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quote_id VARCHAR(50) UNIQUE NOT NULL, -- Human-readable ID like QT-2024-001
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    company VARCHAR(255),
    description TEXT NOT NULL,
    estimated_cost DECIMAL(10,2) NOT NULL,
    estimated_timeline VARCHAR(50) NOT NULL,
    rush_delivery VARCHAR(20) DEFAULT 'standard',
    status VARCHAR(20) DEFAULT 'pending',
    selected_package JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Projects table (derived from accepted quotes)
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    quote_id UUID REFERENCES quotes(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'planning',
    start_date DATE,
    end_date DATE,
    actual_cost DECIMAL(10,2),
    github_repo VARCHAR(255),
    live_url VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Payment methods table
CREATE TABLE payment_methods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL, -- visa, mastercard, amex, paypal
    last4 VARCHAR(4) NOT NULL,
    expiry_month INTEGER NOT NULL,
    expiry_year INTEGER NOT NULL,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Invoices table
CREATE TABLE invoices (
    id VARCHAR(20) PRIMARY KEY, -- INV-2024-001 format
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    project_name VARCHAR(255) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- paid, pending, overdue, cancelled
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    paid_date DATE,
    items JSONB NOT NULL, -- Array of invoice items
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Billing settings table
CREATE TABLE billing_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID UNIQUE REFERENCES customers(id) ON DELETE CASCADE,
    email_invoices BOOLEAN DEFAULT true,
    auto_pay_enabled BOOLEAN DEFAULT false,
    billing_address JSONB,
    tax_id VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Project files table
CREATE TABLE project_files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES project_files(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(10) NOT NULL, -- folder, file
    size BIGINT DEFAULT 0,
    mime_type VARCHAR(100),
    is_shared BOOLEAN DEFAULT false,
    download_url VARCHAR(500),
    thumbnail_url VARCHAR(500),
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    modified_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- GitHub repositories table
CREATE TABLE github_repositories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    github_url TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'in_progress', 'archived')),
    last_commit_date TIMESTAMP,
    commit_count INTEGER DEFAULT 0,
    is_private BOOLEAN DEFAULT false,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- GitHub integrations table for OAuth tokens
CREATE TABLE github_integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE UNIQUE,
    github_user_id BIGINT NOT NULL,
    github_username VARCHAR(255) NOT NULL,
    access_token TEXT NOT NULL,
    github_data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Admin users table
CREATE TABLE admin_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'admin',
    permissions JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Messages/Communications table
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    sender_type VARCHAR(20) NOT NULL, -- customer, admin
    sender_id UUID NOT NULL,
    subject VARCHAR(255),
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Notifications table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_quotes_customer_id ON quotes(customer_id);
CREATE INDEX idx_quotes_status ON quotes(status);
CREATE INDEX idx_projects_customer_id ON projects(customer_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_invoices_customer_id ON invoices(customer_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_project_files_customer_id ON project_files(customer_id);
CREATE INDEX idx_project_files_project_id ON project_files(project_id);
CREATE INDEX idx_github_repositories_customer_id ON github_repositories(customer_id);
CREATE INDEX idx_messages_customer_id ON messages(customer_id);
CREATE INDEX idx_notifications_customer_id ON notifications(customer_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_quotes_updated_at BEFORE UPDATE ON quotes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_billing_settings_updated_at BEFORE UPDATE ON billing_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_project_files_updated_at BEFORE UPDATE ON project_files FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_github_repositories_updated_at BEFORE UPDATE ON github_repositories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_admin_users_updated_at BEFORE UPDATE ON admin_users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default admin user (password: admin123)
INSERT INTO admin_users (username, password_hash, permissions) VALUES 
('admin', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9qm', '["manage_quotes", "manage_customers", "view_analytics"]');

-- Insert sample data for testing (optional)
-- You can remove this section in production

-- Sample customers
INSERT INTO customers (first_name, last_name, email, password_hash, company, business_type) VALUES 
('John', 'Doe', 'john.doe@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9qm', 'Doe Enterprises', 'small_business'),
('Daniel', 'James', 'danleejames2023@gmail.com', '$2b$12$7ydCdzYpqpy62L5GuP.U7.mlXHxOK7ucMcuJKz0OpGR3ObtvyN3Em', 'Daniel James Consulting', 'individual');

-- Get the customer ID for sample data
DO $$
DECLARE
    sample_customer_id UUID;
    sample_project_id UUID;
BEGIN
    SELECT id INTO sample_customer_id FROM customers WHERE email = 'john.doe@example.com';
    
    -- Sample quote
    INSERT INTO quotes (customer_id, name, email, company, description, estimated_cost, estimated_timeline, status) VALUES 
    (sample_customer_id, 'John Doe', 'john.doe@example.com', 'Doe Enterprises', 'Need a business website with e-commerce functionality', 899.00, '7-10 days', 'accepted');
    
    -- Sample project
    INSERT INTO projects (customer_id, name, description, status, start_date) VALUES 
    (sample_customer_id, 'Doe Enterprises Website', 'Business website with e-commerce functionality', 'in_progress', CURRENT_DATE)
    RETURNING id INTO sample_project_id;
    
    -- Sample invoice
    INSERT INTO invoices (id, customer_id, project_id, project_name, amount, status, issue_date, due_date, items) VALUES 
    ('INV-2024-001', sample_customer_id, sample_project_id, 'Doe Enterprises Website', 899.00, 'paid', CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE - INTERVAL '15 days', '[{"description": "Business Website Development", "quantity": 1, "unitPrice": 899.00, "total": 899.00}]');
    
    -- Sample notification
    INSERT INTO notifications (customer_id, type, title, message) VALUES 
    (sample_customer_id, 'project_update', 'Project Started', 'Your website project has been started and is now in development.');
END $$;
