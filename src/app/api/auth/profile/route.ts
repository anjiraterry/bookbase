import { NextRequest, NextResponse } from 'next/server'
import { getProfile } from '@/server/controller/authController'
import { verifyToken } from '@/server/lib/serverUtils'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization header required' },
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

    return await getProfile(decoded.userId)
  } catch (_error) {
    // Using _ prefix to indicate intentionally unused parameter
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}