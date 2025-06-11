import { NextRequest, NextResponse } from 'next/server'
import { changePassword } from '@/server/controller/userController'
import { verifyToken } from '@/server/lib/serverUtils'
import { changePasswordSchema } from '@/server/lib/validations'

export async function POST(request: NextRequest) {
  try {
    console.log('POST change password API called')
    
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
    console.log('Change password request for user:', decoded.userId)
    
    const validation = changePasswordSchema.safeParse(body)
    
    if (!validation.success) {
      console.error('Validation failed:', validation.error)
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      )
    }

    console.log('Validated password change data')
    
    // Change password from controller (returns plain data now)
    const result = await changePassword(decoded.userId, validation.data)
    
    console.log('Password changed successfully')
    
    // Wrap in NextResponse.json()
    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Change password API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}