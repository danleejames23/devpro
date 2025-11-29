import { NextRequest, NextResponse } from 'next/server'
import { githubService } from '@/lib/github-service'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const customerId = searchParams.get('customerId')
    
    if (!customerId) {
      return NextResponse.json(
        { success: false, error: 'Customer ID is required' },
        { status: 400 }
      )
    }

    // Check if GitHub is connected
    const isConnected = await githubService.isGitHubConnected(customerId)
    if (!isConnected) {
      return NextResponse.json(
        { success: false, error: 'GitHub not connected' },
        { status: 401 }
      )
    }

    // Get repositories
    const repositories = await githubService.getUserRepositories(customerId)
    
    return NextResponse.json({
      success: true,
      data: repositories
    })
    
  } catch (error) {
    console.error('Error fetching GitHub repositories:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch repositories' },
      { status: 500 }
    )
  }
}
