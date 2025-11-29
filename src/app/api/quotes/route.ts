import { NextRequest, NextResponse } from 'next/server'
import { createCustomer, getCustomerByEmail, getQuotesByCustomerId } from '@/lib/database'
import { createQuote } from '@/lib/database'
import bcrypt from 'bcryptjs'

function generateQuoteId(): string {
  return `QT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

// POST /api/quotes - Create new quote and customer account
export async function POST(request: NextRequest) {
  try {
    console.log('Quote creation API called')
    const quoteData = await request.json()
    console.log('Quote data received:', quoteData)
    console.log('📦 Package data debug:', {
      hasSelectedPackage: !!quoteData.selectedPackage,
      selectedPackage: quoteData.selectedPackage,
      packageType: typeof quoteData.selectedPackage,
      packageKeys: quoteData.selectedPackage ? Object.keys(quoteData.selectedPackage) : 'none'
    })
    
    let customer
    let tempPassword = ''
    
    // Enforce required project name
    if (!quoteData.projectName || String(quoteData.projectName).trim().length < 2) {
      return NextResponse.json(
        { success: false, error: 'Project name is required' },
        { status: 400 }
      )
    }

    if (quoteData.customerId) {
      console.log('Existing customer flow')
      // User is logged in, get existing customer
      customer = await getCustomerByEmail(quoteData.email)
      if (!customer) {
        console.log('Customer not found for email:', quoteData.email)
        return NextResponse.json(
          { success: false, error: 'Customer not found' },
          { status: 404 }
        )
      }
      console.log('Found existing customer:', customer.id)
    } else {
      console.log('New customer flow')
      // New user, create customer account
      if (!quoteData.password) {
        console.log('Password missing for new account')
        return NextResponse.json(
          { success: false, error: 'Password is required for new accounts' },
          { status: 400 }
        )
      }
      
      console.log('Creating new customer account')
      // Hash password
      const hashedPassword = await bcrypt.hash(quoteData.password, 10)
      
      customer = await createCustomer({
        first_name: quoteData.name.split(' ')[0] || quoteData.name,
        last_name: quoteData.name.split(' ').slice(1).join(' ') || '',
        email: quoteData.email,
        company: quoteData.company,
        password_hash: hashedPassword
      })
      
      console.log('Created customer:', customer.id)
      tempPassword = quoteData.password // Return original password for email
    }
    
    console.log('Creating quote for customer:', customer.id)
    // Create quote
    console.log('💾 Sending to createQuote:', {
      selected_package: quoteData.selectedPackage,
      estimated_cost: quoteData.estimatedCost,
      estimated_timeline: quoteData.estimatedTimeline
    })
    
    const quote = await createQuote({
      customer_id: customer.id,
      name: quoteData.name,
      email: quoteData.email,
      company: quoteData.company,
      project_name: quoteData.projectName,
      description: quoteData.description,
      estimated_cost: quoteData.estimatedCost,
      estimated_timeline: quoteData.estimatedTimeline,
      rush_delivery: quoteData.rushDelivery,
      selected_package: quoteData.selectedPackage
    })
    
    console.log('Created quote:', quote.quote_id)
    
    return NextResponse.json({
      success: true,
      quote: {
        id: quote.quote_id, // Use human-readable quote_id
        customerId: quote.customer_id,
        name: quote.name,
        email: quote.email,
        company: quote.company,
        projectName: (quote as any).project_name,
        description: quote.description,
        estimatedCost: quote.estimated_cost,
        estimatedTimeline: quote.estimated_timeline,
        rushDelivery: quote.rush_delivery,
        selectedPackage: quote.selected_package,
        status: 'pending',
        createdAt: quote.created_at,
        updatedAt: quote.updated_at
      },
      customer: {
        id: customer.id,
        name: `${customer.first_name} ${customer.last_name}`,
        email: customer.email,
        company: customer.company,
        createdAt: customer.created_at
      },
      tempPassword
    })
    
  } catch (error) {
    console.error('Error creating quote:', error)
    console.error('Error stack:', (error as Error).stack)
    return NextResponse.json(
      { success: false, error: `Internal server error: ${(error as Error).message}` },
      { status: 500 }
    )
  }
}

// GET /api/quotes - Get quotes for a customer
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 GET quotes API called')
    const { searchParams } = new URL(request.url)
    const customerId = searchParams.get('customerId')
    console.log('🔍 Customer ID:', customerId)
    
    if (!customerId) {
      console.log('❌ No customer ID provided')
      return NextResponse.json(
        { success: false, error: 'Customer ID is required' },
        { status: 400 }
      )
    }
    
    console.log('📊 Fetching quotes for customer:', customerId)
    const quotes = await getQuotesByCustomerId(customerId)
    console.log('📊 Raw quotes from database:', quotes)
    console.log('📊 Number of quotes found:', quotes?.length || 0)
    
    // Transform database fields to frontend format
    console.log('🔄 Starting quote transformation...')
    const transformedQuotes = quotes.map((quote, index) => {
      try {
        console.log(`🔄 Transforming quote ${index + 1}:`, { id: quote.id, quote_id: quote.quote_id })
        const pkg = typeof (quote as any).selected_package === 'string'
          ? JSON.parse((quote as any).selected_package)
          : (quote as any).selected_package
        const features = Array.isArray(pkg?.features)
          ? pkg.features
          : Array.isArray(pkg?.services)
            ? pkg.services
            : Array.isArray(pkg?.includes)
              ? pkg.includes
              : Array.isArray(pkg?.items)
                ? pkg.items
                : []
        return {
          id: quote.quote_id || `TEMP-${quote.id}`, // Use quote_id or fallback to temp ID
          customerId: quote.customer_id,
          name: quote.name,
          email: quote.email,
          company: quote.company,
          projectName: (quote as any).project_name,
          description: quote.description,
          estimatedCost: quote.estimated_cost,
          estimatedTimeline: quote.estimated_timeline,
          rushDelivery: quote.rush_delivery,
          selectedPackage: pkg,
          selectedFeatures: features,
          complexity: pkg?.complexity,
          status: quote.status,
          createdAt: quote.created_at,
          updatedAt: quote.updated_at
        }
      } catch (transformError) {
        console.error(`❌ Error transforming quote ${index + 1}:`, transformError)
        console.error('❌ Problematic quote data:', quote)
        throw transformError
      }
    })
    
    console.log('✅ Transformed quotes successfully:', transformedQuotes.length)
    
    return NextResponse.json({
      success: true,
      quotes: transformedQuotes
    })
    
  } catch (error) {
    console.error('❌ Error in GET quotes API:', error)
    console.error('❌ Error stack:', (error as Error).stack)
    console.error('❌ Error message:', (error as Error).message)
    return NextResponse.json(
      { success: false, error: `Internal server error: ${(error as Error).message}` },
      { status: 500 }
    )
  }
}
