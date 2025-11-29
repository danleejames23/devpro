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
    
    if (isConnected) {
      // Get GitHub user info
      const githubUser = await githubService.getGitHubUser(customerId)
      
      return NextResponse.json({
        success: true,
        data: {
          connected: true,
          user: githubUser
        }
      })
    } else {
      return NextResponse.json({
        success: true,
        data: {
          connected: false,
          user: null
        }
      })
    }
    
  } catch (error) {
    console.error('Error checking GitHub status:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to check GitHub status' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const customerId = searchParams.get('customerId')
    
    if (!customerId) {
      return NextResponse.json(
        { success: false, error: 'Customer ID is required' },
        { status: 400 }
      )
    }

    // Disconnect GitHub
    await githubService.disconnectGitHub(customerId)
    
    return NextResponse.json({
      success: true,
      message: 'GitHub disconnected successfully'
    })
    
  } catch (error) {
    console.error('Error disconnecting GitHub:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to disconnect GitHub' },
      { status: 500 }
    )
  }
}
