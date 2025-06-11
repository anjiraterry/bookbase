import { NextRequest, NextResponse } from 'next/server'
import { getAvailableBooks } from '@/server/controller/bookController'

interface CustomError {
  message?: string
}

export async function GET() {
  try {
    console.log('GET available books API called')
    
    const books = await getAvailableBooks()
    
    console.log('Available books retrieved successfully:', books.length, 'books')
    
    return NextResponse.json(books)
  } catch (error) {
    const customError = error as CustomError
    console.error('Get available books API error:', customError)
    return NextResponse.json(
      { error: customError.message || 'Internal server error' },
      { status: 500 }
    )
  }
}