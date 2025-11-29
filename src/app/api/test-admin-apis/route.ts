import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  const results: any = {
    customers: null,
    quotes: null,
    projects: null,
    messages: null,
    invoices: null,
    errors: []
  }

  const baseUrl = 'http://localhost:3000'
  
  // Test each admin API
  const apis = [
    { name: 'customers', url: `${baseUrl}/api/admin/customers` },
    { name: 'quotes', url: `${baseUrl}/api/admin/quotes` },
    { name: 'projects', url: `${baseUrl}/api/admin/projects` },
    { name: 'messages', url: `${baseUrl}/api/admin/messages` },
    { name: 'invoices', url: `${baseUrl}/api/admin/invoices` }
  ]

  for (const api of apis) {
    try {
      console.log(`🔍 Testing ${api.name} API...`)
      const response = await fetch(api.url)
      const data = await response.json()
      
      results[api.name] = {
        status: response.status,
        success: data.success,
        data_length: Array.isArray(data[api.name]) ? data[api.name].length : 'N/A',
        error: data.error || null
      }
      
      console.log(`📊 ${api.name}: ${response.status} - ${data.success ? 'SUCCESS' : 'FAILED'}`)
      
    } catch (error) {
      console.error(`❌ ${api.name} API failed:`, error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      results[api.name] = {
        status: 'ERROR',
        error: errorMessage
      }
      results.errors.push(`${api.name}: ${errorMessage}`)
    }
  }

  return NextResponse.json({
    success: true,
    api_test_results: results
  })
}
