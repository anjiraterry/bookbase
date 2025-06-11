import { useState, useEffect } from 'react'
import { booksAPI } from '../lib/api'

interface Book {
  id: string
  title: string
  isbn: string
  authors: string[]
  publisher?: string
  published_date?: string  // Changed from publishedDate
  genre?: string
  description?: string
  total_copies: number     // Changed from totalCopies
  available_copies: number // Changed from availableCopies
  cover_image_url?: string // Changed from coverImageUrl
  created_at: string       // Changed from dateAddedToLibrary
  added_by: string         // Changed from addedBy
  added_by_user?: {        // Add this if you need user info
    first_name: string
    last_name: string
    email: string
  }
}

export function useBooks() {
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchBooks = async (params?: any) => {
    setLoading(true)
    setError(null)
    try {
      const response = await booksAPI.getAll(params)
      setBooks(response.data.books || response.data)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch books')
    } finally {
      setLoading(false)
    }
  }

  const createBook = async (data: any) => {
    try {
      const response = await booksAPI.create(data)
      await fetchBooks() // Refresh the list
      return response
    } catch (err: any) {
      throw new Error(err.response?.data?.error || 'Failed to create book')
    }
  }

  const updateBook = async (id: string, data: any) => {
    try {
      const response = await booksAPI.update(id, data)
      await fetchBooks() // Refresh the list
      return response
    } catch (err: any) {
      throw new Error(err.response?.data?.error || 'Failed to update book')
    }
  }

  const deleteBook = async (id: string) => {
    try {
      await booksAPI.delete(id)
      await fetchBooks() // Refresh the list
    } catch (err: any) {
      throw new Error(err.response?.data?.error || 'Failed to delete book')
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