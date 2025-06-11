import { NextResponse } from 'next/server'

export function handleDatabaseError(error: any) {
  console.error('Database error:', error)
  
  if (error.code === '23505') { // Unique constraint violation
    return NextResponse.json(
      { success: false, error: 'Record already exists' },
      { status: 409 }
    )
  }
  
  if (error.code === '23503') { // Foreign key constraint violation
    return NextResponse.json(
      { success: false, error: 'Referenced record not found' },
      { status: 400 }
    )
  }
  
  return NextResponse.json(
    { success: false, error: 'Database error occurred' },
    { status: 500 }
  )
}

export function handleControllerError(error: any) {
  console.error('Controller error:', error)
  
  return NextResponse.json(
    { success: false, error: 'Internal server error' },
    { status: 500 }
  )
}