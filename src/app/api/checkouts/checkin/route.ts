import { NextRequest, NextResponse } from 'next/server'
import { checkinBook } from '@/server/controller/checkoutController'
import { verifyToken } from '@/server/lib/serverUtils'
import { checkinSchema } from '@/server/lib/validations'

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
    
    // Checkin book from controller (returns plain data now)
    const result = await checkinBook(validation.data, decoded.userId, decoded.role)
    
    console.log('Book checked in successfully')
    
    // Wrap in NextResponse.json()
    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Checkin book API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}