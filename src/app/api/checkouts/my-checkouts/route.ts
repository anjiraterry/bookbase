import { NextRequest, NextResponse } from 'next/server'
import { getUserCheckouts } from '@/server/controller/checkoutController'
import { verifyToken } from '@/server/lib/serverUtils'

export async function GET(request: NextRequest) {
  try {
    console.log('GET my-checkouts API called')
    
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

    console.log('Get my checkouts request from user:', decoded.userId, 'role:', decoded.role)
    
    // Get user's own checkouts using existing controller
    const result = await getUserCheckouts(decoded.userId, decoded.userId, decoded.role)
    
    console.log('User checkouts retrieved successfully')
    
    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Get my checkouts API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}