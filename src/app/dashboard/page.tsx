'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useBooks } from '@/hooks/useBooks'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { LibrarianSection } from '@/components/features/LibrarianSection'
import { ReaderSection } from '@/components/features/ReaderSection'
import { BookModal } from '@/components/books/BookModal'
import { Book } from '../../types/database'

interface CustomError {
  message?: string
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth()
  const { createBook } = useBooks()
  const router = useRouter()
  const [isAddBookModalOpen, setIsAddBookModalOpen] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const handleAddBook = () => {
    setIsAddBookModalOpen(true)
  }

  const handleSaveBook = async (bookData: Partial<Book>) => {
    try {
      const apiBookData = {
        title: bookData.title || '',
        isbn: bookData.isbn || '',
        authors: bookData.authors || [],
        publisher: bookData.publisher,
        publishedDate: bookData.published_date,
        genre: bookData.genre,
        description: bookData.description,
        totalCopies: bookData.total_copies || 1,
        coverImageUrl: bookData.cover_image_url,
      }

      await createBook(apiBookData)
      
      setIsAddBookModalOpen(false)
      
      alert('Book added successfully!')
      
    } catch (error) {
      const customError = error as CustomError
      console.error('Error saving book:', customError)
      alert(`Error: ${customError.message || 'Failed to save book'}`)
    }
  }

  const handleCloseModal = () => {
    setIsAddBookModalOpen(false)
  }

  return (
    <DashboardLayout>
      {user.role === 'librarian' ? (
        <LibrarianSection onAddBook={handleAddBook} />
      ) : (
        <ReaderSection />
      )}

      {user.role === 'librarian' && (
        <BookModal
          mode="add"
          isOpen={isAddBookModalOpen}
          onClose={handleCloseModal}
          onSave={handleSaveBook}
        />
      )}
    </DashboardLayout>
  )
}