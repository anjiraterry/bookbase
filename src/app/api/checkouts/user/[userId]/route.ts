import { NextRequest, NextResponse } from 'next/server'
import { getUserCheckouts } from '@/server/controller/checkoutController'
import { verifyToken } from '@/server/lib/serverUtils'

interface RouteParams {
  params: {
    userId: string
  }
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    console.log('GET user checkouts API called for userId:', params.userId)
    
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

    console.log('Getting checkouts for user:', params.userId, 'requested by:', decoded.userId, 'role:', decoded.role)
    
    // Get user checkouts from controller (returns plain data now)
    const checkouts = await getUserCheckouts(params.userId, decoded.userId, decoded.role)
    
    console.log('User checkouts retrieved successfully:', checkouts.length, 'checkouts')
    
    // Wrap in NextResponse.json()
    return NextResponse.json(checkouts)
  } catch (error: any) {
    console.error('Get user checkouts API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}