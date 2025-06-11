import { NextRequest, NextResponse } from 'next/server'
import { getAllUsers } from '@/server/controller/userController' // Fixed: added 's' to controllers
import { verifyToken } from '@/server/lib/serverUtils'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization required' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const decoded = verifyToken(token)
    
    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    // Fixed: Call controller and wrap result in NextResponse.json()
    const users = await getAllUsers(decoded.role)
    return NextResponse.json(users)
    
  } catch (error: any) {
    console.error('Users API error:', error)
    
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: error.message?.includes('Librarian access required') ? 403 : 500 }
    )
  }
}