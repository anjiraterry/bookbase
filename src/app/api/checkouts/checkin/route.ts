import { NextRequest, NextResponse } from 'next/server'
import { checkinBook } from '@/server/controller/checkoutController'
import { verifyToken } from '@/server/lib/serverUtils'
import { checkinSchema } from '@/server/lib/validations'

interface CustomError {
  message?: string
}

export async function POST(request: NextRequest) {
  try {
    console.log('POST checkin book API called')
    
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
    console.log('Checkin book request from user:', decoded.userId, 'role:', decoded.role)
    
    const validation = checkinSchema.safeParse(body)
    
    if (!validation.success) {
      console.error('Validation failed:', validation.error)
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      )
    }

    console.log('Validated checkin data:', validation.data)
    
    const result = await checkinBook(validation.data, decoded.userId, decoded.role)
    
    console.log('Book checked in successfully')
    
    return NextResponse.json(result)
  } catch (error) {
    const customError = error as CustomError
    console.error('Checkin book API error:', customError)
    return NextResponse.json(
      { error: customError.message || 'Internal server error' },
      { status: 500 }
    )
  }
}