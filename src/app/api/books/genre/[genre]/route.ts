import { NextRequest, NextResponse } from 'next/server'
import { getBooksByGenre } from '@/server/controller/bookController'

interface RouteParams {
  params: {
    genre: string
  }
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    console.log('GET books by genre API called for genre:', params.genre)
    
    // Get books by genre from controller (returns plain data now)
    const books = await getBooksByGenre(params.genre)
    
    console.log('Books by genre retrieved successfully:', books.length, 'books for genre:', params.genre)
    
    // Wrap in NextResponse.json()
    return NextResponse.json(books)
  } catch (error: any) {
    console.error('Get books by genre API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}