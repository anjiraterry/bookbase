'use client'

import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/hooks/useAuth'
import { usersAPI } from '@/lib/api'
import { toast } from 'sonner' // Import directly from sonner
import { User, Mail, Phone, Calendar, Shield, Camera, Upload, X } from 'lucide-react'

interface ProfileModalProps {
  mode: 'view' | 'edit'
  isOpen: boolean
  onClose: () => void
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  mode,
  isOpen,
  onClose
}) => {
  const { user, updateUser } = useAuth()
  const [loading, setLoading] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    profilePhotoUrl: '',
    role: '',
    isActive: true,
    createdAt: '',
    updatedAt: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [imagePreview, setImagePreview] = useState<string>('')

  useEffect(() => {
    if (user && isOpen) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
        profilePhotoUrl: user.profilePhotoUrl || '',
        role: user.role || '',
        isActive: user.isActive || true,
        createdAt: user.createdAt || '',
        updatedAt: user.updatedAt || ''
      })
      setImagePreview(user.profilePhotoUrl || '')
    }
  }, [user, isOpen])

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleImageUrlChange = (url: string) => {
    setFormData(prev => ({ ...prev, profilePhotoUrl: url }))
    setImagePreview(url)
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return


    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file')
      return
    }


    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB')
      return
    }

    try {
      setUploadingImage(true)
      
   
      const formDataUpload = new FormData()
      formDataUpload.append('file', file)
      
      const uploadResponse = await usersAPI.uploadProfileImage(formDataUpload)
      
     
      const imageUrl = uploadResponse.url
      handleImageUrlChange(imageUrl)
      
      toast.success('Profile picture uploaded successfully')
    } catch (error: any) {
      console.error('Image upload error:', error)
      toast.error(error.message || 'Failed to upload image')
    } finally {
      setUploadingImage(false)
    }
  }

  const handleRemoveImage = () => {
    setFormData(prev => ({ ...prev, profilePhotoUrl: '' }))
    setImagePreview('')
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.firstName?.trim()) newErrors.firstName = 'First name is required'
    if (!formData.lastName?.trim()) newErrors.lastName = 'Last name is required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validateForm()) return

    try {
      setLoading(true)
      
      // Update user profile via API using usersAPI
      const updatedUser = await usersAPI.updateProfile({
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        profilePhotoUrl: formData.profilePhotoUrl
      })
      
      // Update local auth state
      updateUser(updatedUser)
      
      toast.success('Profile updated successfully')
      
      onClose()
    } catch (error: any) {
      console.error('Profile update error:', error)
      toast.error(error.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const isViewMode = mode === 'view'
  const modalTitle = mode === 'edit' ? 'Edit Profile' : 'Profile Details'

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not available'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl w-[95vw]  max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{modalTitle}</DialogTitle>
          <DialogDescription>
            {mode === 'edit' && 'Update your profile information'}
            {mode === 'view' && 'View your profile details'}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Avatar */}
          <div className="space-y-4">
            <div className="relative group">
              <div className="aspect-square bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-4xl font-bold mx-auto w-32 h-32 overflow-hidden">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  getInitials(formData.firstName, formData.lastName)
                )}
              </div>
              
              {!isViewMode && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <Camera className="h-8 w-8 text-white" />
                </div>
              )}
            </div>

            {!isViewMode && (
              <div className="space-y-3">
                {/* File Upload */}
                <div>
                  <Label htmlFor="file-upload" className="cursor-pointer">
                    <div className="flex items-center justify-center gap-2 p-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors">
                      <Upload className="h-4 w-4" />
                      <span className="text-sm">
                        {uploadingImage ? 'Uploading...' : 'Upload Image'}
                      </span>
                    </div>
                  </Label>
                  <Input
                    id="file-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    disabled={uploadingImage}
                    className="hidden"
                  />
                </div>

                {/* URL Input */}
                <div>
                  <Label htmlFor="image-url">Or enter image URL</Label>
                  <Input
                    id="image-url"
                    value={formData.profilePhotoUrl}
                    onChange={(e) => handleImageUrlChange(e.target.value)}
                    placeholder="https://example.com/image.jpg"
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
                    Remove Image
                  </Button>
                )}
              </div>
            )}

            {/* Profile Stats */}
            <div className="space-y-3 bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Role
                </span>
                <Badge variant={formData.role === 'librarian' ? "default" : "secondary"}>
                  {formData.role?.charAt(0).toUpperCase() + formData.role?.slice(1)}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Status
                </span>
                <Badge variant={formData.isActive ? "default" : "secondary"}>
                  {formData.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Member Since
                </span>
                <span className="text-sm text-gray-600">
                  {formatDate(formData.createdAt)}
                </span>
              </div>
            </div>
          </div>

          {/* Profile Information */}
          <div className="lg:col-span-2 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  readOnly={isViewMode}
                  className={errors.firstName ? 'border-red-500' : ''}
                  placeholder="Enter first name"
                />
                {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
              </div>

              <div>
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  readOnly={isViewMode}
                  className={errors.lastName ? 'border-red-500' : ''}
                  placeholder="Enter last name"
                />
                {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
              </div>

              <div>
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={user?.email || ''}
                    readOnly={true}
                    className="pl-10 bg-gray-50"
                    placeholder="Email cannot be changed"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Email cannot be modified</p>
              </div>

              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    readOnly={isViewMode}
                    className="pl-10"
                    placeholder="Enter phone number"
                  />
                </div>
              </div>

              {isViewMode && (
                <>
                  <div>
                    <Label htmlFor="role">Role</Label>
                    <Input
                      id="role"
                      value={formData.role?.charAt(0).toUpperCase() + formData.role?.slice(1)}
                      readOnly={true}
                      className="bg-gray-50"
                    />
                  </div>

                  <div>
                    <Label htmlFor="status">Account Status</Label>
                    <Input
                      id="status"
                      value={formData.isActive ? 'Active' : 'Inactive'}
                      readOnly={true}
                      className="bg-gray-50"
                    />
                  </div>
                </>
              )}
            </div>

            {/* Account Information Section */}
            {isViewMode && (
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <h3 className="font-semibold text-gray-900">Account Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">Account Created:</span>
                    <p className="text-gray-900">{formatDate(formData.createdAt)}</p>
                  </div>
                  {formData.updatedAt && (
                    <div>
                      <span className="font-medium text-gray-600">Last Updated:</span>
                      <p className="text-gray-900">{formatDate(formData.updatedAt)}</p>
                    </div>
                  )}
                  <div>
                    <span className="font-medium text-gray-600">User ID:</span>
                    <p className="text-gray-900 font-mono text-xs">{user?.id}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Account Type:</span>
                    <p className="text-gray-900">{formData.role === 'librarian' ? 'Library Staff' : 'Library Member'}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {isViewMode ? 'Close' : 'Cancel'}
          </Button>
          {!isViewMode && (
            <Button onClick={handleSave} disabled={loading || uploadingImage}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}