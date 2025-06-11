'use client'

import React, { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { ProfileModal } from '@/components/profile/ProfileModal'
import { ChevronDown } from 'lucide-react'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { logout, user } = useAuth()
  const router = useRouter()
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
  const [profileMode, setProfileMode] = useState<'view' | 'edit'>('view')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  const handleViewProfile = () => {
    setProfileMode('view')
    setIsProfileModalOpen(true)
    setIsDropdownOpen(false)
  }

  const handleEditProfile = () => {
    setProfileMode('edit')
    setIsProfileModalOpen(true)
    setIsDropdownOpen(false)
  }

  const handleCloseProfileModal = () => {
    setIsProfileModalOpen(false)
  }

  const getInitials = (firstName: string, lastName: string) => {
    const first = firstName?.charAt(0) || ''
    const last = lastName?.charAt(0) || ''
    return `${first}${last}`.toUpperCase()
  }

  // Get user data from auth context
  const displayName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : 'User'
  const userRole = user?.role || 'reader'
  const profilePhotoUrl = user?.profilePhotoUrl

  // Don't render if no user data
  if (!user) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">BookBase</h1>
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                {userRole === 'librarian' ? 'Librarian' : 'Reader'}
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer group"
                >
                  {/* Avatar */}
                  {profilePhotoUrl ? (
                    <img
                      src={profilePhotoUrl}
                      alt={displayName}
                      className="h-8 w-8 rounded-full object-cover border-2 border-transparent group-hover:border-blue-200 transition-colors"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium border-2 border-transparent group-hover:border-blue-200 transition-colors">
                      {getInitials(user.firstName || '', user.lastName || '')}
                    </div>
                  )}
                  
                  {/* Name */}
                  <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
                    {displayName}
                  </span>
                  
                  {/* Dropdown Arrow */}
                  <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <>
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                      <div className="py-1">
                        <button
                          onClick={handleViewProfile}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                          View Profile
                        </button>
                        <button
                          onClick={handleEditProfile}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                          Edit Profile
                        </button>
                        <hr className="my-1" />
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          Logout
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Overlay to close dropdown when clicking outside */}
      {isDropdownOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsDropdownOpen(false)}
        />
      )}

      {/* Main content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>

      {/* Profile Modal */}
      <ProfileModal 
        mode={profileMode}
        isOpen={isProfileModalOpen} 
        onClose={handleCloseProfileModal} 
      />
    </div>
  )
}