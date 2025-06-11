import { NextRequest, NextResponse } from 'next/server'
import { login} from '@/server/controller/authController'
import { loginSchema } from '@/server/lib/validations'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validatedData = loginSchema.parse(body)
    
    // Call controller
    const result = await login(validatedData)
    
    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Login error:', error)
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: error.message || 'Login failed' },
      { status: error.status || 500 }
    )
  }
}