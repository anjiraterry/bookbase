import axios from 'axios'

// Create axios instance with base configuration
const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth API calls
export const authAPI = {
  register: async (data: {
    email: string
    password: string
    firstName: string
    lastName: string
    role: 'librarian' | 'reader'
    phone?: string
    address?: string
    profilePhotoUrl?: string  
  }) => {
    const response = await api.post('/auth/register', data)
    return response.data
  },


  login: async (data: { email: string; password: string }) => {
    const response = await api.post('/auth/login', data)
    return response.data
  },

  getProfile: async () => {
    const response = await api.get('/auth/profile')
    return response.data
  },
}

// Books API calls
// Books API calls
export const booksAPI = {
    getAll: async (params?: {
      title?: string
      isbn?: string
      publisher?: string
      genre?: string
      page?: number
      limit?: number
    }) => {
      const response = await api.get('/books', { params })
      return response.data
    },
  
    getById: async (id: string) => {
      const response = await api.get(`/books/${id}`)
      return response.data
    },
  
    create: async (data: {
      title: string
      isbn: string
      authors: string[]
      publisher?: string
      publishedDate?: string
      genre?: string
      description?: string
      totalCopies: number
      coverImageUrl?: string
    }) => {
      const response = await api.post('/books', data)
      return response.data
    },
  
    update: async (id: string, data: Partial<{
      title: string
      isbn: string
      authors: string[]
      publisher: string
      publishedDate: string
      genre: string
      description: string
      totalCopies: number
      coverImageUrl: string
    }>) => {
      const response = await api.put(`/books/${id}`, data)
      return response.data
    },
  
    delete: async (id: string) => {
      const response = await api.delete(`/books/${id}`)
      return response.data
    },
  
    getAvailable: async () => {
      const response = await api.get('/books/available')
      return response.data
    },
  
    getByGenre: async (genre: string) => {
      const response = await api.get(`/books/genre/${genre}`)
      return response.data
    },
  
    uploadBookCover: async (formData: FormData) => {
      try {
        const response = await api.post('/books/upload-image', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
        return response.data
      } catch (error) {
        console.error('Book cover upload API error:', error)
        throw error
      }
    },
  }

// Users API calls
export const usersAPI = {
    getAll: async () => {
      const response = await api.get('/users')
      return response.data
    },
  
    updateProfile: async (data: {
        firstName?: string
        lastName?: string
        phone?: string
        address?: string
        profilePhotoUrl?: string
      }) => {
        // Get the user ID from localStorage
        const storedUser = localStorage.getItem('user')
        if (!storedUser) {
          throw new Error('No user data found')
        }
        
        const user = JSON.parse(storedUser)
        
        const response = await api.put('/users/profile', {
          ...data,
          userId: user.id  // Add the userId here
        })
        return response.data
      },
  
    uploadProfileImage: async (formData: FormData) => {
      const response = await api.post('/users/upload-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      return response.data
    },
  
    changePassword: async (data: {
      currentPassword: string
      newPassword: string
    }) => {
      const response = await api.post('/users/change-password', data)
      return response.data
    },
  }

// Checkouts API calls
// Add this method to your existing checkoutsAPI in lib/api.ts
export const checkoutsAPI = {
    getAll: async () => {
      const response = await api.get('/checkouts')
      return response.data
    },
  
    // Add this new method
    getMyCheckouts: async () => {
      const response = await api.get('/checkouts/my-checkouts')
      return response.data
    },
  
    checkout: async (data: { bookId: string }) => {
      const response = await api.post('/checkouts', data)
      return response.data
    },
  
    checkin: async (data: { checkoutId: string }) => {
      const response = await api.post('/checkouts/checkin', data)
      return response.data
    },
  
    getUserCheckouts: async (userId: string) => {
      const response = await api.get(`/checkouts/user/${userId}`)
      return response.data
    },
  
    getOverdue: async () => {
      const response = await api.get('/checkouts/overdue')
      return response.data
    },
  
    getActive: async () => {
      const response = await api.get('/checkouts/active')
      return response.data
    },
  }

export default api