'use client'
import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BookGrid } from '@/components/books/BookGrid'
import { MyCheckouts } from './MyCheckouts'
import { SearchBar } from '@/components/books/SearchBar'
import { useAuth } from '@/hooks/useAuth'
import { useBooks } from '@/hooks/useBooks'
import { useCheckouts } from '@/hooks/useCheckouts'
import { Heart, Download, Clock, Star } from 'lucide-react'

export const ReaderSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'discover' | 'my-books' | 'favorites'>('discover')
  const [searchQuery, setSearchQuery] = useState('')

  const { user } = useAuth()
  const { books, loading: booksLoading } = useBooks()
  const { checkouts, loading: checkoutsLoading } = useCheckouts()

  const userCheckouts = checkouts.filter(checkout => checkout.userId === user?.id)
  const completedCheckouts = userCheckouts.filter(checkout => checkout.isReturned)
  const currentCheckouts = userCheckouts.filter(checkout => !checkout.isReturned)

  const readerStats = {
    booksRead: completedCheckouts.length,
    currentlyReading: currentCheckouts.length,
    favorites: 0,
    hoursRead: completedCheckouts.length * 8
  }

  const recommendations = books
    .sort((a, b) => (b.total_copies - b.available_copies) - (a.total_copies - a.available_copies))
    .slice(0, 3)
    .map((book) => ({
      id: book.id,
      title: book.title,
      author: book.authors.join(', '),
      rating: (4.5 + Math.random() * 0.5).toFixed(1)
    }))

  const isLoading = booksLoading || checkoutsLoading

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back{user?.firstName ? `, ${user.firstName}` : ''}!
        </h1>
        <p className="text-gray-600 mt-1">Discover your next great read</p>
      </div>

      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
        {[
          { id: 'discover', label: 'Discover' },
          { id: 'my-books', label: 'My Books' },
          { id: 'favorites', label: 'Favorites' }
        ].map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab(tab.id as 'discover' | 'my-books' | 'favorites')}
            className={activeTab === tab.id ? 'bg-blue-500 shadow-sm' : ''}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {activeTab === 'discover' && (
        <div className="space-y-6">
          <div className="space-y-4">
            <SearchBar 
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search for books, authors, or ISBN..."
            />
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <div>
                    <p className="text-2xl font-bold">
                      {isLoading ? '...' : readerStats.booksRead}
                    </p>
                    <p className="text-xs text-gray-600">Books Read</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-blue-500" />
                  <div>
                    <p className="text-2xl font-bold">
                      {isLoading ? '...' : readerStats.currentlyReading}
                    </p>
                    <p className="text-xs text-gray-600">Currently Reading</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Heart className="h-4 w-4 text-red-500" />
                  <div>
                    <p className="text-2xl font-bold">
                      {isLoading ? '...' : readerStats.favorites}
                    </p>
                    <p className="text-xs text-gray-600">Favorites</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Download className="h-4 w-4 text-green-500" />
                  <div>
                    <p className="text-2xl font-bold">
                      {isLoading ? '...' : readerStats.hoursRead}
                    </p>
                    <p className="text-xs text-gray-600">Hours Read</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recommended for You</CardTitle>
              <CardDescription>Popular books in our collection</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {recommendations.map((book) => (
                    <div key={book.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                      <h4 className="font-medium text-sm">{book.title}</h4>
                      <p className="text-xs text-gray-600 mt-1">{book.author}</p>
                      <div className="flex items-center mt-2">
                        <Star className="h-3 w-3 text-yellow-500 mr-1" />
                        <span className="text-xs text-gray-600">{book.rating}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <div>
            <h2 className="text-xl font-semibold mb-4">All Books</h2>
            <BookGrid userRole="reader" searchQuery={searchQuery} />
          </div>
        </div>
      )}

      {activeTab === 'my-books' && (
        <div>
          <MyCheckouts />
        </div>
      )}

      {activeTab === 'favorites' && (
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Your Favorite Books</CardTitle>
              <CardDescription>Books you&apos;ve marked as favorites</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Your favorite books will appear here once you start marking books as favorites...</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}