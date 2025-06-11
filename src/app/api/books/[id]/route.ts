import { NextRequest, NextResponse } from 'next/server'
import { getBookById, updateBook, deleteBook } from '@/server/controller/bookController'
import { verifyToken } from '@/server/lib/serverUtils'
import { updateBookSchema } from '@/server/lib/validations'

interface CustomError {
  message?: string
  status?: number
}

export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    console.log('GET book API called for ID:', context.params.id)
    
    const book = await getBookById(context.params.id)
    
    console.log('Book retrieved successfully:', book)
    
    return NextResponse.json(book)
  } catch (error) {
    const customError = error as CustomError
    console.error('Get book API error:', customError)
    return NextResponse.json(
      { error: customError.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    console.log('PUT book API called for ID:', context.params.id)
    
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
    
    const updatedBook = await updateBook(context.params.id, validation.data, decoded.role)
    
    console.log('Book updated successfully:', updatedBook)
    
    return NextResponse.json(updatedBook)
  } catch (error) {
    const customError = error as CustomError
    console.error('Update book API error:', customError)
    return NextResponse.json(
      { error: customError.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    console.log('DELETE book API called for ID:', context.params.id)
    
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
    
    const result = await deleteBook(context.params.id, decoded.role)
    
    console.log('Book deleted successfully:', result)
    
    return NextResponse.json(result)
  } catch (error) {
    const customError = error as CustomError
    console.error('Delete book API error:', customError)
    return NextResponse.json(
      { error: customError.message || 'Internal server error' },
      { status: 500 }
    )
  }
}