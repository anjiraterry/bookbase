import { NextRequest, NextResponse } from 'next/server'
import { register } from '@/server/controller/authController'
import { registerSchema } from '@/server/lib/validations'

export async function POST(request: NextRequest) {
  try {
    console.log('=== REGISTER API ROUTE CALLED ===')
    
    // Parse JSON request body
    const body = await request.json()
    console.log('📦 Request body:', body)
    
    // Validate the data
    const validatedData = registerSchema.parse(body)
    console.log('✅ Data validated:', validatedData)
    
    // Call register function with validated data
    const result = await register(validatedData)
    
    console.log('=== API ROUTE REGISTER RESULT ===')
    console.log('Result from controller:', result)
    console.log('User data:', result.user)
    console.log('Profile photo URL in result:', result.user?.profilePhotoUrl)

    return NextResponse.json(result, { status: 201 })
    
  } catch (error: any) {
    console.error('Register API route error:', error)
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: error.message || 'Registration failed' },
      { status: error.status || 500 }
    )
  }
}