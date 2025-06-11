import { NextRequest, NextResponse } from 'next/server'
import { getOverdueCheckouts } from '@/server/controller/checkoutController'
import { verifyToken } from '@/server/lib/serverUtils'

export async function GET(request: NextRequest) {
  try {
    console.log('GET overdue checkouts API called')
    
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

    console.log('Getting overdue checkouts for role:', decoded.role)
    
    // Get overdue checkouts from controller (returns plain data now)
    const checkouts = await getOverdueCheckouts(decoded.role)
    
    console.log('Overdue checkouts retrieved successfully:', checkouts.length, 'checkouts')
    
    // Wrap in NextResponse.json()
    return NextResponse.json(checkouts)
  } catch (error: any) {
    console.error('Get overdue checkouts API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}