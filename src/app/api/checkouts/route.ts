import { NextRequest, NextResponse } from 'next/server'
import { checkoutBook, getAllCheckouts } from '@/server/controller/checkoutController'
import { verifyToken } from '@/server/lib/serverUtils'
import { checkoutSchema } from '@/server/lib/validations'

interface CustomError {
  message?: string
}

export async function GET(request: NextRequest) {
  try {
    console.log('GET all checkouts API called')
    
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

    console.log('Getting all checkouts for role:', decoded.role)
    
    const checkouts = await getAllCheckouts(decoded.role)
    
    console.log('All checkouts retrieved successfully:', checkouts.length, 'checkouts')
    
    return NextResponse.json(checkouts)
  } catch (error) {
    const customError = error as CustomError
    console.error('Get all checkouts API error:', customError)
    return NextResponse.json(
      { error: customError.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('POST checkout book API called')
    
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

    const body = await request.json()
    console.log('Checkout book request from user:', decoded.userId, 'body:', body)
    
    const validation = checkoutSchema.safeParse(body)
    
    if (!validation.success) {
      console.error('Validation failed:', validation.error)
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      )
    }

    console.log('Validated checkout data:', validation.data)
    
    const result = await checkoutBook(validation.data, decoded.userId, decoded.role)
    
    console.log('Book checked out successfully')
    
    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    const customError = error as CustomError
    console.error('Checkout book API error:', customError)
    return NextResponse.json(
      { error: customError.message || 'Internal server error' },
      { status: 500 }
    )
  }
}