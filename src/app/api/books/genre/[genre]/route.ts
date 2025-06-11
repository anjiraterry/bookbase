import { NextRequest, NextResponse } from 'next/server'
import { getBooksByGenre } from '@/server/controller/bookController'

interface CustomError {
  message?: string
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ genre: string }> }
) {
  try {
    const { genre } = await params
    console.log('GET books by genre API called for genre:', genre)
    
    const books = await getBooksByGenre(genre)
    
    console.log('Books by genre retrieved successfully:', books.length, 'books for genre:', genre)
    
    return NextResponse.json(books)
  } catch (error) {
    const customError = error as CustomError
    console.error('Get books by genre API error:', customError)
    return NextResponse.json(
      { error: customError.message || 'Internal server error' },
      { status: 500 }
    )
  }
}