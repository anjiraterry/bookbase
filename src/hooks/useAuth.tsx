'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { authAPI } from '../lib/api'

interface User {
  isActive: boolean
  createdAt: string
  updatedAt: string
  id: string
  email: string
  firstName: string
  lastName: string
  role: 'librarian' | 'reader'
  profilePhotoUrl?: string
  phone?: string
  address?: string
}

interface RegisterData {
  email: string
  password: string
  firstName: string
  lastName: string
  role: 'librarian' | 'reader'
  profilePhotoUrl?: string
  phone?: string
  address?: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  register: (data: FormData | RegisterData) => Promise<void>
  logout: () => void
  loading: boolean
  updateUser: (updatedUserData: Partial<User>) => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('token')
      const storedUser = localStorage.getItem('user')
      
      if (storedToken && storedUser) {
        try {
          setToken(storedToken)
          setUser(JSON.parse(storedUser))
        } catch (error) {
          console.error('Error parsing stored user data:', error)
          localStorage.removeItem('token')
          localStorage.removeItem('user')
        }
      }
    }
    setLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const response = await authAPI.login({ email, password })
      
      console.log('Login response:', response) 
      
      const { user: userData, token: userToken } = response
      
      setUser(userData)
      setToken(userToken)
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', userToken)
        localStorage.setItem('user', JSON.stringify(userData))
      }
    } catch (error) {
      console.error('Login error in useAuth:', error)
      throw error
    }
  }
  
  const register = async (data: FormData | RegisterData) => {
    try {
      console.log('Register called with:', data instanceof FormData ? 'FormData' : 'JSON data')
      
      // Convert FormData to RegisterData object if needed
      let registerData: RegisterData
      
      if (data instanceof FormData) {
        registerData = {
          email: data.get('email') as string,
          password: data.get('password') as string,
          firstName: data.get('firstName') as string,
          lastName: data.get('lastName') as string,
          role: data.get('role') as 'librarian' | 'reader',
          phone: data.get('phone') as string || undefined,
          address: data.get('address') as string || undefined,
          profilePhotoUrl: data.get('profilePhotoUrl') as string || undefined,
        }
      } else {
        registerData = data
      }
      
      const response = await authAPI.register(registerData)
      
      console.log('Register response:', response) 
      
      const { user: userData, token: userToken } = response
      
      setUser(userData)
      setToken(userToken)
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', userToken)
        localStorage.setItem('user', JSON.stringify(userData))
      }
    } catch (error) {
      console.error('Register error in useAuth:', error)
      throw error
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
  }

  const updateUser = (updatedUserData: Partial<User>) => {
    setUser(prev => {
      if (!prev) return null
      
      const updatedUser = { ...prev, ...updatedUserData }
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(updatedUser))
      }
      
      console.log('User updated in context:', updatedUser)
      
      return { ...updatedUser }
    })
  }
  
  const contextValue: AuthContextType = {
    user,
    token,
    login,
    register,
    logout,
    loading,
    updateUser
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}