import { NextRequest, NextResponse } from 'next/server'
import { updateProfile } from '@/server/controller/userController'
import { verifyToken } from '@/server/lib/serverUtils'
import { updateProfileSchema } from '@/server/lib/validations'

interface CustomError {
  message?: string
}

export async function PUT(request: NextRequest) {
  try {
    console.log('PUT update profile API called')
    
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
    console.log('Update profile request for user:', decoded.userId)
    
    const validation = updateProfileSchema.safeParse(body)
    
    if (!validation.success) {
      console.error('Validation failed:', validation.error)
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      )
    }

    console.log('Validated profile update data')
    
    const result = await updateProfile(decoded.userId, validation.data)
    
    console.log('Profile updated successfully')
    
    return NextResponse.json(result)
  } catch (error) {
    const customError = error as CustomError
    console.error('Update profile API error:', customError)
    return NextResponse.json(
      { error: customError.message || 'Internal server error' },
      { status: 500 }
    )
  }
}