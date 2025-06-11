import { useState, useEffect } from 'react'
import { checkoutsAPI } from '../lib/api'

interface Checkout {
  id: string
  bookId: string
  userId: string
  checkoutDate: string
  expectedReturnDate: string
  actualReturnDate?: string
  isReturned: boolean
  isOverdue: boolean
  book?: any
  user?: any
}

// Updated helper function to match your API client
const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    // Your api.js uses 'token', not 'authToken'
    return localStorage.getItem('token') || sessionStorage.getItem('token')
  }
  return null
}

// Helper function to get user info
const getUserInfo = () => {
  if (typeof window !== 'undefined') {
    const userStr = localStorage.getItem('user')
    if (userStr) {
      try {
        return JSON.parse(userStr)
      } catch {
        return null
      }
    }
  }
  return null
}

export function useCheckouts() {
  const [checkouts, setCheckouts] = useState<Checkout[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchCheckouts = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await checkoutsAPI.getAll()
      setCheckouts(response.checkouts || response)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch checkouts')
    } finally {
      setLoading(false)
    }
  }

  const fetchMyCheckouts = async () => {
    setLoading(true)
    setError(null)
    try {
      // Use the API client instead of manual fetch
      const response = await checkoutsAPI.getMyCheckouts()
      setCheckouts(response.checkouts || response)
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to fetch your checkouts')
    } finally {
      setLoading(false)
    }
  }

  const checkoutBook = async (bookId: string) => {
    try {
      const response = await checkoutsAPI.checkout({ bookId })
      await fetchCheckouts() // Refresh the list
      return response
    } catch (err: any) {
      throw new Error(err.response?.data?.error || 'Failed to checkout book')
    }
  }

  const checkinBook = async (checkoutId: string) => {
    try {
      const response = await checkoutsAPI.checkin({ checkoutId })
      await fetchCheckouts() // Refresh the list
      return response
    } catch (err: any) {
      throw new Error(err.response?.data?.error || 'Failed to checkin book')
    }
  }

  const fetchOverdueCheckouts = async () => {
    try {
      const response = await checkoutsAPI.getOverdue()
      return response
    } catch (err: any) {
      throw new Error(err.response?.data?.error || 'Failed to fetch overdue checkouts')
    }
  }

  useEffect(() => {
    // Only auto-fetch all checkouts if user is a librarian and has a token
    const token = getAuthToken()
    const user = getUserInfo()
    
    if (token && user && user.role === 'librarian') {
      console.log('Librarian logged in, fetching all checkouts')
      fetchCheckouts()
    } else {
      console.log('Not a librarian or no token, skipping auto-fetch')
    }
  }, [])

  return {
    checkouts,
    loading,
    error,
    fetchCheckouts,
    fetchMyCheckouts,
    checkoutBook,
    checkinBook,
    fetchOverdueCheckouts,
  }
}