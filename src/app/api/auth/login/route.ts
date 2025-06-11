import { NextRequest, NextResponse } from 'next/server'
import { login } from '@/server/controller/authController'
import { loginSchema } from '@/server/lib/validations'
import { ZodError } from 'zod'

interface CustomError {
  name?: string
  message?: string
  status?: number
  errors?: unknown[]
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
 
    const validatedData = loginSchema.parse(body)
  
    const result = await login(validatedData)
    
    return NextResponse.json(result)
  } catch (error) {
    const customError = error as CustomError
    console.error('Login error:', customError)
   
    if (customError.name === 'ZodError' || error instanceof ZodError) {
      const zodError = error as ZodError
      return NextResponse.json(
        { error: 'Invalid input', details: zodError.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: customError.message || 'Login failed' },
      { status: customError.status || 500 }
    )
  }
}