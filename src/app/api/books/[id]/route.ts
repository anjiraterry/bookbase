import { NextRequest, NextResponse } from 'next/server'
import { getBookById, updateBook, deleteBook } from '@/server/controller/bookController'
import { verifyToken } from '@/server/lib/serverUtils'
import { updateBookSchema } from '@/server/lib/validations'

interface RouteParams {
  params: {
    id: string
  }
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    console.log('GET book API called for ID:', params.id)
    
    // Get book from controller (returns plain data now)
    const book = await getBookById(params.id)
    
    console.log('Book retrieved successfully:', book)
    
    // Wrap in NextResponse.json()
    return NextResponse.json(book)
  } catch (error: any) {
    console.error('Get book API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    console.log('PUT book API called for ID:', params.id)
    
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization required' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const decoded = verifyToken(token)
    
    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    const body = await request.json()
    console.log('Update book request body:', body)
    
    const validation = updateBookSchema.safeParse(body)
    
    if (!validation.success) {
      console.error('Validation failed:', validation.error)
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      )
    }

    console.log('Validated data:', validation.data)
    
    // Update book from controller (returns plain data now)
    const updatedBook = await updateBook(params.id, validation.data, decoded.role)
    
    console.log('Book updated successfully:', updatedBook)
    
    // Wrap in NextResponse.json()
    return NextResponse.json(updatedBook)
  } catch (error: any) {
    console.error('Update book API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    console.log('DELETE book API called for ID:', params.id)
    
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization required' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const decoded = verifyToken(token)
    
    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    // Delete book from controller (returns plain data now)
    const result = await deleteBook(params.id, decoded.role)
    
    console.log('Book deleted successfully:', result)
    
    // Wrap in NextResponse.json()
    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Delete book API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}