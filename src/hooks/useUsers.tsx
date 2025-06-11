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
    } catch (err: any) {
      console.error('Error fetching users:', err)
      setError(err.response?.data?.error || 'Failed to fetch users')
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (profileData: {
    firstName?: string
    lastName?: string
    phone?: string
    address?: string
    profilePhotoUrl?: string
  }) => {
    try {
      const updatedUser = await usersAPI.updateProfile(profileData)
      // Refresh users list after update
      await fetchUsers()
      return updatedUser
    } catch (err: any) {
      console.error('Error updating profile:', err)
      throw err
    }
  }

  const changePassword = async (passwordData: {
    currentPassword: string
    newPassword: string
  }) => {
    try {
      const result = await usersAPI.changePassword(passwordData)
      return result
    } catch (err: any) {
      console.error('Error changing password:', err)
      throw err
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