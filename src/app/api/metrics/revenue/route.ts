import { getDatabase } from '@/lib/database'

// GET /api/metrics/revenue
// Returns global revenue = baseline (47530) + all payments made across invoices
export async function GET(_request: Request) {
  const BASELINE = 47530
  try {
    const client = await getDatabase()
    try {
      const result = await client.query(`
        SELECT 
          amount,
          status,
          deposit_paid,
          deposit_amount
        FROM invoices
      `)

      let paidTotal = 0
      for (const row of result.rows) {
        const rawAmount = row.amount
        const amount = typeof rawAmount === 'string' ? parseFloat(rawAmount) : (rawAmount ?? 0)
        const status = String(row.status || 'pending')
        const depositPaid = Boolean(row.deposit_paid)
        const rawDeposit = row.deposit_amount
        const depositAmount = rawDeposit != null
          ? (typeof rawDeposit === 'string' ? parseFloat(rawDeposit) : rawDeposit)
          : amount * 0.2

        if (status === 'paid') {
          // Full amount collected
          paidTotal += amount || 0
        } else if (depositPaid) {
          // Only deposit collected so far
          paidTotal += depositAmount || 0
        }
      }

      const revenue = BASELINE + paidTotal
      return Response.json({ success: true, revenue, baseline: BASELINE, paidTotal })
    } finally {
      // Always release the DB client
      // @ts-ignore - getDatabase returns a PoolClient-compatible object
      client.release()
    }
  } catch (error: any) {
    console.error('❌ Revenue metrics error:', error?.message || error)
    return Response.json({ success: false, error: 'Failed to compute revenue' }, { status: 500 })
  }
}

