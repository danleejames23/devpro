import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Mock analytics data for now
    const analytics = {
      totalQuotes: 25,
      pendingQuotes: 5,
      completedProjects: 18,
      totalRevenue: 125000,
      monthlyGrowth: 12.5,
      topServices: [
        { name: 'Web Development', count: 15, revenue: 75000 },
        { name: 'Mobile Apps', count: 8, revenue: 40000 },
        { name: 'Consulting', count: 2, revenue: 10000 }
      ],
      recentActivity: [
        { type: 'quote', message: 'New quote received from John Smith', time: '2 hours ago' },
        { type: 'project', message: 'Project completed for Sarah Johnson', time: '5 hours ago' },
        { type: 'payment', message: 'Payment received: $5,000', time: '1 day ago' }
      ]
    }

    return NextResponse.json({
      success: true,
      analytics
    })
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}
