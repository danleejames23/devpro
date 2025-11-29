import { NextRequest, NextResponse } from 'next/server'
import { githubService } from '@/lib/github-service'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const customerId = searchParams.get('customerId')
    const owner = searchParams.get('owner')
    const repo = searchParams.get('repo')
    const path = searchParams.get('path') || ''
    
    if (!customerId || !owner || !repo) {
      return NextResponse.json(
        { success: false, error: 'Customer ID, owner, and repo are required' },
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

    // Get repository contents
    const contents = await githubService.getRepositoryContents(customerId, owner, repo, path)
    
    return NextResponse.json({
      success: true,
      data: contents
    })
    
  } catch (error) {
    console.error('Error fetching repository contents:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch repository contents' },
      { status: 500 }
    )
  }
}
