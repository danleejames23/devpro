import { NextRequest, NextResponse } from 'next/server'
import { updateCustomer, getCustomerById } from '@/lib/database'

// PUT /api/customers/[id] - Update customer profile
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    console.log('Customer update API called for ID:', id)
    const updateData = await request.json()
    console.log('Update data received:', updateData)
    
    // First check if customer exists
    const existingCustomer = await getCustomerById(id)
    if (!existingCustomer) {
      console.log('Customer not found:', id)
      return NextResponse.json(
        { success: false, error: 'Customer not found' },
        { status: 404 }
      )
    }
    
    // Update customer
    const updatedCustomer = await updateCustomer(id, updateData)
    
    if (!updatedCustomer) {
      console.log('Failed to update customer:', id)
      return NextResponse.json(
        { success: false, error: 'Failed to update customer' },
        { status: 500 }
      )
    }
    
    console.log('Customer updated successfully:', updatedCustomer.id)
    
    // Transform database fields to frontend format
    const transformedCustomer = {
      id: updatedCustomer.id,
      name: `${updatedCustomer.first_name} ${updatedCustomer.last_name}`.trim(),
      email: updatedCustomer.email,
      company: updatedCustomer.company,
      password: updatedCustomer.password_hash,
      createdAt: updatedCustomer.created_at,
      quotes: [], // Would need to fetch quotes separately if needed
      phone: updatedCustomer.phone,
      address: updatedCustomer.address,
      website: updatedCustomer.website,
      jobTitle: updatedCustomer.job_title,
      industry: updatedCustomer.industry,
      companySize: updatedCustomer.company_size,
      timezone: updatedCustomer.timezone,
      preferredContact: updatedCustomer.preferred_contact,
      linkedin: updatedCustomer.linkedin,
      twitter: updatedCustomer.twitter,
      bio: updatedCustomer.bio,
      country: updatedCustomer.country,
      city: updatedCustomer.city,
      postalCode: updatedCustomer.postal_code,
      vatNumber: updatedCustomer.vat_number,
      businessType: updatedCustomer.business_type
    }
    
    return NextResponse.json({
      success: true,
      customer: transformedCustomer
    })
    
  } catch (error) {
    console.error('Error updating customer:', error)
    console.error('Error stack:', (error as Error).stack)
    return NextResponse.json(
      { success: false, error: `Internal server error: ${(error as Error).message}` },
      { status: 500 }
    )
  }
}

// GET /api/customers/[id] - Get customer by ID
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    console.log('Customer get API called for ID:', id)
    
    const customer = await getCustomerById(id)
    
    if (!customer) {
      console.log('Customer not found:', id)
      return NextResponse.json(
        { success: false, error: 'Customer not found' },
        { status: 404 }
      )
    }
    
    console.log('Customer found:', customer.id)
    
    // Transform database fields to frontend format
    const transformedCustomer = {
      id: customer.id,
      name: `${customer.first_name} ${customer.last_name}`.trim(),
      email: customer.email,
      company: customer.company,
      password: customer.password_hash,
      createdAt: customer.created_at,
      quotes: [], // Would need to fetch quotes separately if needed
      phone: customer.phone,
      address: customer.address,
      website: customer.website,
      jobTitle: customer.job_title,
      industry: customer.industry,
      companySize: customer.company_size,
      timezone: customer.timezone,
      preferredContact: customer.preferred_contact,
      linkedin: customer.linkedin,
      twitter: customer.twitter,
      bio: customer.bio,
      country: customer.country,
      city: customer.city,
      postalCode: customer.postal_code,
      vatNumber: customer.vat_number,
      businessType: customer.business_type
    }
    
    return NextResponse.json({
      success: true,
      customer: transformedCustomer
    })
    
  } catch (error) {
    console.error('Error fetching customer:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
