import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/database'

export async function GET() {
  return await addGithubUrlColumn()
}

export async function POST() {
  return await addGithubUrlColumn()
}

async function addGithubUrlColumn() {
  try {
    const client = await getDatabase()
    
    try {
      // Check if github_url column exists
      const columnExists = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_schema = 'public' 
          AND table_name = 'projects' 
          AND column_name = 'github_url'
        )
      `)
      
      if (!columnExists.rows[0].exists) {
        // Add github_url column
        await client.query(`
          ALTER TABLE projects 
          ADD COLUMN github_url VARCHAR(500)
        `)
        console.log('✅ Added github_url column to projects table')
        
        return NextResponse.json({
          success: true,
          message: 'github_url column added to projects table'
        })
      } else {
        return NextResponse.json({
          success: true,
          message: 'github_url column already exists'
        })
      }
      
    } finally {
      client.release()
    }
    
  } catch (error) {
    console.error('❌ Error adding github_url column:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to add column'
    }, { status: 500 })
  }
}
