'use client'
import React, { useState, useEffect, useCallback } from 'react'
import { BookCard } from './BookCard'
import { BookModal } from './BookModal'
import { BookOpen } from 'lucide-react'
import { Book } from '../../types/database'
import { booksAPI } from '../../lib/api'
import { useCheckouts } from '../../hooks/useCheckouts'

interface BookGridProps {
  userRole: 'librarian' | 'reader'
  searchQuery?: string
  selectedCategory?: string
}

interface CreateBookInput {
  title: string
  isbn: string
  authors: string[]
  publisher?: string
  publishedDate?: string
  genre?: string
  description?: string
  totalCopies: number
  coverImageUrl?: string
  revisionNumber?: string
}

interface UpdateBookInput {
  title?: string
  isbn?: string
  authors?: string[]
  publisher?: string
  publishedDate?: string
  genre?: string
  description?: string
  totalCopies?: number
  coverImageUrl?: string
  revisionNumber?: string
}

interface CustomError {
  message?: string
}

interface SearchParams {
  page: number
  limit: number
  title?: string
  genre?: string
}

export const BookGrid: React.FC<BookGridProps> = ({
  userRole,
  searchQuery = '',
  selectedCategory = 'all'
}) => {
  const { checkoutBook } = useCheckouts()
  
  const [selectedBook, setSelectedBook] = useState<Book | null>(null)
  const [modalMode, setModalMode] = useState<'view' | 'edit' | 'add'>('view')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0
  })

  const fetchBooks = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const params: SearchParams = {
        page: pagination.page,
        limit: pagination.limit
      }

      if (searchQuery) {
        params.title = searchQuery
      }
      if (selectedCategory && selectedCategory !== 'all') {
        params.genre = selectedCategory
      }

      console.log('Fetching books with params:', params)
      
      const response = await booksAPI.getAll(params)
      
      console.log('Books API response:', response)
      
      if (response.books) {
        setBooks(response.books)
        setPagination(response.pagination)
      } else {
        setBooks(Array.isArray(response) ? response : [])
      }
    } catch (error) {
      const customError = error as CustomError
      console.error('Error fetching books:', customError)
      setError('Failed to load books. Please try again.')
      setBooks([])
    } finally {
      setLoading(false)
    }
  }, [pagination.page, pagination.limit, searchQuery, selectedCategory])

  useEffect(() => {
    fetchBooks()
  }, [fetchBooks])

  useEffect(() => {
    if (pagination.page !== 1) {
      setPagination(prev => ({ ...prev, page: 1 }))
    }
  }, [searchQuery, selectedCategory, pagination.page])

  const filteredBooks = books.filter(book => {
    const matchesSearch = !searchQuery || 
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.authors.some(author => author.toLowerCase().includes(searchQuery.toLowerCase())) ||
      book.isbn.includes(searchQuery) ||
      book.publisher?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCategory = selectedCategory === 'all' || book.genre === selectedCategory

    return matchesSearch && matchesCategory
  })

  const handleView = (book: Book) => {
    setSelectedBook(book)
    setModalMode('view')
    setIsModalOpen(true)
  }

  const handleEdit = (book: Book) => {
    setSelectedBook(book)
    setModalMode('edit')
    setIsModalOpen(true)
  }

  const handleCheckout = async (book: Book) => {
    try {
      console.log('Checking out book:', book.title)
      
      await checkoutBook(book.id)
      
      alert(`Successfully checked out "${book.title}"! You can view your checkouts in the My Checkouts section.`)
      
      await fetchBooks()
      
    } catch (error) {
      const customError = error as CustomError
      console.error('Checkout failed:', customError)
      alert(`Failed to checkout "${book.title}": ${customError.message}`)
      throw error
    }
  }

  const handleToggleFavorite = (book: Book) => {
    console.log('Toggling favorite for book:', book.title)
    alert('Favorites functionality coming soon!')
  }

  const handleSave = async (bookData: Partial<Book>) => {
    try {
      console.log('Saving book:', bookData)
      
      if (modalMode === 'edit' && selectedBook) {
        
        const updateData: UpdateBookInput = {}
        
        if (bookData.title !== undefined) updateData.title = bookData.title
        if (bookData.isbn !== undefined) updateData.isbn = bookData.isbn
        if (bookData.authors !== undefined) updateData.authors = bookData.authors
        if (bookData.publisher !== undefined) updateData.publisher = bookData.publisher
        if (bookData.published_date !== undefined) updateData.publishedDate = bookData.published_date
        if (bookData.genre !== undefined) updateData.genre = bookData.genre
        if (bookData.description !== undefined) updateData.description = bookData.description
        if (bookData.total_copies !== undefined) updateData.totalCopies = bookData.total_copies
        if (bookData.cover_image_url !== undefined) updateData.coverImageUrl = bookData.cover_image_url
        if (bookData.revision_number !== undefined) updateData.revisionNumber = bookData.revision_number

        await booksAPI.update(selectedBook.id, updateData)
        console.log('Book updated successfully')
        
      } else if (modalMode === 'add') {
        
        const createData: CreateBookInput = {
          title: bookData.title || '',
          isbn: bookData.isbn || '',
          authors: bookData.authors || [],
          totalCopies: bookData.total_copies || 1,
          publisher: bookData.publisher,
          publishedDate: bookData.published_date,
          genre: bookData.genre,
          description: bookData.description,
          coverImageUrl: bookData.cover_image_url,
          revisionNumber: bookData.revision_number
        }

        if (!createData.title || !createData.isbn || !createData.authors.length) {
          throw new Error('Title, ISBN, and at least one author are required')
        }

        await booksAPI.create(createData)
        console.log('Book created successfully')
      }
      
      await fetchBooks()
      
      closeModal()
    } catch (error) {
      const customError = error as CustomError
      console.error('Error saving book:', customError)
      alert(`Error saving book: ${customError.message || 'Unknown error'}`)
    }
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedBook(null)
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4 animate-pulse" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Loading books...</h3>
        <p className="text-gray-500">Please wait while we fetch the latest books.</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <BookOpen className="h-12 w-12 text-red-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-red-900 mb-2">Error loading books</h3>
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={fetchBooks}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
        {filteredBooks.map((book) => (
          <BookCard
            key={book.id}
            book={book}
            userRole={userRole}
            onView={handleView}
            onEdit={userRole === 'librarian' ? handleEdit : undefined}
            onCheckout={userRole === 'reader' ? handleCheckout : undefined}
            onToggleFavorite={userRole === 'reader' ? handleToggleFavorite : undefined}
            isFavorite={false}
          />
        ))}
      </div>

      {filteredBooks.length === 0 && !loading && (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No books found</h3>
          <p className="text-gray-500">
            {searchQuery ? 'Try adjusting your search terms' : 'No books available in this category'}
          </p>
          {userRole === 'librarian' && (
            <button
              onClick={() => {
                setModalMode('add')
                setIsModalOpen(true)
              }}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Add First Book
            </button>
          )}
        </div>
      )}

      {pagination.totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 mt-6">
          <button
            onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
            disabled={pagination.page === 1}
            className="px-3 py-1 rounded border disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">
            Page {pagination.page} of {pagination.totalPages} ({pagination.total} books)
          </span>
          <button
            onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.totalPages, prev.page + 1) }))}
            disabled={pagination.page === pagination.totalPages}
            className="px-3 py-1 rounded border disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}

      <BookModal
        mode={modalMode}
        book={selectedBook || undefined}
        isOpen={isModalOpen}
        onClose={closeModal}
        onSave={handleSave}
      />
    </>
  )
}