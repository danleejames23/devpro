import { NextRequest, NextResponse } from 'next/server'

// GitHub OAuth configuration
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET
const GITHUB_REDIRECT_URI = process.env.GITHUB_REDIRECT_URI || 'http://localhost:3000/api/github/callback'

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

    if (!GITHUB_CLIENT_ID) {
      return NextResponse.json(
        { success: false, error: 'GitHub OAuth not configured' },
        { status: 500 }
      )
    }

    // Generate state parameter for security
    const state = Buffer.from(JSON.stringify({ customerId, timestamp: Date.now() })).toString('base64')
    
    // GitHub OAuth URL
    const githubAuthUrl = new URL('https://github.com/login/oauth/authorize')
    githubAuthUrl.searchParams.set('client_id', GITHUB_CLIENT_ID)
    githubAuthUrl.searchParams.set('redirect_uri', GITHUB_REDIRECT_URI)
    githubAuthUrl.searchParams.set('scope', 'repo,user:email')
    githubAuthUrl.searchParams.set('state', state)
    
    return NextResponse.redirect(githubAuthUrl.toString())
    
  } catch (error) {
    console.error('GitHub OAuth initiation error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to initiate GitHub OAuth' },
      { status: 500 }
    )
  }
}
