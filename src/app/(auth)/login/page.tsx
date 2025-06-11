'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { usersAPI } from '@/lib/api' 
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { BookOpen, Mail, Lock, User, Phone, MapPin, AlertCircle, Camera } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const { login, register } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false) //
  const [error, setError] = useState('')

  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  })

  
  const [registerData, setRegisterData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    role: 'reader' as 'librarian' | 'reader',
    phone: '',
    address: '',
    profilePictureUrl: '' 
  })

  // Profile picture preview state
  const [profilePreview, setProfilePreview] = useState<string | null>(null)

 
  const handleProfilePictureChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
     
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file')
        return
      }
      

      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB')
        return
      }
      
      try {
        setUploadingImage(true)
        setError('')
        
       
        const uploadFormData = new FormData()
        uploadFormData.append('file', file)
        
        console.log('🔄 Uploading profile image...')
        const uploadResponse = await usersAPI.uploadProfileImage(uploadFormData)
        
        console.log('✅ Upload successful:', uploadResponse.url)
        
      
        setRegisterData({
          ...registerData, 
          profilePictureUrl: uploadResponse.url
        })
        
     
        const reader = new FileReader()
        reader.onload = (e) => {
          setProfilePreview(e.target?.result as string)
        }
        reader.readAsDataURL(file)
        
      } catch (error: any) {
        console.error('❌ Upload failed:', error)
        setError(error.response?.data?.error || 'Failed to upload image')
      } finally {
        setUploadingImage(false)
      }
    }
  }


  const removeProfilePicture = () => {
    setRegisterData({...registerData, profilePictureUrl: ''})
    setProfilePreview(null)
  
    const fileInput = document.getElementById('profilePicture') as HTMLInputElement
    if (fileInput) fileInput.value = ''
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      await login(loginData.email, loginData.password)
      router.push('/dashboard')
    } catch (error: any) {
      console.error('Login error:', error)
      setError(error.response?.data?.error || 'Login failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // ✅ Updated handleRegister to send JSON data
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (registerData.password !== registerData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (registerData.password.length < 6) {
      setError('Password must be at least 6 characters long')
      return
    }

    setIsLoading(true)

    try {
      // ✅ Send JSON data with uploaded image URL
      const registrationData = {
        email: registerData.email,
        password: registerData.password,
        firstName: registerData.firstName,
        lastName: registerData.lastName,
        role: registerData.role,
        phone: registerData.phone || undefined,
        address: registerData.address || undefined,
        profilePhotoUrl: registerData.profilePictureUrl || undefined
      }

      console.log('🚀 Registering with data:', registrationData)
      await register(registrationData)
      router.push('/dashboard')
    } catch (error: any) {
      console.error('Register error:', error)
      setError(error.response?.data?.error || 'Registration failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDemoLogin = async (email: string, password: string) => {
    setLoginData({ email, password })
    setIsLoading(true)
    setError('')

    try {
      await login(email, password)
      router.push('/dashboard')
    } catch (error: any) {
      console.error('Demo login error:', error)
      setError(error.response?.data?.error || 'Demo login failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2 mb-4">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">BookBase</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
          <p className="text-gray-600 mt-2">Access your digital library</p>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Auth Forms */}
        <Card>
          <CardContent className="p-6">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Sign In</TabsTrigger>
                <TabsTrigger value="register">Sign Up</TabsTrigger>
              </TabsList>

              {/* Login Tab */}
              <TabsContent value="login" className="space-y-4">
                <div className="text-center">
                  <CardTitle className="text-xl">Sign in to your account</CardTitle>
                  <CardDescription className="mt-1">
                    Enter your credentials to access your library
                  </CardDescription>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={loginData.email}
                        onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                        className="pl-10"
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="Enter your password"
                        value={loginData.password}
                        onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                        className="pl-10"
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Signing in...' : 'Sign In'}
                  </Button>
                </form>
              </TabsContent>

              {/* Register Tab */}
              <TabsContent value="register" className="space-y-4">
                <div className="text-center">
                  <CardTitle className="text-xl">Create an account</CardTitle>
                  <CardDescription className="mt-1">
                    Join our library community today
                  </CardDescription>
                </div>

                <form onSubmit={handleRegister} className="space-y-4">
                  {/* Profile Picture Upload */}
                  <div className="space-y-2">
                    <Label htmlFor="profilePicture">Profile Picture (Optional)</Label>
                    <div className="flex items-center space-x-4">
                      {/* Preview */}
                      <div className="relative">
                        <div className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center overflow-hidden bg-gray-50">
                          {profilePreview ? (
                            <img 
                              src={profilePreview} 
                              alt="Profile preview" 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User className="h-8 w-8 text-gray-400" />
                          )}
                        </div>
                        {profilePreview && (
                          <button
                            type="button"
                            onClick={removeProfilePicture}
                            className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                            disabled={isLoading || uploadingImage}
                          >
                            ×
                          </button>
                        )}
                      </div>
                      
                      {/* Upload Button */}
                      <div className="flex-1">
                        <div className="relative">
                          <Input
                            id="profilePicture"
                            type="file"
                            accept="image/*"
                            onChange={handleProfilePictureChange}
                            disabled={isLoading || uploadingImage}
                            className="hidden"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => document.getElementById('profilePicture')?.click()}
                            disabled={isLoading || uploadingImage}
                            className="w-full"
                          >
                            <Camera className="h-4 w-4 mr-2" />
                            {uploadingImage ? 'Uploading...' : profilePreview ? 'Change Photo' : 'Upload Photo'}
                          </Button>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          JPG, PNG, or GIF up to 5MB
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        placeholder="John"
                        value={registerData.firstName}
                        onChange={(e) => setRegisterData({...registerData, firstName: e.target.value})}
                        required
                        disabled={isLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        placeholder="Doe"
                        value={registerData.lastName}
                        onChange={(e) => setRegisterData({...registerData, lastName: e.target.value})}
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Select 
                      value={registerData.role} 
                      onValueChange={(value) => setRegisterData({...registerData, role: value as 'librarian' | 'reader'})}
                      disabled={isLoading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="reader">Reader</SelectItem>
                        <SelectItem value="librarian">Librarian</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="registerEmail">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="registerEmail"
                        type="email"
                        placeholder="Enter your email"
                        value={registerData.email}
                        onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
                        className="pl-10"
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="registerPassword">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          id="registerPassword"
                          type="password"
                          placeholder="Create password"
                          value={registerData.password}
                          onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
                          className="pl-10"
                          required
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          id="confirmPassword"
                          type="password"
                          placeholder="Confirm password"
                          value={registerData.confirmPassword}
                          onChange={(e) => setRegisterData({...registerData, confirmPassword: e.target.value})}
                          className="pl-10"
                          required
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone (Optional)</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="Enter phone number"
                        value={registerData.phone}
                        onChange={(e) => setRegisterData({...registerData, phone: e.target.value})}
                        className="pl-10"
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Address (Optional)</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 text-gray-400 h-4 w-4" />
                      <Input
                        id="address"
                        placeholder="Enter your address"
                        value={registerData.address}
                        onChange={(e) => setRegisterData({...registerData, address: e.target.value})}
                        className="pl-10"
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading || uploadingImage}>
                    {isLoading ? 'Creating Account...' : 'Create Account'}
                  </Button>
                </form>

                {/* Demo Users */}
                <div className="mt-6 pt-6 border-t">
                  <p className="text-sm text-gray-600 text-center mb-4">Try demo accounts:</p>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDemoLogin('librarian@demo.com', 'password123')}
                      disabled={isLoading}
                      className="text-xs"
                    >
                      Demo Librarian
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDemoLogin('reader@demo.com', 'password123')}
                      disabled={isLoading}
                      className="text-xs"
                    >
                      Demo Reader
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}