'use client'
import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Book } from '../../types/database'
import { X, Upload, Star, Camera } from 'lucide-react'
import { booksAPI } from '@/lib/api'
import { toast } from 'sonner'

interface BookModalProps {
  mode: 'view' | 'add' | 'edit'
  book?: Book
  isOpen: boolean
  onClose: () => void
  onSave?: (book: Partial<Book>) => void
}

export const BookModal: React.FC<BookModalProps> = ({
  mode,
  book,
  isOpen,
  onClose,
  onSave
}) => {
  const [formData, setFormData] = useState<Partial<Book>>({
    title: '',
    isbn: '',
    authors: [],
    publisher: '',
    published_date: '',
    genre: '',
    description: '',
    total_copies: 1,
    available_copies: 1,
    revision_number: '',
    cover_image_url: ''
  })

  const [authorInput, setAuthorInput] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [uploadingImage, setUploadingImage] = useState(false)
  const [imagePreview, setImagePreview] = useState<string>('')

  useEffect(() => {
    if (book && (mode === 'view' || mode === 'edit')) {
      setFormData(book)
      setImagePreview(book.cover_image_url || '')
    } else if (mode === 'add') {
      setFormData({
        title: '',
        isbn: '',
        authors: [],
        publisher: '',
        published_date: '',
        genre: '',
        description: '',
        total_copies: 1,
        available_copies: 1,
        revision_number: '',
        cover_image_url: ''
      })
      setImagePreview('')
    }
  }, [book, mode, isOpen])

  const genres = [
    'fiction', 'non_fiction', 'science', 'history', 'biography', 
    'mystery', 'romance', 'fantasy', 'thriller', 'self_help', 
    'children', 'other'
  ]

  const handleInputChange = (field: keyof Book, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleImageUrlChange = (url: string) => {
    setFormData(prev => ({ ...prev, cover_image_url: url }))
    setImagePreview(url)
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB')
      return
    }

    try {
      setUploadingImage(true)
      
      // Create FormData for file upload
      const formDataUpload = new FormData()
      formDataUpload.append('file', file)
      
      // Upload to book cover upload endpoint
      const uploadResponse = await booksAPI.uploadBookCover(formDataUpload)
      
      // Update form data with new image URL
      const imageUrl = uploadResponse.url
      handleImageUrlChange(imageUrl)
      
      toast.success('Book cover uploaded successfully')
    } catch (error: any) {
      console.error('Image upload error:', error)
      toast.error(error.message || 'Failed to upload image')
    } finally {
      setUploadingImage(false)
    }
  }

  const handleRemoveImage = () => {
    setFormData(prev => ({ ...prev, cover_image_url: '' }))
    setImagePreview('')
  }

  const handleAddAuthor = () => {
    if (authorInput.trim()) {
      const currentAuthors = formData.authors || []
      if (!currentAuthors.includes(authorInput.trim())) {
        handleInputChange('authors', [...currentAuthors, authorInput.trim()])
        setAuthorInput('')
      }
    }
  }

  const handleRemoveAuthor = (authorToRemove: string) => {
    const currentAuthors = formData.authors || []
    handleInputChange('authors', currentAuthors.filter(author => author !== authorToRemove))
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title?.trim()) newErrors.title = 'Title is required'
    if (!formData.isbn?.trim()) newErrors.isbn = 'ISBN is required'
    if (!formData.authors?.length) newErrors.authors = 'At least one author is required'
    if (!formData.publisher?.trim()) newErrors.publisher = 'Publisher is required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = () => {
    if (validateForm()) {
      onSave?.(formData)
      onClose()
    }
  }

  const isViewMode = mode === 'view'
  const modalTitle = mode === 'add' ? 'Add New Book' : mode === 'edit' ? 'Edit Book' : 'Book Details'

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{modalTitle}</DialogTitle>
          <DialogDescription>
            {mode === 'add' && 'Add a new book to the library collection'}
            {mode === 'edit' && 'Update book information'}
            {mode === 'view' && 'View book details'}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Book Cover */}
          <div className="space-y-4">
            <Label>Book Cover</Label>
            
            {/* Cover Preview */}
            <div className="relative group">
              <div className="aspect-[3/4] bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Book Cover Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center p-4">
                    <Camera className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="text-sm text-gray-500 mt-2">Book Cover Preview</p>
                  </div>
                )}
              </div>
              
              {imagePreview && !isViewMode && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="h-8 w-8 text-white" />
                </div>
              )}
            </div>

            {/* Upload Options */}
            {!isViewMode && (
              <div className="space-y-3">
                {/* File Upload */}
                <div>
                  <Label htmlFor="book-cover-upload" className="cursor-pointer">
                    <div className="flex items-center justify-center gap-2 p-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors">
                      <Upload className="h-4 w-4" />
                      <span className="text-sm">
                        {uploadingImage ? 'Uploading...' : 'Upload Book Cover'}
                      </span>
                    </div>
                  </Label>
                  <Input
                    id="book-cover-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    disabled={uploadingImage}
                    className="hidden"
                  />
                </div>

                {/* URL Input */}
                <div>
                  <Label htmlFor="cover-url">Or enter image URL</Label>
                  <Input
                    id="cover-url"
                    value={formData.cover_image_url || ''}
                    onChange={(e) => handleImageUrlChange(e.target.value)}
                    placeholder="https://example.com/book-cover.jpg"
                    className="mt-1"
                  />
                </div>

                {/* Remove Image Button */}
                {imagePreview && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleRemoveImage}
                    className="w-full flex items-center gap-2"
                  >
                    <X className="h-4 w-4" />
                    Remove Cover
                  </Button>
                )}
              </div>
            )}

            {/* View Mode Stats */}
            {isViewMode && book && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Status</span>
                  <Badge variant={book.available_copies > 0 ? "default" : "secondary"}>
                    {book.available_copies > 0 ? 'Available' : 'Checked Out'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Rating</span>
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-500 fill-current" />
                    ))}
                    <span className="ml-1 text-sm text-gray-600">4.5</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Book Information */}
          <div className="lg:col-span-2 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title || ''}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  readOnly={isViewMode}
                  className={errors.title ? 'border-red-500' : ''}
                />
                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
              </div>

              <div>
                <Label htmlFor="isbn">ISBN *</Label>
                <Input
                  id="isbn"
                  value={formData.isbn || ''}
                  onChange={(e) => handleInputChange('isbn', e.target.value)}
                  readOnly={isViewMode}
                  className={errors.isbn ? 'border-red-500' : ''}
                />
                {errors.isbn && <p className="text-red-500 text-sm mt-1">{errors.isbn}</p>}
              </div>

              <div>
                <Label htmlFor="publisher">Publisher *</Label>
                <Input
                  id="publisher"
                  value={formData.publisher || ''}
                  onChange={(e) => handleInputChange('publisher', e.target.value)}
                  readOnly={isViewMode}
                  className={errors.publisher ? 'border-red-500' : ''}
                />
                {errors.publisher && <p className="text-red-500 text-sm mt-1">{errors.publisher}</p>}
              </div>

              <div>
                <Label htmlFor="published_date">Published Date</Label>
                <Input
                  id="published_date"
                  type="date"
                  value={formData.published_date || ''}
                  onChange={(e) => handleInputChange('published_date', e.target.value)}
                  readOnly={isViewMode}
                />
              </div>

              <div>
                <Label htmlFor="genre">Genre</Label>
                <Select
                  value={formData.genre || ''}
                  onValueChange={(value) => handleInputChange('genre', value)}
                  disabled={isViewMode}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select genre" />
                  </SelectTrigger>
                  <SelectContent>
                    {genres.map((genre) => (
                      <SelectItem key={genre} value={genre}>
                        {genre.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="revision">Revision Number</Label>
                <Input
                  id="revision"
                  value={formData.revision_number || ''}
                  onChange={(e) => handleInputChange('revision_number', e.target.value)}
                  readOnly={isViewMode}
                />
              </div>

              <div>
                <Label htmlFor="total_copies">Total Copies</Label>
                <Input
                  id="total_copies"
                  type="number"
                  min="1"
                  value={formData.total_copies || 1}
                  onChange={(e) => handleInputChange('total_copies', parseInt(e.target.value))}
                  readOnly={isViewMode}
                />
              </div>

              <div>
                <Label htmlFor="available_copies">Available Copies</Label>
                <Input
                  id="available_copies"
                  type="number"
                  min="0"
                  value={formData.available_copies || 1}
                  onChange={(e) => handleInputChange('available_copies', parseInt(e.target.value))}
                  readOnly={isViewMode}
                />
              </div>
            </div>

            {/* Authors */}
            <div>
              <Label>Authors *</Label>
              {!isViewMode && (
                <div className="flex gap-2 mt-1">
                  <Input
                    value={authorInput}
                    onChange={(e) => setAuthorInput(e.target.value)}
                    placeholder="Enter author name"
                    onKeyPress={(e) => e.key === 'Enter' && handleAddAuthor()}
                  />
                  <Button type="button" onClick={handleAddAuthor} variant="outline">
                    Add
                  </Button>
                </div>
              )}
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.authors?.map((author, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {author}
                    {!isViewMode && (
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => handleRemoveAuthor(author)}
                      />
                    )}
                  </Badge>
                ))}
              </div>
              {errors.authors && <p className="text-red-500 text-sm mt-1">{errors.authors}</p>}
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => handleInputChange('description', e.target.value)}
                readOnly={isViewMode}
                rows={4}
                placeholder="Enter book description..."
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {isViewMode ? 'Close' : 'Cancel'}
          </Button>
          {!isViewMode && (
            <Button onClick={handleSave} disabled={uploadingImage}>
              {uploadingImage ? 'Uploading...' : mode === 'add' ? 'Add Book' : 'Save Changes'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}