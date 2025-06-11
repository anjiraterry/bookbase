import { supabase } from '../lib/supabase'
import { BookInput, UpdateBookInput, SearchBooksInput } from '../lib/validations'

interface DatabaseBook {
  id: string
  title: string
  isbn: string
  revision_number?: string
  published_date?: string
  publisher?: string
  authors: string[]
  genre?: string
  cover_image_url?: string
  description?: string
  total_copies: number
  available_copies: number
  added_by: string
  created_at: string
  updated_at: string
  added_by_user?: {
    first_name: string
    last_name: string
    email: string
  }
}

interface BooksResponse {
  books: DatabaseBook[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

interface DeleteResponse {
  message: string
}

interface CustomError {
  message: string
  code?: string
}

interface UpdateData {
  title?: string
  isbn?: string
  revision_number?: string
  published_date?: string
  publisher?: string
  authors?: string[]
  genre?: string
  cover_image_url?: string
  description?: string
  total_copies?: number
  available_copies?: number
}

export async function createBook(data: BookInput, userId: string): Promise<DatabaseBook> {
  try {
    console.log('createBook called with data:', data, 'userId:', userId)
    
    const { data: newBook, error } = await supabase
      .from('books')
      .insert({
        title: data.title,
        isbn: data.isbn,
        revision_number: data.revisionNumber,
        published_date: data.publishedDate,
        publisher: data.publisher,
        authors: data.authors,
        genre: data.genre,
        cover_image_url: data.coverImageUrl,
        description: data.description,
        total_copies: data.totalCopies,
        available_copies: data.totalCopies,
        added_by: userId
      })
      .select(`
        *,
        added_by_user:users!added_by(first_name, last_name, email)
      `)
      .single()

    if (error) {
      console.error('Database error in createBook:', error)
      throw new Error('Failed to create book')
    }

    console.log('Book created successfully:', newBook)

    return newBook as DatabaseBook
  } catch (error) {
    const customError = error as CustomError
    console.error('Error in createBook controller:', customError)
    throw customError
  }
}

export async function getAllBooks(searchParams?: SearchBooksInput): Promise<BooksResponse> {
  try {
    console.log('getAllBooks called with params:', searchParams)
    
    let query = supabase
      .from('books')
      .select(`
        *,
        added_by_user:users!added_by(first_name, last_name, email)
      `)

    // Apply search filters
    if (searchParams?.title) {
      query = query.ilike('title', `%${searchParams.title}%`)
    }
    if (searchParams?.isbn) {
      query = query.ilike('isbn', `%${searchParams.isbn}%`)
    }
    if (searchParams?.publisher) {
      query = query.ilike('publisher', `%${searchParams.publisher}%`)
    }
    if (searchParams?.genre) {
      query = query.eq('genre', searchParams.genre)
    }
    if (searchParams?.dateAddedFrom) {
      query = query.gte('date_added_to_library', searchParams.dateAddedFrom)
    }
    if (searchParams?.dateAddedTo) {
      query = query.lte('date_added_to_library', searchParams.dateAddedTo)
    }

    // Pagination
    const page = searchParams?.page || 1
    const limit = searchParams?.limit || 50
    const offset = (page - 1) * limit

    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    console.log('About to execute query...')
    const { data: books, error, count } = await query

    console.log('Query result:', { books, error, count })
    console.log('Number of books found:', books?.length || 0)

    if (error) {
      console.error('Database error in getAllBooks:', error)
      throw new Error('Failed to fetch books')
    }

    console.log('Books retrieved:', books)

    return {
      books: (books || []) as DatabaseBook[],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    }
  } catch (error) {
    const customError = error as CustomError
    console.error('Error in getAllBooks controller:', customError)
    throw customError
  }
}

export async function getBookById(bookId: string): Promise<DatabaseBook> {
  try {
    console.log('getBookById called with bookId:', bookId)
    
    const { data: book, error } = await supabase
      .from('books')
      .select(`
        *,
        added_by_user:users!added_by(first_name, last_name, email)
      `)
      .eq('id', bookId)
      .single()

    if (error || !book) {
      console.error('Book not found:', error)
      throw new Error('Book not found')
    }

    return book as DatabaseBook
  } catch (error) {
    const customError = error as CustomError
    console.error('Error in getBookById controller:', customError)
    throw customError
  }
}

export async function updateBook(bookId: string, data: UpdateBookInput, userRole: string): Promise<DatabaseBook> {
  try {
    console.log('updateBook called with bookId:', bookId, 'data:', data, 'userRole:', userRole)
    
    // Only librarians can update books
    if (userRole !== 'librarian') {
      throw new Error('Librarian access required')
    }

    const updateData: UpdateData = {}
    
    if (data.title) updateData.title = data.title
    if (data.isbn) updateData.isbn = data.isbn
    if (data.revisionNumber !== undefined) updateData.revision_number = data.revisionNumber
    if (data.publishedDate !== undefined) updateData.published_date = data.publishedDate
    if (data.publisher !== undefined) updateData.publisher = data.publisher
    if (data.authors) updateData.authors = data.authors
    if (data.genre !== undefined) updateData.genre = data.genre
    if (data.coverImageUrl !== undefined) updateData.cover_image_url = data.coverImageUrl
    if (data.description !== undefined) updateData.description = data.description
    if (data.totalCopies) {
      updateData.total_copies = data.totalCopies
      // Update available copies proportionally
      const { data: currentBook } = await supabase
        .from('books')
        .select('total_copies, available_copies')
        .eq('id', bookId)
        .single()
      
      if (currentBook) {
        const checkedOut = currentBook.total_copies - currentBook.available_copies
        updateData.available_copies = Math.max(0, data.totalCopies - checkedOut)
      }
    }

    const { data: updatedBook, error } = await supabase
      .from('books')
      .update(updateData)
      .eq('id', bookId)
      .select(`
        *,
        added_by_user:users!added_by(first_name, last_name, email)
      `)
      .single()

    if (error) {
      console.error('Database error in updateBook:', error)
      throw new Error('Failed to update book')
    }

    console.log('Book updated successfully:', updatedBook)

    return updatedBook as DatabaseBook
  } catch (error) {
    const customError = error as CustomError
    console.error('Error in updateBook controller:', customError)
    throw customError
  }
}

export async function deleteBook(bookId: string, userRole: string): Promise<DeleteResponse> {
  try {
    console.log('deleteBook called with bookId:', bookId, 'userRole:', userRole)
    
    // Only librarians can delete books
    if (userRole !== 'librarian') {
      throw new Error('Librarian access required')
    }

    // Check if book has active checkouts
    const { data: activeCheckouts } = await supabase
      .from('checkouts')
      .select('id')
      .eq('book_id', bookId)
      .eq('is_returned', false)

    if (activeCheckouts && activeCheckouts.length > 0) {
      throw new Error('Cannot delete book with active checkouts')
    }

    const { error } = await supabase
      .from('books')
      .delete()
      .eq('id', bookId)

    if (error) {
      console.error('Database error in deleteBook:', error)
      throw new Error('Failed to delete book')
    }

    console.log('Book deleted successfully')
    return { message: 'Book deleted successfully' }
  } catch (error) {
    const customError = error as CustomError
    console.error('Error in deleteBook controller:', customError)
    throw customError
  }
}

export async function getBooksByGenre(genre: string): Promise<DatabaseBook[]> {
  try {
    console.log('getBooksByGenre called with genre:', genre)
    
    const { data: books, error } = await supabase
      .from('books')
      .select(`
        *,
        added_by_user:users!added_by(first_name, last_name, email)
      `)
      .eq('genre', genre)
      .order('title')

    if (error) {
      console.error('Database error in getBooksByGenre:', error)
      throw new Error('Failed to fetch books by genre')
    }

    console.log('Books by genre retrieved:', books?.length || 0)
    return (books || []) as DatabaseBook[]
  } catch (error) {
    const customError = error as CustomError
    console.error('Error in getBooksByGenre controller:', customError)
    throw customError
  }
}

export async function getAvailableBooks(): Promise<DatabaseBook[]> {
  try {
    console.log('getAvailableBooks called')
    
    const { data: books, error } = await supabase
      .from('books')
      .select(`
        *,
        added_by_user:users!added_by(first_name, last_name, email)
      `)
      .gt('available_copies', 0)
      .order('title')

    if (error) {
      console.error('Database error in getAvailableBooks:', error)
      throw new Error('Failed to fetch available books')
    }

    console.log('Available books retrieved:', books?.length || 0)
    return (books || []) as DatabaseBook[]
  } catch (error) {
    const customError = error as CustomError
    console.error('Error in getAvailableBooks controller:', customError)
    throw customError
  }
}