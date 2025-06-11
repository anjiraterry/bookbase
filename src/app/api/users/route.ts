import { NextRequest, NextResponse } from 'next/server'
import { getAllUsers } from '@/server/controller/userController'
import { verifyToken } from '@/server/lib/serverUtils'

interface CustomError {
  message?: string
}

export async function GET(request: NextRequest) {
  try {
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

    const users = await getAllUsers(decoded.role)
    return NextResponse.json(users)
    
  } catch (error) {
    const customError = error as CustomError
    console.error('Users API error:', customError)
    
    return NextResponse.json(
      { error: customError.message || 'Internal server error' },
      { status: customError.message?.includes('Librarian access required') ? 403 : 500 }
    )
  }
}