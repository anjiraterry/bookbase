'use client'
import React, { useState } from 'react'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Book } from '../../types/database'
import { BookOpen, Edit, Eye, Heart, Star, AlertTriangle, Loader2 } from 'lucide-react'

interface BookCardProps {
  book: Book
  userRole: 'librarian' | 'reader'
  onView: (book: Book) => void
  onEdit?: (book: Book) => void
  onCheckout?: (book: Book) => Promise<void>
  onToggleFavorite?: (book: Book) => void
  isFavorite?: boolean
}

interface BookWithCoverUrl extends Book {
  coverImageUrl?: string
}

export const BookCard: React.FC<BookCardProps> = ({
  book,
  userRole,
  onView,
  onEdit,
  onCheckout,
  onToggleFavorite,
  isFavorite = false
}) => {
  const isAvailable = book.available_copies > 0
  const [imageLoading, setImageLoading] = useState(true)
  const [imageError, setImageError] = useState(false)
  const [showCheckoutDialog, setShowCheckoutDialog] = useState(false)
  const [isCheckingOut, setIsCheckingOut] = useState(false)

  const imageUrl = book.cover_image_url || (book as BookWithCoverUrl).coverImageUrl

  const handleImageLoad = () => {
    setImageLoading(false)
  }

  const handleImageError = () => {
    setImageError(true)
    setImageLoading(false)
  }

  const handleCheckoutClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowCheckoutDialog(true)
  }

  const handleConfirmCheckout = async () => {
    if (!onCheckout) return
    
    try {
      setIsCheckingOut(true)
      await onCheckout(book)
      setShowCheckoutDialog(false)
    } catch (error) {
      console.error('Checkout failed:', error)
    } finally {
      setIsCheckingOut(false)
    }
  }

  React.useEffect(() => {
    if (imageUrl) {
      setImageLoading(true)
      setImageError(false)
    } else {
      setImageLoading(false)
    }
  }, [imageUrl])

  return (
    <>
      <Card className="group hover:shadow-lg transition-all duration-200 cursor-pointer">
        <CardContent className="p-0">
          <div className="relative aspect-[3/4] bg-gray-100 rounded-t-lg overflow-hidden">
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
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className={`object-cover group-hover:scale-105 transition-transform duration-200 ${
                  imageLoading ? 'opacity-0' : 'opacity-100'
                }`}
                onLoad={handleImageLoad}
                onError={handleImageError}
                priority={false}
              />
            )}

            {(!imageUrl || imageError) && !imageLoading && (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200">
                <BookOpen className="h-12 w-12 text-blue-500" />
              </div>
            )}

            <div className="absolute top-2 left-2">
              <Badge variant={isAvailable ? "default" : "secondary"}>
                {isAvailable ? 'Available' : 'Checked Out'}
              </Badge>
            </div>

            {userRole === 'reader' && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                onClick={(e) => {
                  e.stopPropagation()
                  onToggleFavorite?.(book)
                }}
              >
                <Heart className={`h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
              </Button>
            )}

            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    onView(book)
                  }}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Button>

                {userRole === 'librarian' && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      onEdit?.(book)
                    }}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                )}

                {userRole === 'reader' && isAvailable && (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleCheckoutClick}
                  >
                    Checkout
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="p-4 space-y-2">
            <div>
              <h3 className="font-semibold text-sm line-clamp-2 text-gray-900 group-hover:text-blue-600 transition-colors">
                {book.title}
              </h3>
              <p className="text-xs text-gray-600 mt-1">
                {book.authors.join(', ')}
              </p>
            </div>

            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-3 w-3 text-yellow-500 fill-current" />
              ))}
              <span className="text-xs text-gray-500 ml-1">4.5</span>
            </div>

            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>{book.publisher}</span>
              {book.published_date && (
                <span>{new Date(book.published_date).getFullYear()}</span>
              )}
            </div>

            {book.genre && (
              <Badge variant="outline" className="text-xs">
                {book.genre.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </Badge>
            )}

            {userRole === 'librarian' && (
              <div className="text-xs text-gray-500 pt-1 border-t border-gray-100">
                {book.available_copies}/{book.total_copies} available
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={showCheckoutDialog} onOpenChange={setShowCheckoutDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Checkout Book
            </DialogTitle>
            <DialogDescription>
              You are about to checkout &quot;{book.title}&quot; by {book.authors.join(', ')}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Library Policy:</strong>
                <ul className="mt-2 space-y-1 text-sm">
                  <li>• Books must be returned within 10 days</li>
                  <li>• Late fees apply for overdue books</li>
                  <li>• Please report any damage immediately</li>
                </ul>
              </AlertDescription>
            </Alert>

            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-600">Due Date:</span>
                  <span className="font-medium">
                    {new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Available Copies:</span>
                  <span className="font-medium">{book.available_copies}</span>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowCheckoutDialog(false)}
              disabled={isCheckingOut}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmCheckout}
              disabled={isCheckingOut}
            >
              {isCheckingOut ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Checking Out...
                </>
              ) : (
                'Confirm Checkout'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}