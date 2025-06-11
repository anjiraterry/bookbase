import { NextRequest } from 'next/server'
import { verifyToken } from '../lib/serverUtils'

interface JwtPayload {
  userId: string
  role: string
  iat?: number
  exp?: number
}

export function getAuthUser(request: NextRequest): { userId: string; role: string } | null {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null
    }

    const token = authHeader.substring(7) // Remove 'Bearer ' prefix
    
    if (!token) {
      return null
    }

    const decoded = verifyToken(token) as JwtPayload | null
    
    if (!decoded || !decoded.userId || !decoded.role) {
      return null
    }

    return { userId: decoded.userId, role: decoded.role }
  } catch (error) {
    console.error('Auth error:', error)
    return null
  }
}

export function requireAuth(request: NextRequest): { userId: string; role: string } {
  const user = getAuthUser(request)
  
  if (!user) {
    throw new Error('Authentication required')
  }
  
  return user
}

export function requireLibrarian(request: NextRequest): { userId: string; role: string } {
  const user = requireAuth(request)
  
  if (user.role !== 'librarian') {
    throw new Error('Librarian access required')
  }
  
  return user
}