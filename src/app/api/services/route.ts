import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    const client = await getDatabase()
    
    try {
      // Check if services table exists
      const tableExists = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' AND table_name = 'services'
        )
      `)
      
      if (!tableExists.rows[0].exists) {
        console.log('Services table does not exist, returning empty array')
        return NextResponse.json({
          success: true,
          services: []
        })
      }
      
      // Get all active services
      const result = await client.query(`
        SELECT * FROM services 
        WHERE is_active = TRUE
        ORDER BY category, name
      `)
      
      // Transform the data to match the expected format
      const services = result.rows.map(service => ({
        id: service.service_id || service.id.toString(),
        title: service.name,
        description: service.description,
        startingPrice: parseFloat(service.base_price),
        category: service.category,
        features: service.features || [],
        timeline: service.timeline || '2-4 weeks',
        icon: service.icon || getServiceIcon(service.category)
      }))
      
      return NextResponse.json({
        success: true,
        services
      })
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('❌ Error fetching services:', error)
    return NextResponse.json({
      success: true,
      services: []
    })
  }
}

function getServiceIcon(category: string): string {
  const iconMap: { [key: string]: string } = {
    'web': 'Code',
    'ai': 'Bot',
    'mobile': 'Smartphone',
    'design': 'Palette',
    'development': 'Code',
    'backend': 'Server',
    'frontend': 'Code',
    'fullstack': 'Zap',
    'ecommerce': 'ShoppingCart',
    'default': 'Star'
  }
  
  return iconMap[category?.toLowerCase()] || iconMap['default']
}
