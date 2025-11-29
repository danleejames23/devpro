import { NextRequest, NextResponse } from 'next/server'
import { deletePaymentMethod } from '@/lib/database'

// DELETE /api/billing/payment-method/[id] - Delete a payment method
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Payment method ID is required' },
        { status: 400 }
      )
    }

    const success = await deletePaymentMethod(id)

    if (success) {
      return NextResponse.json({
        success: true,
        message: 'Payment method deleted successfully'
      })
    } else {
      return NextResponse.json(
        { success: false, error: 'Payment method not found' },
        { status: 404 }
      )
    }

  } catch (error) {
    console.error('Error deleting payment method:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
