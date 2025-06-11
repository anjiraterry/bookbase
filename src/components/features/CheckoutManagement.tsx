'use client'
import React, { useState } from 'react'
import Image from 'next/image'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Search, Calendar, BookOpen, AlertCircle, Loader2 } from 'lucide-react'
import { useCheckouts } from '@/hooks/useCheckouts'

interface ProcessedCheckout {
  id: string
  book_id: string
  user_id: string
  checkout_date: string
  due_date: string
  return_date?: string
  is_returned: boolean
  is_overdue: boolean
  days_overdue?: number
  book?: {
    id: string
    title: string
    authors: string[]
    cover_image_url?: string
  }
  user?: {
    id: string
    first_name: string
    last_name: string
    email: string
  }
}

interface CustomError {
  message?: string
}

export const CheckoutManagement: React.FC = () => {
  const { checkouts: rawCheckouts, loading, error, fetchCheckouts } = useCheckouts()
  
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState<'all' | 'due-soon' | 'overdue'>('all')

  const checkouts: ProcessedCheckout[] = rawCheckouts.map((checkout) => {
    const dueDate = new Date(checkout.expectedReturnDate)
    const today = new Date()
    const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 3600 * 24))
    
    return {
      id: checkout.id,
      book_id: checkout.bookId,
      user_id: checkout.userId,
      checkout_date: checkout.checkoutDate,
      due_date: checkout.expectedReturnDate,
      return_date: checkout.actualReturnDate,
      is_returned: checkout.isReturned,
      is_overdue: !checkout.isReturned && diffDays < 0,
      days_overdue: !checkout.isReturned && diffDays < 0 ? Math.abs(diffDays) : undefined,
      book: checkout.book ? {
        id: checkout.book.id,
        title: checkout.book.title,
        authors: checkout.book.authors || [],
        cover_image_url: checkout.book.cover_image_url
      } : undefined,
      user: checkout.user ? {
        id: checkout.user.id,
        first_name: checkout.user.firstName || checkout.user.first_name || 'Unknown',
        last_name: checkout.user.lastName || checkout.user.last_name || 'User',
        email: checkout.user.email
      } : undefined
    }
  })

  const handleContactUser = async (checkout: ProcessedCheckout) => {
    try {
      const response = await fetch('/api/notifications/send-reminder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          checkout_id: checkout.id,
          user_id: checkout.user_id,
          book_title: checkout.book?.title,
          due_date: checkout.due_date,
          is_overdue: checkout.is_overdue
        })
      })

      if (!response.ok) {
        throw new Error('Failed to send reminder')
      }

      alert('Reminder sent successfully!')
    } catch (err) {
      const customError = err as CustomError
      console.error('Error sending reminder:', customError)
      alert('Failed to send reminder: ' + customError.message)
    }
  }

  const filteredCheckouts = checkouts.filter(checkout => {
    if (!checkout.book || !checkout.user) return false
    
    const matchesSearch = 
      checkout.book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${checkout.user.first_name} ${checkout.user.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      checkout.user.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    if (filter === 'overdue') return matchesSearch && checkout.is_overdue
    if (filter === 'due-soon') {
      const dueDate = new Date(checkout.due_date)
      const today = new Date()
      const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 3600 * 24))
      return matchesSearch && !checkout.is_overdue && !checkout.is_returned && diffDays <= 2 && diffDays >= 0
    }
    return matchesSearch && !checkout.is_returned
  })

  const stats = {
    total: checkouts.filter(c => !c.is_returned).length,
    overdue: checkouts.filter(c => c.is_overdue && !c.is_returned).length,
    dueSoon: checkouts.filter(c => {
      if (c.is_returned || c.is_overdue) return false
      const dueDate = new Date(c.due_date)
      const today = new Date()
      const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 3600 * 24))
      return diffDays <= 2 && diffDays >= 0
    }).length
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Checkout Management</h2>
          <p className="text-gray-600 mt-1">Monitor and manage all book checkouts</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <span className="ml-2 text-gray-600">Loading checkouts...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Checkout Management</h2>
          <p className="text-gray-600 mt-1">Monitor and manage all book checkouts</p>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Checkouts</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              {error.includes('Authentication') || error.includes('401') ? (
                <Button onClick={() => window.location.reload()}>
                  Refresh Page
                </Button>
              ) : (
                <Button onClick={fetchCheckouts}>Try Again</Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Checkout Management</h2>
        <p className="text-gray-600 mt-1">Monitor and manage all book checkouts</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Checkouts</p>
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
                <p className="text-sm font-medium text-gray-600">Due Soon</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.dueSoon}</p>
              </div>
              <Calendar className="h-8 w-8 text-yellow-500" />
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

      <Card>
        <CardHeader>
          <CardTitle>All Checkouts</CardTitle>
          <CardDescription>View and manage current book checkouts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by book title or user name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('all')}
              >
                All ({stats.total})
              </Button>
              <Button
                variant={filter === 'due-soon' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('due-soon')}
              >
                Due Soon ({stats.dueSoon})
              </Button>
              <Button
                variant={filter === 'overdue' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('overdue')}
              >
                Overdue ({stats.overdue})
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            {filteredCheckouts.map((checkout) => (
              <div key={checkout.id} className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
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
                      <h4 className="font-medium text-gray-900">{checkout.book?.title}</h4>
                      <p className="text-sm text-gray-600">{checkout.book?.authors?.join(', ')}</p>
                      
                      <div className="flex items-center space-x-4 mt-2">
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs">
                              {checkout.user?.first_name?.[0]}{checkout.user?.last_name?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm text-gray-600">
                            {checkout.user?.first_name} {checkout.user?.last_name}
                          </span>
                        </div>
                        
                        <div className="text-sm text-gray-500">
                          Due: {new Date(checkout.due_date).toLocaleDateString()}
                        </div>
                        
                        <div className="text-sm text-gray-500">
                          Checked out: {new Date(checkout.checkout_date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    {checkout.is_overdue ? (
                      <Badge variant="destructive">
                        {checkout.days_overdue} days overdue
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        Active
                      </Badge>
                    )}
                    
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleContactUser(checkout)}
                    >
                      Contact User
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            {filteredCheckouts.length === 0 && (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No checkouts found</h3>
                <p className="text-gray-600">
                  {filter === 'all' ? 'There are no active checkouts at the moment.' :
                   filter === 'overdue' ? 'No overdue checkouts found.' :
                   'No checkouts due soon.'}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}