'use client'
import React, { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { BookOpen, AlertCircle, Loader2 } from 'lucide-react'
import { useCheckouts } from '@/hooks/useCheckouts'

interface UserCheckout {
  id: string
  book_id: string
  user_id: string
  checkout_date: string
  due_date: string
  return_date?: string
  is_returned: boolean
  is_overdue: boolean
  days_remaining: number
  book?: {
    id: string
    title: string
    authors: string[]
    cover_image_url?: string
  }
}

interface CheckoutData {
  id: string
  book_id?: string
  bookId?: string
  user_id?: string
  userId?: string
  checkout_date?: string
  checkoutDate?: string
  due_date?: string
  expectedReturnDate?: string
  return_date?: string
  actualReturnDate?: string
  is_returned?: boolean
  isReturned?: boolean
  book?: {
    id: string
    title: string
    authors: string[]
    cover_image_url?: string
  }
}

interface CustomError {
  message?: string
}

export const MyCheckouts: React.FC = () => {
  const { checkouts, loading, error, fetchMyCheckouts, checkinBook } = useCheckouts()
  const [processingActions, setProcessingActions] = useState<Set<string>>(new Set())
  const [hasFetched, setHasFetched] = useState(false)

  // Convert and process the checkouts data - memoize this calculation
  const userCheckouts: UserCheckout[] = React.useMemo(() => {
    return checkouts.map((checkout: CheckoutData) => {
      const dueDate = new Date(checkout.due_date || checkout.expectedReturnDate || '')
      const checkoutDate = checkout.checkout_date || checkout.checkoutDate || ''
      const isReturned = checkout.is_returned ?? checkout.isReturned ?? false
      
      const today = new Date()
      const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 3600 * 24))
      
      return {
        id: checkout.id,
        book_id: checkout.book_id || checkout.bookId || '',
        user_id: checkout.user_id || checkout.userId || '',
        checkout_date: checkoutDate,
        due_date: checkout.due_date || checkout.expectedReturnDate || '',
        return_date: checkout.return_date || checkout.actualReturnDate,
        is_returned: isReturned,
        is_overdue: !isReturned && diffDays < 0,
        days_remaining: diffDays,
        book: checkout.book
      }
    }).filter((checkout: UserCheckout) => !checkout.is_returned)
  }, [checkouts])

  // Handle book return using the hook's checkinBook method
  const handleReturnBook = async (checkoutId: string) => {
    try {
      setProcessingActions(prev => new Set(prev).add(checkoutId))
      
      await checkinBook(checkoutId)
      await fetchMyCheckouts()
      
      alert('Book returned successfully!')
    } catch (err) {
      const customError = err as CustomError
      console.error('Error returning book:', customError)
      alert('Failed to return book: ' + customError.message)
    } finally {
      setProcessingActions(prev => {
        const newSet = new Set(prev)
        newSet.delete(checkoutId)
        return newSet
      })
    }
  }

  // Fetch data on mount - only once
  useEffect(() => {
    if (!hasFetched) {
      console.log('MyCheckouts component mounted, fetching checkouts...')
      fetchMyCheckouts()
      setHasFetched(true)
    }
  }, [fetchMyCheckouts, hasFetched])

  // Debug logging - separate useEffect to avoid triggering re-renders
  useEffect(() => {
    console.log('MyCheckouts - Raw checkouts from hook:', checkouts)
    console.log('MyCheckouts - Processed userCheckouts:', userCheckouts)
  }, [checkouts.length]) // Only log when the count changes

  // Calculate stats
  const stats = React.useMemo(() => ({
    total: userCheckouts.length,
    dueSoon: userCheckouts.filter(c => !c.is_overdue && c.days_remaining <= 2 && c.days_remaining >= 0).length,
    overdue: userCheckouts.filter(c => c.is_overdue).length
  }), [userCheckouts])

  const handleRefresh = useCallback(() => {
    fetchMyCheckouts()
  }, [fetchMyCheckouts])

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Checked Out Books</h2>
          <p className="text-gray-600 mt-1">Manage your current book loans</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <span className="ml-2 text-gray-600">Loading your checkouts...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Checked Out Books</h2>
          <p className="text-gray-600 mt-1">Manage your current book loans</p>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Your Checkouts</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={handleRefresh}>Try Again</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">My Checked Out Books</h2>
        <p className="text-gray-600 mt-1">Manage your current book loans</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Books</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <BookOpen className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Overdue</p>
                <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Checked Out Books */}
      <Card>
        <CardHeader>
          <CardTitle>Current Checkouts</CardTitle>
          <CardDescription>Books you currently have checked out</CardDescription>
        </CardHeader>
        <CardContent>
          {userCheckouts.length > 0 ? (
            <div className="space-y-4">
              {userCheckouts.map((checkout) => {
                const isProcessing = processingActions.has(checkout.id)
                return (
                  <div key={checkout.id} className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {/* Book Cover */}
                        <div className="relative w-12 h-16 bg-gray-200 rounded flex items-center justify-center overflow-hidden">
                          {checkout.book?.cover_image_url ? (
                            <Image
                              src={checkout.book.cover_image_url}
                              alt={checkout.book.title || 'Book cover'}
                              fill
                              sizes="48px"
                              className="object-cover"
                            />
                          ) : (
                            <BookOpen className="h-6 w-6 text-gray-500" />
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{checkout.book?.title || 'Unknown Title'}</h4>
                          <p className="text-sm text-gray-600">{checkout.book?.authors?.join(', ') || 'Unknown Author'}</p>
                          
                          <div className="flex items-center space-x-4 mt-2">
                            <div className="text-sm text-gray-500">
                              Checked out: {new Date(checkout.checkout_date).toLocaleDateString()}
                            </div>
                            <div className="text-sm text-gray-500">
                              Due: {new Date(checkout.due_date).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        {/* Status Badge */}
                        {checkout.is_overdue ? (
                          <Badge variant="destructive">
                            {Math.abs(checkout.days_remaining)} days overdue
                          </Badge>
                        ) : checkout.days_remaining <= 2 && checkout.days_remaining >= 0 ? (
                          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                            Due in {checkout.days_remaining} days
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            {checkout.days_remaining} days remaining
                          </Badge>
                        )}
                        
                        {/* Return Button Only */}
                        <Button 
                          size="sm"
                          onClick={() => handleReturnBook(checkout.id)}
                          disabled={isProcessing}
                        >
                          {isProcessing ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            'Return'
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <BookOpen className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <p>You don&apos;t have any books checked out currently.</p>
              <p className="text-sm">Browse our collection to find your next great read!</p>
              <Button 
                className="mt-4" 
                onClick={() => window.location.href = '/books'}
              >
                Browse Books
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}