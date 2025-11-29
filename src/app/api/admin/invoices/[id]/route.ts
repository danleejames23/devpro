import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/database'

// DELETE /api/admin/invoices/[id] - Delete an invoice by ID
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const client = await getDatabase()

    try {
      const result = await client.query('DELETE FROM invoices WHERE id = $1 RETURNING *', [id])
      if (result.rows.length === 0) {
        return NextResponse.json({ success: false, error: 'Invoice not found' }, { status: 404 })
      }
      return NextResponse.json({ success: true })
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('❌ Error deleting invoice:', error)
    return NextResponse.json({ success: false, error: 'Failed to delete invoice' }, { status: 500 })
  }
}
