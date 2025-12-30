// Production database layer with PostgreSQL (works with Supabase, Neon, or any PostgreSQL provider)
import { Pool, PoolClient } from 'pg'

// Database connection pool
let pool: Pool | null = null

export function getPool(): Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL || 'postgresql://freelance_user:freelance_password_2024@localhost:5434/freelance_website'
    
    // Detect if we're using a cloud PostgreSQL provider (Supabase, Neon, etc.)
    const isCloudDatabase = connectionString.includes('supabase.co') || 
                            connectionString.includes('neon.tech') || 
                            connectionString.includes('pooler.supabase.com') ||
                            process.env.NODE_ENV === 'production'
    
    pool = new Pool({
      connectionString,
      ssl: isCloudDatabase ? { rejectUnauthorized: false } : false,
      max: isCloudDatabase ? 3 : 20, // Very low pool size for serverless (Netlify functions)
      min: 0, // No minimum connections
      idleTimeoutMillis: isCloudDatabase ? 10000 : 30000, // Shorter idle timeout for serverless
      connectionTimeoutMillis: 8000, // Faster timeout
      allowExitOnIdle: true, // Allow pool to close when idle (important for serverless)
    })
    
    pool.on('error', (err: Error) => {
      console.error('Unexpected error on idle client', err)
    })
    
    console.log('✅ PostgreSQL connection pool created', isCloudDatabase ? '(cloud mode)' : '(local mode)')
  }
  
  return pool
}

export async function getDatabase(): Promise<PoolClient> {
  const pool = getPool()
  return await pool.connect()
}

// Test database connection
export async function testConnection(): Promise<boolean> {
  try {
    const client = await getDatabase()
    await client.query('SELECT NOW()')
    client.release()
    console.log('✅ Database connection successful')
    return true
  } catch (error) {
    console.error('❌ Database connection failed:', error)
    return false
  }
}

// Database operations interfaces
export interface Customer {
  id: string
  first_name: string
  last_name: string
  email: string
  company?: string
  password_hash: string
  created_at: string
  updated_at: string
  phone?: string
  address?: string
  website?: string
  job_title?: string
  industry?: string
  business_type?: string
  company_size?: string
  vat_number?: string
  country?: string
  city?: string
  postal_code?: string
  timezone?: string
  linkedin?: string
  twitter?: string
  bio?: string
  preferred_contact?: string
}

export interface Notification {
  id: string
  customer_id: string
  type: 'quote_status' | 'message' | 'project_update' | 'billing' | 'system' | 'invoice'
  title: string
  message: string
  is_read: boolean
  created_at: string
  updated_at: string
  metadata?: Record<string, any>
  action_url?: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
}

export interface NotificationPreferences {
  customer_id: string
  email_notifications: boolean
  push_notifications: boolean
  quote_updates: boolean
  message_notifications: boolean
  billing_notifications: boolean
  project_updates: boolean
  system_notifications: boolean
}

export interface Quote {
  id: string
  quote_id: string
  customer_id: string
  name: string
  email: string
  company?: string
  project_name?: string
  description: string
  estimated_cost: number
  estimated_timeline: string
  rush_delivery: 'standard' | 'priority' | 'express'
  selected_package?: any
  status: 'pending' | 'under_review' | 'quoted' | 'accepted' | 'in_progress' | 'completed' | 'cancelled'
  created_at: string
  updated_at: string
}

// Customer operations
export async function getAllCustomers(): Promise<Customer[]> {
  const client = await getDatabase()
  
  try {
    const result = await client.query(
      'SELECT * FROM customers ORDER BY created_at DESC'
    )
    
    return result.rows
  } finally {
    client.release()
  }
}

