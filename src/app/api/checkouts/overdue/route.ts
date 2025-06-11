import { NextRequest, NextResponse } from 'next/server'
import { getOverdueCheckouts } from '@/server/controller/checkoutController'
import { verifyToken } from '@/server/lib/serverUtils'

interface CustomError {
  message?: string
}

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
    
    const checkouts = await getOverdueCheckouts(decoded.role)
    
    console.log('Overdue checkouts retrieved successfully:', checkouts.length, 'checkouts')
    
    return NextResponse.json(checkouts)
  } catch (error) {
    const customError = error as CustomError
    console.error('Get overdue checkouts API error:', customError)
    return NextResponse.json(
      { error: customError.message || 'Internal server error' },
      { status: 500 }
    )
  }
}