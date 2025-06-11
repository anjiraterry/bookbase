import { NextRequest, NextResponse } from 'next/server'
import { changePassword } from '@/server/controller/userController'
import { verifyToken } from '@/server/lib/serverUtils'
import { changePasswordSchema } from '@/server/lib/validations'

interface CustomError {
  message?: string
}

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
    
    const result = await changePassword(decoded.userId, validation.data)
    
    console.log('Password changed successfully')
    
    return NextResponse.json(result)
  } catch (error) {
    const customError = error as CustomError
    console.error('Change password API error:', customError)
    return NextResponse.json(
      { error: customError.message || 'Internal server error' },
      { status: 500 }
    )
  }
}