import { NextRequest, NextResponse } from 'next/server'
import { getUserCheckouts } from '@/server/controller/checkoutController'
import { verifyToken } from '@/server/lib/serverUtils'

interface RouteParams {
  params: {
    userId: string
  }
}

interface CustomError {
  message?: string
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
    
    const checkouts = await getUserCheckouts(params.userId, decoded.userId, decoded.role)
    
    console.log('User checkouts retrieved successfully:', checkouts.length, 'checkouts')
    
    return NextResponse.json(checkouts)
  } catch (error) {
    const customError = error as CustomError
    console.error('Get user checkouts API error:', customError)
    return NextResponse.json(
      { error: customError.message || 'Internal server error' },
      { status: 500 }
    )
  }
}