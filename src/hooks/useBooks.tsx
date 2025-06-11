import { useState, useEffect } from 'react'
import { booksAPI } from '../lib/api'

interface Book {
  id: string
  title: string
  isbn: string
  authors: string[]
  publisher?: string
  published_date?: string
  genre?: string
  description?: string
  total_copies: number
  available_copies: number
  cover_image_url?: string
  created_at: string
  added_by: string
  added_by_user?: {
    first_name: string
    last_name: string
    email: string
  }
}

interface BookSearchParams {
  search?: string
  genre?: string
  author?: string
  limit?: number
  offset?: number
}

interface BookCreateData {
  title: string
  isbn: string
  authors: string[]
  publisher?: string
  publishedDate?: string  
  genre?: string
  description?: string
  totalCopies: number     
  coverImageUrl?: string  
}

interface BookUpdateData {
  title?: string
  isbn?: string
  authors?: string[]
  publisher?: string
  publishedDate?: string  
  genre?: string
  description?: string
  totalCopies?: number    
  availableCopies?: number 
  coverImageUrl?: string  
}

interface CustomError {
  response?: {
    data?: {
      error?: string
    }
  }
  message?: string
}

export function useBooks() {
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchBooks = async (params?: BookSearchParams) => {
    setLoading(true)
    setError(null)
    try {
      const response = await booksAPI.getAll(params)
      setBooks(response.data.books || response.data)
    } catch (err) {
      const customError = err as CustomError
      setError(customError.response?.data?.error || 'Failed to fetch books')
    } finally {
      setLoading(false)
    }
  }

  const createBook = async (data: BookCreateData) => {
    try {
      const response = await booksAPI.create(data)
      await fetchBooks()
      return response
    } catch (err) {
      const customError = err as CustomError
      throw new Error(customError.response?.data?.error || 'Failed to create book')
    }
  }

  const updateBook = async (id: string, data: BookUpdateData) => {
    try {
      const response = await booksAPI.update(id, data)
      await fetchBooks()
      return response
    } catch (err) {
      const customError = err as CustomError
      throw new Error(customError.response?.data?.error || 'Failed to update book')
    }
  }

  const deleteBook = async (id: string) => {
    try {
      await booksAPI.delete(id)
      await fetchBooks()
    } catch (err) {
      const customError = err as CustomError
      throw new Error(customError.response?.data?.error || 'Failed to delete book')
    }
  }

  useEffect(() => {
    fetchBooks()
  }, [])

  return {
    books,
    loading,
    error,
    fetchBooks,
    createBook,
    updateBook,
    deleteBook,
  }
}