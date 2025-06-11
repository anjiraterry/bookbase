import { NextRequest, NextResponse } from 'next/server'
import { register } from '@/server/controller/authController'
import { registerSchema } from '@/server/lib/validations'
import { ZodError } from 'zod'

interface CustomError {
  name?: string
  message?: string
  status?: number
  errors?: unknown[]
}

export async function POST(request: NextRequest) {
  try {
    console.log('=== REGISTER API ROUTE CALLED ===')
    

    const body = await request.json()
    console.log('📦 Request body:', body)
    

    const validatedData = registerSchema.parse(body)
    console.log('✅ Data validated:', validatedData)
    
  
    const result = await register(validatedData)
    
    console.log('=== API ROUTE REGISTER RESULT ===')
    console.log('Result from controller:', result)
    console.log('User data:', result.user)
    console.log('Profile photo URL in result:', result.user?.profilePhotoUrl)

    return NextResponse.json(result, { status: 201 })
    
  } catch (error) {
    const customError = error as CustomError
    console.error('Register API route error:', customError)
    
    if (customError.name === 'ZodError' || error instanceof ZodError) {
      const zodError = error as ZodError
      return NextResponse.json(
        { error: 'Invalid input', details: zodError.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: customError.message || 'Registration failed' },
      { status: customError.status || 500 }
    )
  }
}