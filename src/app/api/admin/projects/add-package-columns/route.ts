import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/database'

export async function POST() {
  try {
    const client = await getDatabase()
    
    try {
      // Check if package columns exist
      const selectedPackageExists = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_schema = 'public' 
          AND table_name = 'projects' 
          AND column_name = 'selected_package'
        )
      `)
      
      const featuresExists = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_schema = 'public' 
          AND table_name = 'projects' 
          AND column_name = 'features'
        )
      `)
      
      const complexityExists = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_schema = 'public' 
          AND table_name = 'projects' 
          AND column_name = 'complexity'
        )
      `)
      
      const rushDeliveryExists = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_schema = 'public' 
          AND table_name = 'projects' 
          AND column_name = 'rush_delivery'
        )
      `)
      
      // Add missing columns
      if (!selectedPackageExists.rows[0].exists) {
        await client.query(`
          ALTER TABLE projects 
          ADD COLUMN selected_package JSONB
        `)
        console.log('✅ Added selected_package column to projects table')
      }
      
      if (!featuresExists.rows[0].exists) {
        await client.query(`
          ALTER TABLE projects 
          ADD COLUMN features JSONB
        `)
        console.log('✅ Added features column to projects table')
      }
      
      if (!complexityExists.rows[0].exists) {
        await client.query(`
          ALTER TABLE projects 
          ADD COLUMN complexity VARCHAR(50)
        `)
        console.log('✅ Added complexity column to projects table')
      }
      
      if (!rushDeliveryExists.rows[0].exists) {
        await client.query(`
          ALTER TABLE projects 
          ADD COLUMN rush_delivery VARCHAR(50)
        `)
        console.log('✅ Added rush_delivery column to projects table')
      }
      
      return NextResponse.json({
        success: true,
        message: 'Projects table updated with package columns'
      })
      
    } finally {
      client.release()
    }
    
  } catch (error) {
    console.error('❌ Error updating projects table:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update table'
    }, { status: 500 })
  }
}