export async function createCustomer(customerData: {
  first_name: string
  last_name: string
  email: string
  company?: string
  password_hash: string
}): Promise<Customer> {
  console.log('createCustomer called with:', { ...customerData, password_hash: '[REDACTED]' })
  const client = await getDatabase()
  
  try {
    console.log('Executing customer insert query')
    const result = await client.query(
      `INSERT INTO customers (first_name, last_name, email, company, password_hash) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [customerData.first_name, customerData.last_name, customerData.email, customerData.company, customerData.password_hash]
    )
    
    console.log('Customer created successfully:', result.rows[0].id)
    return result.rows[0]
  } finally {
    client.release()
  }
}

export async function getCustomerByEmail(email: string): Promise<Customer | null> {
  const client = await getDatabase()
  
  try {
    const result = await client.query(
      'SELECT * FROM customers WHERE email = $1',
      [email]
    )
    
    return result.rows[0] || null
  } finally {
    client.release()
  }
}

export async function getCustomerById(id: string): Promise<Customer | null> {
  const client = await getDatabase()
  
  try {
    const result = await client.query(
      'SELECT * FROM customers WHERE id = $1',
      [id]
    )
    
    return result.rows[0] || null
  } finally {
    client.release()
  }
}

export async function updateCustomer(id: string, updateData: {
  first_name?: string
  last_name?: string
  email?: string
  company?: string
  phone?: string
  address?: string
  website?: string
  job_title?: string
  industry?: string
  company_size?: string
  timezone?: string
  preferred_contact?: string
  linkedin?: string
  twitter?: string
  bio?: string
  avatar?: string
  country?: string
  city?: string
  postal_code?: string
  vat_number?: string
  business_type?: string
}): Promise<Customer | null> {
  console.log('Updating customer:', id, updateData)
  const client = await getDatabase()
  
  try {
    // Build dynamic update query
    const updateFields: string[] = []
    const updateValues: any[] = []
    let paramIndex = 1
    
    Object.entries(updateData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        updateFields.push(`${key} = $${paramIndex}`)
        updateValues.push(value)
        paramIndex++
      }
    })
    
    if (updateFields.length === 0) {
      console.log('No fields to update')
      return await getCustomerById(id)
    }
    
    updateValues.push(id) // Add id for WHERE clause
    
    const query = `
      UPDATE customers 
      SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $${paramIndex} 
      RETURNING *
    `
    
    console.log('Executing update query:', query)
    console.log('Update values:', updateValues)
    
    const result = await client.query(query, updateValues)
    
    console.log('Updated customer:', result.rows[0])
    return result.rows[0] || null
  } finally {
    client.release()
  }
}

// Quote operations
export async function createQuote(quoteData: {
  customer_id: string
  name: string
  email: string
  company?: string
  project_name?: string
  description: string
  estimated_cost: number
  estimated_timeline: string
  rush_delivery?: string
  selected_package?: any
}): Promise<Quote> {
  console.log('createQuote called with:', quoteData)
  console.log('📦 Database createQuote package debug:', {
    hasPackage: !!quoteData.selected_package,
    packageData: quoteData.selected_package,
    willStringify: quoteData.selected_package ? JSON.stringify(quoteData.selected_package) : 'null'
  })
  const client = await getDatabase()
  
  try {
    // Generate human-readable quote ID
    const quoteId = `QT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
    console.log('Generated quote ID:', quoteId)
    
    // Ensure project_name column exists (idempotent)
    try {
      await client.query(`ALTER TABLE quotes ADD COLUMN IF NOT EXISTS project_name TEXT`)
    } catch (colErr) {
      console.warn('⚠️ Could not ensure quotes.project_name column:', (colErr as Error).message)
    }
    console.log('Executing quote insert query')
    let result
    try {
      // Try insert including project_name column
      result = await client.query(
        `INSERT INTO quotes (quote_id, customer_id, name, email, company, project_name, description, estimated_cost, estimated_timeline, rush_delivery, selected_package, status) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'pending') 
         RETURNING *`,
        [
          quoteId, quoteData.customer_id, quoteData.name, quoteData.email, quoteData.company,
          quoteData.project_name || null,
          quoteData.description, quoteData.estimated_cost, quoteData.estimated_timeline,
          quoteData.rush_delivery || 'standard', JSON.stringify(quoteData.selected_package)
        ]
      )
    } catch (insertErr) {
      console.warn('⚠️ Insert with project_name failed, falling back:', (insertErr as Error).message)
      // Fallback insert without project_name if column not present
      result = await client.query(
        `INSERT INTO quotes (quote_id, customer_id, name, email, company, description, estimated_cost, estimated_timeline, rush_delivery, selected_package, status) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'pending') 
         RETURNING *`,
        [
          quoteId, quoteData.customer_id, quoteData.name, quoteData.email, quoteData.company,
          quoteData.description, quoteData.estimated_cost, quoteData.estimated_timeline,
          quoteData.rush_delivery || 'standard', JSON.stringify(quoteData.selected_package)
        ]
      )
    }
    
    const createdQuote = result.rows[0]
    console.log('Quote created successfully:', createdQuote.quote_id)
    console.log('💾 Stored quote package data:', {
      stored_selected_package: createdQuote.selected_package,
      type: typeof createdQuote.selected_package
    })
    return createdQuote
  } finally {
    client.release()
  }
}

export async function getQuotesByCustomerId(customerId: string): Promise<Quote[]> {
  const client = await getDatabase()
  
  try {
    const result = await client.query(
      'SELECT * FROM quotes WHERE customer_id = $1 ORDER BY created_at DESC',
      [customerId]
    )
    
    return result.rows
  } finally {
    client.release()
  }
}

export async function getAllQuotes(): Promise<Quote[]> {
  const client = await getDatabase()
  
  try {
    const result = await client.query(
      'SELECT * FROM quotes ORDER BY created_at DESC'
    )
    
    return result.rows
  } finally {
    client.release()
  }
}

export async function updateQuoteStatus(quoteId: string, status: string): Promise<Quote | null> {
  const client = await getDatabase()
  
  try {
    console.log('Updating quote status:', { quoteId, status })
    
    let result
    
    // Check if this is a temporary ID (TEMP-xxx format)
    if (quoteId.startsWith('TEMP-')) {
      const actualId = quoteId.replace('TEMP-', '')
      console.log('Detected temporary ID, using actual ID:', actualId)
      
      result = await client.query(
        'UPDATE quotes SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
        [status, actualId]
      )
      console.log('Update by actual id result:', result.rows.length, 'rows affected')
    } else {
      // First try to update by quote_id
      result = await client.query(
        'UPDATE quotes SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE quote_id = $2 RETURNING *',
        [status, quoteId]
      )
      
      console.log('Update by quote_id result:', result.rows.length, 'rows affected')
      
      // If no rows affected, try updating by id (for older quotes)
      if (result.rows.length === 0) {
        console.log('No rows found by quote_id, trying by id')
        result = await client.query(
          'UPDATE quotes SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
          [status, quoteId]
        )
        console.log('Update by id result:', result.rows.length, 'rows affected')
      }
    }
    
    const updatedQuote = result.rows[0] || null
    console.log('Final updated quote:', updatedQuote)
    return updatedQuote
  } finally {
    client.release()
  }
}

// Close database connection
export async function closeDatabase() {
  if (pool) {
    await pool.end()
    pool = null
    console.log('✅ Database connection pool closed')
  }
}

// File management interfaces
export interface ProjectFile {
  id: string
  customer_id: string
  project_id?: string
  parent_id?: string
  name: string
  type: 'folder' | 'file'
  size: number
  mime_type?: string
  is_shared: boolean
  download_url?: string
  thumbnail_url?: string
  uploaded_at: string
  modified_at: string
}

export interface GitHubRepository {
  id: string
  customer_id: string
  project_id?: string
  name: string
  github_url: string
  status: 'active' | 'completed' | 'in_progress' | 'archived'
  last_commit_date?: string
  commit_count: number
  is_private: boolean
  description?: string
  created_at: string
  updated_at: string
}

// File operations
export async function createProjectFile(fileData: {
  customer_id: string
  project_id?: string
  parent_id?: string
  name: string
  type: 'folder' | 'file'
  size?: number
  mime_type?: string
  is_shared?: boolean
  download_url?: string
  thumbnail_url?: string
}): Promise<ProjectFile> {
  const client = await getDatabase()
  
  try {
    const result = await client.query(
      `INSERT INTO project_files (customer_id, project_id, parent_id, name, type, size, mime_type, is_shared, download_url, thumbnail_url) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
       RETURNING *`,
      [
        fileData.customer_id, fileData.project_id, fileData.parent_id, fileData.name, fileData.type,
        fileData.size || 0, fileData.mime_type, fileData.is_shared || false,
        fileData.download_url, fileData.thumbnail_url
      ]
    )
    
    return result.rows[0]
  } finally {
    client.release()
  }
}

export async function getProjectFilesByCustomerId(customerId: string, projectId?: string): Promise<ProjectFile[]> {
  const client = await getDatabase()
  
  try {
    let query = 'SELECT * FROM project_files WHERE customer_id = $1'
    const params: any[] = [customerId]
    
    if (projectId) {
      query += ' AND project_id = $2'
      params.push(projectId)
    }
    
    query += ' ORDER BY type ASC, name ASC' // Folders first, then alphabetically
    
    const result = await client.query(query, params)
    return result.rows
  } finally {
    client.release()
  }
}

export async function updateProjectFile(id: string, updates: Partial<ProjectFile>): Promise<ProjectFile | null> {
  const client = await getDatabase()
  
  try {
    const setClause = Object.keys(updates).map((key, index) => `${key} = $${index + 2}`).join(', ')
    const values = Object.values(updates)
    
    const result = await client.query(
      `UPDATE project_files SET ${setClause}, modified_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
      [id, ...values]
    )
    
    return result.rows[0] || null
  } finally {
    client.release()
  }
}

export async function deleteProjectFile(id: string): Promise<boolean> {
  const client = await getDatabase()
  
  try {
    const result = await client.query('DELETE FROM project_files WHERE id = $1', [id])
    return (result.rowCount ?? 0) > 0
  } finally {
    client.release()
  }
}

export async function getFileStats(customerId: string): Promise<{
  totalFiles: number
  totalSize: number
  sharedFiles: number
  totalFolders: number
}> {
  const client = await getDatabase()
  
  try {
    const result = await client.query(
      `SELECT 
         COUNT(CASE WHEN type = 'file' THEN 1 END) as total_files,
         COALESCE(SUM(CASE WHEN type = 'file' THEN size ELSE 0 END), 0) as total_size,
         COUNT(CASE WHEN type = 'file' AND is_shared = true THEN 1 END) as shared_files,
         COUNT(CASE WHEN type = 'folder' THEN 1 END) as total_folders
       FROM project_files 
       WHERE customer_id = $1`,
      [customerId]
    )
    
    const stats = result.rows[0]
    return {
      totalFiles: parseInt(stats.total_files),
      totalSize: parseInt(stats.total_size),
      sharedFiles: parseInt(stats.shared_files),
      totalFolders: parseInt(stats.total_folders)
    }
  } finally {
    client.release()
  }
}

// GitHub repository operations
export async function createGitHubRepository(repoData: {
  customer_id: string
  project_id?: string
  name: string
  github_url: string
  status?: 'active' | 'completed' | 'in_progress' | 'archived'
  last_commit_date?: string
  commit_count?: number
  is_private?: boolean
  description?: string
}): Promise<GitHubRepository> {
  const client = await getDatabase()
  
  try {
    const result = await client.query(
      `INSERT INTO github_repositories (customer_id, project_id, name, github_url, status, last_commit_date, commit_count, is_private, description) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
       RETURNING *`,
      [
        repoData.customer_id, repoData.project_id, repoData.name, repoData.github_url,
        repoData.status || 'active', repoData.last_commit_date, repoData.commit_count || 0,
        repoData.is_private || false, repoData.description
      ]
    )
    
    return result.rows[0]
  } finally {
    client.release()
  }
}

export async function getGitHubRepositoriesByCustomerId(customerId: string): Promise<GitHubRepository[]> {
  const client = await getDatabase()
  
  try {
    const result = await client.query(
      'SELECT * FROM github_repositories WHERE customer_id = $1 ORDER BY created_at DESC',
      [customerId]
    )
    
    return result.rows
  } finally {
    client.release()
  }
}

export async function updateGitHubRepository(id: string, updates: Partial<GitHubRepository>): Promise<GitHubRepository | null> {
  const client = await getDatabase()
  
  try {
    const setClause = Object.keys(updates).map((key, index) => `${key} = $${index + 2}`).join(', ')
    const values = Object.values(updates)
    
    const result = await client.query(
      `UPDATE github_repositories SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
      [id, ...values]
    )
    
    return result.rows[0] || null
  } finally {
    client.release()
  }
}

export async function deleteGitHubRepository(id: string): Promise<boolean> {
  const client = await getDatabase()
  
  try {
    const result = await client.query('DELETE FROM github_repositories WHERE id = $1', [id])
    return (result.rowCount ?? 0) > 0
  } finally {
    client.release()
  }
}

// Billing interfaces
export interface PaymentMethod {
  id: string
  customer_id: string
  type: 'visa' | 'mastercard' | 'amex' | 'paypal'
  last4: string
  expiry_month: number
  expiry_year: number
  is_default: boolean
  created_at: string
}

export interface Invoice {
  id: string
  customer_id: string
  project_id?: string
  project_name: string
  amount: number
  status: 'paid' | 'pending' | 'overdue' | 'cancelled'
  issue_date: string
  due_date: string
  paid_date?: string
  items: InvoiceItem[]
  created_at: string
  updated_at: string
}

export interface InvoiceItem {
  description: string
  quantity: number
  unit_price: number
  total: number
}

export interface BillingSettings {
  id: string
  customer_id: string
  email_invoices: boolean
  auto_pay_enabled: boolean
  billing_address?: {
    street: string
    city: string
    state: string
    postal_code: string
    country: string
  }
  tax_id?: string
  created_at: string
  updated_at: string
}

// Payment method operations
export async function createPaymentMethod(paymentData: {
  customer_id: string
  type: 'visa' | 'mastercard' | 'amex' | 'paypal'
  last4: string
  expiry_month: number
  expiry_year: number
  is_default?: boolean
}): Promise<PaymentMethod> {
  const client = await getDatabase()
  
  try {
    // If this is set as default, unset other default methods
    if (paymentData.is_default) {
      await client.query(
        'UPDATE payment_methods SET is_default = false WHERE customer_id = $1',
        [paymentData.customer_id]
      )
    }

    const result = await client.query(
      `INSERT INTO payment_methods (customer_id, type, last4, expiry_month, expiry_year, is_default) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [
        paymentData.customer_id, paymentData.type, paymentData.last4,
        paymentData.expiry_month, paymentData.expiry_year, paymentData.is_default || false
      ]
    )
    
    return result.rows[0]
  } finally {
    client.release()
  }
}

export async function getPaymentMethodsByCustomerId(customerId: string): Promise<PaymentMethod[]> {
  const client = await getDatabase()
  
  try {
    const result = await client.query(
      'SELECT * FROM payment_methods WHERE customer_id = $1 ORDER BY created_at DESC',
      [customerId]
    )
    
    return result.rows
  } finally {
    client.release()
  }
}

export async function updatePaymentMethod(id: string, updates: Partial<PaymentMethod>): Promise<PaymentMethod | null> {
  const client = await getDatabase()
  
  try {
    const setClause = Object.keys(updates).map((key, index) => `${key} = $${index + 2}`).join(', ')
    const values = Object.values(updates)
    
    const result = await client.query(
      `UPDATE payment_methods SET ${setClause} WHERE id = $1 RETURNING *`,
      [id, ...values]
    )
    
    return result.rows[0] || null
  } finally {
    client.release()
  }
}

export async function deletePaymentMethod(id: string): Promise<boolean> {
  const client = await getDatabase()
  
  try {
    const result = await client.query('DELETE FROM payment_methods WHERE id = $1', [id])
    return (result.rowCount ?? 0) > 0
  } finally {
    client.release()
  }
}

// Invoice operations
export async function createInvoice(invoiceData: {
  customer_id: string
  project_id?: string
  project_name: string
  amount: number
  status?: 'paid' | 'pending' | 'overdue' | 'cancelled'
  issue_date: string
  due_date: string
  paid_date?: string
  items: InvoiceItem[]
}): Promise<Invoice> {
  const client = await getDatabase()
  
  try {
    const result = await client.query(
      `INSERT INTO invoices (id, customer_id, project_id, project_name, amount, status, issue_date, due_date, paid_date, items) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
       RETURNING *`,
      [
        `INV-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        invoiceData.customer_id, invoiceData.project_id, invoiceData.project_name,
        invoiceData.amount, invoiceData.status || 'pending',
        invoiceData.issue_date, invoiceData.due_date, invoiceData.paid_date,
        JSON.stringify(invoiceData.items)
      ]
    )
    
    return result.rows[0]
  } finally {
    client.release()
  }
}

