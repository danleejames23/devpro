import { NextRequest, NextResponse } from 'next/server'

// Admin credentials (in a real app, these would be hashed and stored securely)
const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'admin123'
}

// POST /api/admin-auth - Authenticate admin
export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()
    
    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: 'Username and password are required' },
        { status: 400 }
      )
    }
    
    // Check admin credentials
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
      return NextResponse.json({ 
        success: true, 
        admin: {
          id: 'admin-1',
          username: 'admin',
          role: 'administrator',
          permissions: ['manage_quotes', 'manage_customers', 'view_analytics']
        }
      })
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid username or password' },
        { status: 401 }
      )
    }
    
  } catch (error) {
    console.error('Error authenticating admin:', error)
    return NextResponse.json(
      { success: false, error: 'Authentication failed' },
      { status: 500 }
    )
  }
}
