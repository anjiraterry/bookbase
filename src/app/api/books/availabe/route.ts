import { NextRequest, NextResponse } from 'next/server'
import { getAvailableBooks } from '@/server/controller/bookController'

export async function GET(request: NextRequest) {
  try {
    console.log('GET available books API called')
    
    // Get available books from controller (returns plain data now)
    const books = await getAvailableBooks()
    
    console.log('Available books retrieved successfully:', books.length, 'books')
    
    // Wrap in NextResponse.json()
    return NextResponse.json(books)
  } catch (error: any) {
    console.error('Get available books API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}