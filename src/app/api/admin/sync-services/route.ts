import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/database'
import { services } from '@/data/services'

export async function POST(request: NextRequest) {
  try {
    const client = await getDatabase()
    
    try {
      console.log('🚀 Starting services sync...')
      
      // Create services table if it doesn't exist
      await client.query(`
        CREATE TABLE IF NOT EXISTS services (
          id SERIAL PRIMARY KEY,
          service_id VARCHAR(255) UNIQUE NOT NULL,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          base_price DECIMAL(10,2) NOT NULL,
          category VARCHAR(100),
          features JSONB,
          timeline VARCHAR(100),
          icon VARCHAR(50),
          is_active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `)
      
      // Clear existing services
      await client.query('DELETE FROM services')
      console.log('🧹 Cleared existing services')
      
      // Insert new services from data file
      for (const service of services) {
        // Determine category based on service ID
        let category = 'web'
        if (['ai-chatbots', 'ai-web-agents', 'ai-integration'].includes(service.id)) {
          category = 'ai'
        } else if (service.id === 'mobile-development') {
          category = 'mobile'
        } else if (service.id === 'branding-design') {
          category = 'design'
        } else if (['landing-page', 'basic-website'].includes(service.id)) {
          category = 'basic'
        } else if (['frontend-development', 'custom-website-development', 'fullstack-development', 'ecommerce-solutions'].includes(service.id)) {
          category = 'web'
        }
        
        await client.query(`
          INSERT INTO services (service_id, name, description, base_price, category, features, timeline, icon, is_active)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        `, [
          service.id,
          service.title,
          service.description,
          service.startingPrice,
          category,
          JSON.stringify(service.features),
          service.timeline,
          service.icon,
          true
        ])
        console.log(`✅ Added: ${service.title}`)
      }
      
      console.log('🎉 Successfully synced services!')
      
      return NextResponse.json({
        success: true,
        message: `Successfully synced ${services.length} services`,
        services: services.length
      })
      
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('❌ Error syncing services:', error)
    return NextResponse.json(
      { error: 'Failed to sync services', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Use POST to sync services from data file to database',
    servicesCount: services.length,
    services: services.map(s => ({ id: s.id, title: s.title, price: s.startingPrice }))
  })
}