export async function getInvoicesByCustomerId(customerId: string): Promise<Invoice[]> {
  const client = await getDatabase()
  
  try {
    const result = await client.query(
      'SELECT * FROM invoices WHERE customer_id = $1 ORDER BY created_at DESC',
      [customerId]
    )
    
    return result.rows.map(row => ({
      ...row,
      items: typeof row.items === 'string' ? JSON.parse(row.items) : row.items
    }))
  } finally {
    client.release()
  }
}

export async function updateInvoice(id: string, updates: Partial<Invoice>): Promise<Invoice | null> {
  const client = await getDatabase()
  
  try {
    const updateData: any = { ...updates }
    if (updateData.items) {
      updateData.items = JSON.stringify(updateData.items)
    }
    
    const setClause = Object.keys(updateData).map((key, index) => `${key} = $${index + 2}`).join(', ')
    const values = Object.values(updateData)
    
    const result = await client.query(
      `UPDATE invoices SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
      [id, ...values]
    )
    
    const invoice = result.rows[0]
    if (invoice) {
      invoice.items = typeof invoice.items === 'string' ? JSON.parse(invoice.items) : invoice.items
    }
    
    return invoice
  } finally {
    client.release()
  }
}

export async function deleteInvoice(id: string): Promise<boolean> {
  const client = await getDatabase()
  
  try {
    const result = await client.query('DELETE FROM invoices WHERE id = $1', [id])
    return (result.rowCount ?? 0) > 0
  } finally {
    client.release()
  }
}

// Billing settings operations
export async function getBillingSettingsByCustomerId(customerId: string): Promise<BillingSettings | null> {
  const client = await getDatabase()
  
  try {
    const result = await client.query(
      'SELECT * FROM billing_settings WHERE customer_id = $1',
      [customerId]
    )
    
    return result.rows[0] || null
  } finally {
    client.release()
  }
}

export async function createOrUpdateBillingSettings(settingsData: {
  customer_id: string
  email_invoices?: boolean
  auto_pay_enabled?: boolean
  billing_address?: {
    street: string
    city: string
    state: string
    postal_code: string
    country: string
  }
  tax_id?: string
}): Promise<BillingSettings> {
  const client = await getDatabase()
  
  try {
    // Check if settings already exist
    const existing = await client.query(
      'SELECT id FROM billing_settings WHERE customer_id = $1',
      [settingsData.customer_id]
    )
    
    if (existing.rows.length > 0) {
      // Update existing settings
      const result = await client.query(
        `UPDATE billing_settings 
         SET email_invoices = COALESCE($2, email_invoices), 
             auto_pay_enabled = COALESCE($3, auto_pay_enabled), 
             billing_address = COALESCE($4, billing_address), 
             tax_id = COALESCE($5, tax_id), 
             updated_at = CURRENT_TIMESTAMP 
         WHERE customer_id = $1 
         RETURNING *`,
        [
          settingsData.customer_id,
          settingsData.email_invoices,
          settingsData.auto_pay_enabled,
          settingsData.billing_address ? JSON.stringify(settingsData.billing_address) : null,
          settingsData.tax_id
        ]
      )
      
      const settings = result.rows[0]
      if (settings.billing_address) {
        settings.billing_address = JSON.parse(settings.billing_address)
      }
      
      return settings
    } else {
      // Create new settings
      const result = await client.query(
        `INSERT INTO billing_settings (customer_id, email_invoices, auto_pay_enabled, billing_address, tax_id) 
         VALUES ($1, $2, $3, $4, $5) 
         RETURNING *`,
        [
          settingsData.customer_id,
          settingsData.email_invoices ?? true,
          settingsData.auto_pay_enabled ?? false,
          settingsData.billing_address ? JSON.stringify(settingsData.billing_address) : null,
          settingsData.tax_id
        ]
      )
      
      const settings = result.rows[0]
      if (settings.billing_address) {
        settings.billing_address = JSON.parse(settings.billing_address)
      }
      
      return settings
    }
  } finally {
    client.release()
  }
}

// Billing stats
export async function getBillingStats(customerId: string): Promise<{
  totalSpent: number
  outstanding: number
  nextPaymentAmount: number
  nextPaymentDate: string | null
}> {
  const client = await getDatabase()
  
  try {
    const invoices = await getInvoicesByCustomerId(customerId)
    
    const totalSpent = invoices
      .filter(inv => inv.status === 'paid')
      .reduce((sum, inv) => sum + inv.amount, 0)
    
    const outstanding = invoices
      .filter(inv => inv.status === 'pending' || inv.status === 'overdue')
      .reduce((sum, inv) => sum + inv.amount, 0)
    
    const nextPendingInvoice = invoices
      .filter(inv => inv.status === 'pending')
      .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())[0]
    
    return {
      totalSpent,
      outstanding,
      nextPaymentAmount: nextPendingInvoice?.amount || 0,
      nextPaymentDate: nextPendingInvoice?.due_date || null
    }
  } finally {
    client.release()
  }
}

// ==================== NOTIFICATION SYSTEM ====================

// Create notification
export async function createNotification(notification: Omit<Notification, 'id' | 'created_at' | 'updated_at'>): Promise<Notification> {
  const client = await getDatabase()
  
  try {
    const result = await client.query(
      `INSERT INTO notifications (
        customer_id, type, title, message, is_read, 
        metadata, action_url, priority
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
      [
        notification.customer_id,
        notification.type,
        notification.title,
        notification.message,
        notification.is_read,
        notification.metadata ? JSON.stringify(notification.metadata) : null,
        notification.action_url,
        notification.priority
      ]
    )
    
    const createdNotification = result.rows[0]
    if (createdNotification.metadata) {
      createdNotification.metadata = JSON.parse(createdNotification.metadata)
    }
    
    return createdNotification
  } finally {
    client.release()
  }
}

// Get notifications for customer
export async function getNotificationsByCustomerId(customerId: string, limit = 50, offset = 0): Promise<Notification[]> {
  const client = await getDatabase()
  
  try {
    const result = await client.query(
      `SELECT * FROM notifications 
       WHERE customer_id = $1 
       ORDER BY created_at DESC 
       LIMIT $2 OFFSET $3`,
      [customerId, limit, offset]
    )
    
    return result.rows.map(notification => {
      if (notification.metadata) {
        notification.metadata = JSON.parse(notification.metadata)
      }
      return notification
    })
  } finally {
    client.release()
  }
}

// Get unread notification count
export async function getUnreadNotificationCount(customerId: string): Promise<number> {
  const client = await getDatabase()
  
  try {
    const result = await client.query(
      'SELECT COUNT(*) FROM notifications WHERE customer_id = $1 AND is_read = false',
      [customerId]
    )
    
    return parseInt(result.rows[0].count)
  } finally {
    client.release()
  }
}

// Mark notification as read
export async function markNotificationAsRead(notificationId: string, customerId: string): Promise<boolean> {
  const client = await getDatabase()
  
  try {
    const result = await client.query(
      'UPDATE notifications SET is_read = true, updated_at = CURRENT_TIMESTAMP WHERE id = $1 AND customer_id = $2',
      [notificationId, customerId]
    )
    
    return (result.rowCount || 0) > 0
  } finally {
    client.release()
  }
}

// Mark all notifications as read
export async function markAllNotificationsAsRead(customerId: string): Promise<number> {
  const client = await getDatabase()
  
  try {
    const result = await client.query(
      'UPDATE notifications SET is_read = true, updated_at = CURRENT_TIMESTAMP WHERE customer_id = $1 AND is_read = false',
      [customerId]
    )
    
    return result.rowCount || 0
  } finally {
    client.release()
  }
}

// Delete notification
export async function deleteNotification(notificationId: string, customerId: string): Promise<boolean> {
  const client = await getDatabase()
  
  try {
    const result = await client.query(
      'DELETE FROM notifications WHERE id = $1 AND customer_id = $2',
      [notificationId, customerId]
    )
    
    return (result.rowCount || 0) > 0
  } finally {
    client.release()
  }
}

// Get notification preferences
export async function getNotificationPreferences(customerId: string): Promise<NotificationPreferences | null> {
  const client = await getDatabase()
  
  try {
    const result = await client.query(
      'SELECT * FROM notification_preferences WHERE customer_id = $1',
      [customerId]
    )
    
    return result.rows[0] || null
  } finally {
    client.release()
  }
}

// Update notification preferences
export async function updateNotificationPreferences(customerId: string, preferences: Partial<NotificationPreferences>): Promise<NotificationPreferences> {
  const client = await getDatabase()
  
  try {
    // Check if preferences exist
    const existing = await client.query(
      'SELECT customer_id FROM notification_preferences WHERE customer_id = $1',
      [customerId]
    )
    
    if (existing.rows.length === 0) {
      // Create new preferences
      const result = await client.query(
        `INSERT INTO notification_preferences (
          customer_id, email_notifications, push_notifications,
          quote_updates, message_notifications, billing_notifications,
          project_updates, system_notifications
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *`,
        [
          customerId,
          preferences.email_notifications ?? true,
          preferences.push_notifications ?? true,
          preferences.quote_updates ?? true,
          preferences.message_notifications ?? true,
          preferences.billing_notifications ?? true,
          preferences.project_updates ?? true,
          preferences.system_notifications ?? false
        ]
      )
      
      return result.rows[0]
    } else {
      // Update existing preferences
      const updateFields: string[] = []
      const updateValues: any[] = []
      let paramIndex = 1
      
      if (preferences.email_notifications !== undefined) {
        updateFields.push(`email_notifications = $${paramIndex++}`)
        updateValues.push(preferences.email_notifications)
      }
      if (preferences.push_notifications !== undefined) {
        updateFields.push(`push_notifications = $${paramIndex++}`)
        updateValues.push(preferences.push_notifications)
      }
      if (preferences.quote_updates !== undefined) {
        updateFields.push(`quote_updates = $${paramIndex++}`)
        updateValues.push(preferences.quote_updates)
      }
      if (preferences.message_notifications !== undefined) {
        updateFields.push(`message_notifications = $${paramIndex++}`)
        updateValues.push(preferences.message_notifications)
      }
      if (preferences.billing_notifications !== undefined) {
        updateFields.push(`billing_notifications = $${paramIndex++}`)
        updateValues.push(preferences.billing_notifications)
      }
      if (preferences.project_updates !== undefined) {
        updateFields.push(`project_updates = $${paramIndex++}`)
        updateValues.push(preferences.project_updates)
      }
      if (preferences.system_notifications !== undefined) {
        updateFields.push(`system_notifications = $${paramIndex++}`)
        updateValues.push(preferences.system_notifications)
      }
      
      updateValues.push(customerId)
      
      const result = await client.query(
        `UPDATE notification_preferences SET ${updateFields.join(', ')} WHERE customer_id = $${paramIndex} RETURNING *`,
        updateValues
      )
      
      return result.rows[0]
    }
  } finally {
    client.release()
  }
}

// Create notification helper functions for different types
export async function createQuoteStatusNotification(customerId: string, quoteId: string, status: string, quoteTitle?: string): Promise<Notification> {
  const statusMessages = {
    pending: 'Your quote is being reviewed',
    quoted: 'Your quote is ready to view',
    accepted: 'Your quote has been accepted!',
    rejected: 'Your quote was not accepted',
    in_progress: 'Work has started on your project',
    completed: 'Your project has been completed!'
  }
  
  return await createNotification({
    customer_id: customerId,
    type: 'quote_status',
    title: `Quote Update: ${status.charAt(0).toUpperCase() + status.slice(1)}`,
    message: statusMessages[status as keyof typeof statusMessages] || `Your quote status has been updated to ${status}`,
    is_read: false,
    action_url: `/client/dashboard?tab=quotes`,
    priority: status === 'quoted' ? 'high' : 'medium',
    metadata: { quoteId, status, quoteTitle }
  })
}

export async function createMessageNotification(customerId: string, messageCount: number = 1): Promise<Notification> {
  return await createNotification({
    customer_id: customerId,
    type: 'message',
    title: 'New Message',
    message: `You have ${messageCount} new message${messageCount > 1 ? 's' : ''} from the development team`,
    is_read: false,
    action_url: `/client/dashboard?tab=messages`,
    priority: 'medium',
    metadata: { messageCount }
  })
}

export async function createBillingNotification(customerId: string, amount: number, dueDate: string, invoiceId?: string): Promise<Notification> {
  return await createNotification({
    customer_id: customerId,
    type: 'billing',
    title: 'Payment Due',
    message: `A payment of £${amount.toFixed(2)} is due by ${new Date(dueDate).toLocaleDateString()}`,
    is_read: false,
    action_url: `/client/dashboard?tab=billing`,
    priority: 'high',
    metadata: { amount, dueDate, invoiceId }
  })
}

export async function createInvoiceNotification(customerId: string, invoiceId: string, amount: number): Promise<Notification> {
  return await createNotification({
    customer_id: customerId,
    type: 'invoice',
    title: 'New Invoice',
    message: `A new invoice for £${amount.toFixed(2)} has been generated`,
    is_read: false,
    action_url: `/client/dashboard?tab=billing`,
    priority: 'medium',
    metadata: { invoiceId, amount }
  })
}

export async function createProjectUpdateNotification(customerId: string, projectId: string, update: string): Promise<Notification> {
  return await createNotification({
    customer_id: customerId,
    type: 'project_update',
    title: 'Project Update',
    message: update,
    is_read: false,
    action_url: `/client/dashboard?tab=projects`,
    priority: 'medium',
    metadata: { projectId, update }
  })
}

export async function createSystemNotification(customerId: string, title: string, message: string, priority: 'low' | 'medium' | 'high' | 'urgent' = 'low'): Promise<Notification> {
  return await createNotification({
    customer_id: customerId,
    type: 'system',
    title,
    message,
    is_read: false,
    priority,
    metadata: {}
  })
}
