import { NextRequest, NextResponse } from 'next/server'
import { githubService } from '@/lib/github-service'

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')
    
    // Handle OAuth error
    if (error) {
      return NextResponse.redirect(`/client/dashboard?github_error=${encodeURIComponent(error)}`)
    }
    
    if (!code || !state) {
      return NextResponse.redirect('/client/dashboard?github_error=missing_parameters')
    }

    // Verify state parameter
    let stateData
    try {
      stateData = JSON.parse(Buffer.from(state, 'base64').toString())
    } catch {
      return NextResponse.redirect('/client/dashboard?github_error=invalid_state')
    }
    
    const { customerId } = stateData
    if (!customerId) {
      return NextResponse.redirect('/client/dashboard?github_error=missing_customer_id')
    }

    // Exchange code for access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code: code,
      }),
    })

    const tokenData = await tokenResponse.json()
    
    if (tokenData.error) {
      return NextResponse.redirect(`/client/dashboard?github_error=${encodeURIComponent(tokenData.error)}`)
    }

    const accessToken = tokenData.access_token
    if (!accessToken) {
      return NextResponse.redirect('/client/dashboard?github_error=no_access_token')
    }

    // Get GitHub user info
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    })

    const githubUser = await userResponse.json()
    
    if (!githubUser.id) {
      return NextResponse.redirect('/client/dashboard?github_error=failed_to_get_user')
    }

    // Store GitHub integration
    await githubService.storeGitHubToken(customerId, accessToken, {
      id: githubUser.id,
      login: githubUser.login,
      name: githubUser.name,
      email: githubUser.email,
      avatar_url: githubUser.avatar_url,
    })

    // Redirect back to dashboard with success
    return NextResponse.redirect('/client/dashboard?github_connected=true')
    
  } catch (error) {
    console.error('GitHub OAuth callback error:', error)
    return NextResponse.redirect('/client/dashboard?github_error=callback_failed')
  }
}
