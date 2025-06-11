'use client'
import React, { useState } from 'react'
import Image from 'next/image'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Book } from '../../types/database'
import { BookOpen, Calendar, Building, Hash, Star, Heart, Clock, CheckCircle } from 'lucide-react'

interface BookDetailPanelProps {
  book: Book | null
  userRole: 'librarian' | 'reader'
  onCheckout?: (book: Book) => void
  onEdit?: (book: Book) => void
  onToggleFavorite?: (book: Book) => void
  isFavorite?: boolean
}

interface BookWithCoverUrl extends Book {
  coverImageUrl?: string
}

export const BookDetailPanel: React.FC<BookDetailPanelProps> = ({
  book,
  userRole,
  onCheckout,
  onEdit,
  onToggleFavorite,
  isFavorite = false
}) => {
  const [imageLoading, setImageLoading] = useState(true)
  const [imageError, setImageError] = useState(false)
  const [isCheckingOut, setIsCheckingOut] = useState(false)

  const handleImageLoad = () => {
    setImageLoading(false)
  }

  const handleImageError = () => {
    setImageError(true)
    setImageLoading(false)
  }

  React.useEffect(() => {
    if (book) {
      const imageUrl = book.cover_image_url || (book as BookWithCoverUrl).coverImageUrl
      if (imageUrl) {
        setImageLoading(true)
        setImageError(false)
      } else {
        setImageLoading(false)
      }
    }
  }, [book])

  if (!book) {
    return (
      <Card className="w-full h-full">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Select a book to view details</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const isAvailable = book.available_copies > 0
  const imageUrl = book.cover_image_url || (book as BookWithCoverUrl).coverImageUrl

  const handleCheckout = async () => {
    if (!onCheckout) return
    
    setIsCheckingOut(true)
    try {
      await onCheckout(book)
    } catch (error) {
      console.error('Checkout error:', error)
    } finally {
      setIsCheckingOut(false)
    }
  }

  const getDueDate = () => {
    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + 10)
    return dueDate.toLocaleDateString()
  }

  return (
    <Card className="w-full h-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{book.title}</CardTitle>
            <CardDescription className="mt-1">
              {book.authors.join(', ')}
            </CardDescription>
          </div>
          {userRole === 'reader' && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onToggleFavorite?.(book)}
            >
              <Heart className={`h-5 w-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative w-32 h-44 bg-gray-100 rounded-lg overflow-hidden shadow-md">
            {imageLoading && imageUrl && !imageError && (
              <div className="w-full h-full flex items-center justify-center bg-gray-200">
                <div className="animate-pulse text-gray-400">Loading...</div>
              </div>
            )}

            {imageUrl && !imageError && (
              <Image
                src={imageUrl}
                alt={book.title}
                fill
                sizes="128px"
                className={`object-cover transition-opacity duration-200 ${
                  imageLoading ? 'opacity-0' : 'opacity-100'
                }`}
                onLoad={handleImageLoad}
                onError={handleImageError}
                priority={false}
              />
            )}

            {(!imageUrl || imageError) && !imageLoading && (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200">
                <BookOpen className="h-8 w-8 text-blue-500" />
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 text-yellow-500 fill-current" />
              ))}
            </div>
            <span className="text-sm font-medium">4.8</span>
            <span className="text-sm text-gray-500">(320 ratings)</span>
          </div>

          <div className="text-center space-y-3 w-full">
            <Badge variant={isAvailable ? "default" : "secondary"} className="text-sm">
              {isAvailable ? `${book.available_copies} Available` : 'All Copies Checked Out'}
            </Badge>

            {userRole === 'reader' && (
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg text-sm space-y-3">
                <div className="flex items-center justify-center gap-2 text-blue-800 font-medium">
                  <CheckCircle className="h-4 w-4" />
                  <span>Checkout Details</span>
                </div>
                
                <div className="space-y-2 text-blue-700">
                  <div className="flex justify-between">
                    <span>Borrowing Period:</span>
                    <span className="font-medium">10 days</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Due Date:</span>
                    <span className="font-medium">{getDueDate()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Email Reminder:</span>
                    <span className="font-medium">2 days before due</span>
                  </div>
                </div>

                {isAvailable ? (
                  <Button 
                    onClick={handleCheckout} 
                    className="w-full mt-3"
                    disabled={isCheckingOut}
                  >
                    <BookOpen className="h-4 w-4 mr-2" />
                    {isCheckingOut ? 'Processing Checkout...' : 'Checkout This Book'}
                  </Button>
                ) : (
                  <Button variant="outline" className="w-full mt-3" disabled>
                    <Clock className="h-4 w-4 mr-2" />
                    All Copies Currently Checked Out
                  </Button>
                )}
              </div>
            )}

            {userRole === 'librarian' && (
              <div className="flex gap-2">
                <Button onClick={() => onEdit?.(book)} variant="outline" className="flex-1">
                  Edit Book
                </Button>
              </div>
            )}
          </div>
        </div>

        <Separator />

        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-blue-600">{book.total_copies}</p>
            <p className="text-xs text-gray-600">Total Copies</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-600">{book.available_copies}</p>
            <p className="text-xs text-gray-600">Available</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-purple-600">{book.total_copies - book.available_copies}</p>
            <p className="text-xs text-gray-600">Checked Out</p>
          </div>
        </div>

        <Separator />

        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <Hash className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">ISBN:</span>
            <span className="text-sm font-medium">{book.isbn}</span>
          </div>

          <div className="flex items-center space-x-3">
            <Building className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">Publisher:</span>
            <span className="text-sm font-medium">{book.publisher}</span>
          </div>

          {book.published_date && (
            <div className="flex items-center space-x-3">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600">Published:</span>
              <span className="text-sm font-medium">
                {new Date(book.published_date).toLocaleDateString()}
              </span>
            </div>
          )}

          {book.genre && (
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-600">Genre:</span>
              <Badge variant="outline">
                {book.genre.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </Badge>
            </div>
          )}

          {userRole === 'librarian' && (
            <div className="flex items-center space-x-3">
              <BookOpen className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600">Inventory:</span>
              <span className="text-sm font-medium">
                {book.available_copies}/{book.total_copies} available
              </span>
            </div>
          )}
        </div>

        <Separator />

        {book.description && (
          <div>
            <h4 className="font-medium text-sm mb-2">Description</h4>
            <p className="text-sm text-gray-600 leading-relaxed">
              {book.description}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}