import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/database'

export async function POST() {
  try {
    const client = await getDatabase()
    
    try {
      // Check if deposit columns exist
      const depositAmountExists = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_schema = 'public' 
          AND table_name = 'invoices' 
          AND column_name = 'deposit_amount'
        )
      `)
      
      const depositRequiredExists = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_schema = 'public' 
          AND table_name = 'invoices' 
          AND column_name = 'deposit_required'
        )
      `)
      
      const depositPaidExists = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_schema = 'public' 
          AND table_name = 'invoices' 
          AND column_name = 'deposit_paid'
        )
      `)
      
      // Add missing columns
      if (!depositAmountExists.rows[0].exists) {
        await client.query(`
          ALTER TABLE invoices 
          ADD COLUMN deposit_amount DECIMAL(10,2) DEFAULT 0
        `)
        console.log('✅ Added deposit_amount column to invoices table')
      }
      
      if (!depositRequiredExists.rows[0].exists) {
        await client.query(`
          ALTER TABLE invoices 
          ADD COLUMN deposit_required BOOLEAN DEFAULT false
        `)
        console.log('✅ Added deposit_required column to invoices table')
      }
      
      if (!depositPaidExists.rows[0].exists) {
        await client.query(`
          ALTER TABLE invoices 
          ADD COLUMN deposit_paid BOOLEAN DEFAULT false
        `)
        console.log('✅ Added deposit_paid column to invoices table')
      }
      
      return NextResponse.json({
        success: true,
        message: 'Invoices table updated with deposit columns'
      })
      
    } finally {
      client.release()
    }
    
  } catch (error) {
    console.error('❌ Error updating invoices table:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update table'
    }, { status: 500 })
  }
}
