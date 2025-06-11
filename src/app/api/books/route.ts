import { NextRequest, NextResponse } from 'next/server'
import { createBook, getAllBooks } from '@/server/controller/bookController'
import { verifyToken } from '@/server/lib/serverUtils'
import { bookSchema, searchBooksSchema } from '@/server/lib/validations'

export async function GET(request: NextRequest) {
  try {
    console.log('Books API GET called')
    
    const { searchParams } = new URL(request.url)
    const queryParams = Object.fromEntries(searchParams.entries())
    
    console.log('Query params:', queryParams)

    // Provide default values for page and limit
    const defaultParams = {
      page: 1,
      limit: 50,
      ...queryParams // Spread the actual query params
    }

    // Validate with defaults included
    const validation = searchBooksSchema.safeParse(defaultParams)
    let validatedParams = defaultParams

    if (!validation.success) {
      console.log('Validation failed, using defaults:', validation.error)
      // Use just the defaults if validation fails
      validatedParams = { page: 1, limit: 50 }
    } else {
      validatedParams = validation.data
    }

    console.log('Final params:', validatedParams)

    // Get books from controller
    const result = await getAllBooks(validatedParams)
    
    console.log('Books retrieved successfully:', result)
    
    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Books API GET error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('Books API POST called')
    
    // Check authentication
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization required' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const decoded = verifyToken(token)
    
    if (!decoded || decoded.role !== 'librarian') {
      return NextResponse.json(
        { error: 'Librarian access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validation = bookSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      )
    }

    // Create book from controller
    const book = await createBook(validation.data, decoded.userId)
    
    console.log('Book created successfully:', book)
    
    return NextResponse.json(book, { status: 201 })
  } catch (error: any) {
    console.error('Books API POST error:', error)
    
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}