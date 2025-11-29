import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    // TODO: Add admin authentication check
    
    const client = await getDatabase()
    
    try {
      // Create services table if it doesn't exist
      await client.query(`
        CREATE TABLE IF NOT EXISTS services (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          base_price DECIMAL(10,2) NOT NULL,
          category VARCHAR(100),
          features JSONB,
          is_active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `)
      
      // Get all services
      const result = await client.query(`
        SELECT * FROM services 
        ORDER BY category, name
      `)
      
      return NextResponse.json({
        success: true,
        services: result.rows
      })
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('❌ Error fetching services:', error)
    return NextResponse.json(
      { error: 'Failed to fetch services' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // TODO: Add admin authentication check
    
    const body = await request.json()
    const { name, description, base_price, category, features = [], is_active = true } = body
    
    const client = await getDatabase()
    
    try {
      const result = await client.query(`
        INSERT INTO services (
          name, description, base_price, category, features, is_active,
          created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING *
      `, [name, description, base_price, category, JSON.stringify(features), is_active])
      
      return NextResponse.json({
        success: true,
        service: result.rows[0]
      })
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('❌ Error creating service:', error)
    return NextResponse.json(
      { error: 'Failed to create service' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    // TODO: Add admin authentication check
    
    const body = await request.json()
    const { id, name, description, base_price, category, features, is_active } = body
    
    const client = await getDatabase()
    
    try {
      const result = await client.query(`
        UPDATE services 
        SET 
          name = COALESCE($1, name),
          description = COALESCE($2, description),
          base_price = COALESCE($3, base_price),
          category = COALESCE($4, category),
          features = COALESCE($5, features),
          is_active = COALESCE($6, is_active),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $7
        RETURNING *
      `, [name, description, base_price, category, features ? JSON.stringify(features) : null, is_active, id])
      
      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: 'Service not found' },
          { status: 404 }
        )
      }
      
      return NextResponse.json({
        success: true,
        service: result.rows[0]
      })
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('❌ Error updating service:', error)
    return NextResponse.json(
      { error: 'Failed to update service' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // TODO: Add admin authentication check
    
    const { searchParams } = new URL(request.url)
    const serviceId = searchParams.get('id')
    
    if (!serviceId) {
      return NextResponse.json(
        { error: 'Service ID is required' },
        { status: 400 }
      )
    }
    
    const client = await getDatabase()
    
    try {
      const result = await client.query(
        'DELETE FROM services WHERE id = $1 RETURNING *',
        [serviceId]
      )
      
      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: 'Service not found' },
          { status: 404 }
        )
      }
      
      return NextResponse.json({
        success: true,
        message: 'Service deleted successfully'
      })
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('❌ Error deleting service:', error)
    return NextResponse.json(
      { error: 'Failed to delete service' },
      { status: 500 }
    )
  }
}
