import { useState, useEffect } from 'react'
import { checkoutsAPI } from '../lib/api'

interface Book {
  id: string
  title: string
  authors: string[]
  cover_image_url?: string
  isbn?: string
  publisher?: string
  genre?: string
}

interface User {
  id: string
  email: string
  firstName?: string
  lastName?: string
  first_name?: string
  last_name?: string
  role: 'librarian' | 'reader'
}

interface Checkout {
  id: string
  bookId: string
  userId: string
  checkoutDate: string
  expectedReturnDate: string
  actualReturnDate?: string
  isReturned: boolean
  isOverdue: boolean
  book?: Book
  user?: User
}

interface CheckoutRequest {
  bookId: string
}

interface CheckinRequest {
  checkoutId: string
}

interface CustomError {
  response?: {
    data?: {
      error?: string
    }
  }
  message?: string
}

const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token') || sessionStorage.getItem('token')
  }
  return null
}

const getUserInfo = (): User | null => {
  if (typeof window !== 'undefined') {
    const userStr = localStorage.getItem('user')
    if (userStr) {
      try {
        return JSON.parse(userStr) as User
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
    } catch (err) {
      const customError = err as CustomError
      setError(customError.response?.data?.error || 'Failed to fetch checkouts')
    } finally {
      setLoading(false)
    }
  }

  const fetchMyCheckouts = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await checkoutsAPI.getMyCheckouts()
      setCheckouts(response.checkouts || response)
    } catch (err) {
      const customError = err as CustomError
      setError(customError.response?.data?.error || customError.message || 'Failed to fetch your checkouts')
    } finally {
      setLoading(false)
    }
  }

  const checkoutBook = async (bookId: string) => {
    try {
      const response = await checkoutsAPI.checkout({ bookId } as CheckoutRequest)
      await fetchCheckouts()
      return response
    } catch (err) {
      const customError = err as CustomError
      throw new Error(customError.response?.data?.error || 'Failed to checkout book')
    }
  }

  const checkinBook = async (checkoutId: string) => {
    try {
      const response = await checkoutsAPI.checkin({ checkoutId } as CheckinRequest)
      await fetchCheckouts()
      return response
    } catch (err) {
      const customError = err as CustomError
      throw new Error(customError.response?.data?.error || 'Failed to checkin book')
    }
  }

  const fetchOverdueCheckouts = async () => {
    try {
      const response = await checkoutsAPI.getOverdue()
      return response
    } catch (err) {
      const customError = err as CustomError
      throw new Error(customError.response?.data?.error || 'Failed to fetch overdue checkouts')
    }
  }

  useEffect(() => {
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