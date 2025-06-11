'use client'

import { useState, useEffect } from 'react'
import { usersAPI } from '@/lib/api'

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: 'librarian' | 'reader'
  phone?: string
  address?: string
  profilePhotoUrl?: string
  createdAt: string
  updatedAt: string
}

interface ProfileUpdateData {
  firstName?: string
  lastName?: string
  phone?: string
  address?: string
  profilePhotoUrl?: string
}

interface PasswordChangeData {
  currentPassword: string
  newPassword: string
}

interface CustomError {
  response?: {
    data?: {
      error?: string
    }
  }
  message?: string
}

export function useUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const data = await usersAPI.getAll()
      setUsers(data)
      setError(null)
    } catch (err) {
      const customError = err as CustomError
      console.error('Error fetching users:', customError)
      setError(customError.response?.data?.error || 'Failed to fetch users')
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (profileData: ProfileUpdateData) => {
    try {
      const updatedUser = await usersAPI.updateProfile(profileData)
      // Refresh users list after update
      await fetchUsers()
      return updatedUser
    } catch (err) {
      const customError = err as CustomError
      console.error('Error updating profile:', customError)
      throw customError
    }
  }

  const changePassword = async (passwordData: PasswordChangeData) => {
    try {
      const result = await usersAPI.changePassword(passwordData)
      return result
    } catch (err) {
      const customError = err as CustomError
      console.error('Error changing password:', customError)
      throw customError
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  return {
    users,
    loading,
    error,
    refetchUsers: fetchUsers,
    updateProfile,
    changePassword
  }
}