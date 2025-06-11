import { supabase } from '../lib/supabase'
import { hashPassword, verifyPassword, generateToken } from '../lib/serverUtils'
import { LoginInput, RegisterInput } from '../lib/validations'

interface DatabaseUser {
  id: string
  email: string
  first_name: string
  last_name: string
  role: 'librarian' | 'reader'
  profile_photo_url?: string
  phone?: string
  address?: string
  created_at: string
  updated_at: string
  password_hash?: string
}

interface UserResponse {
  id: string
  email: string
  firstName: string
  lastName: string
  role: 'librarian' | 'reader'
  profilePhotoUrl?: string
  phone?: string
  address?: string
  createdAt: string
  updatedAt?: string
}

interface AuthResponse {
  user: UserResponse
  token: string
}

interface ProfileResponse {
  user: UserResponse
}

interface CustomError {
  message: string
  code?: string
}

export async function register(data: RegisterInput): Promise<AuthResponse> {
  try {
    console.log('=== REGISTER FUNCTION CALLED ===')
    console.log('Registration data:', data)

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', data.email)
      .single()

    if (existingUser) {
      throw new Error('User already exists')
    }

    // Hash password
    const passwordHash = await hashPassword(data.password)

    console.log('💾 About to insert user with profile_photo_url:', data.profilePhotoUrl)

   
    const { data: newUser, error } = await supabase
      .from('users')
      .insert({
        email: data.email,
        password_hash: passwordHash,
        first_name: data.firstName,
        last_name: data.lastName,
        role: data.role,
        phone: data.phone,
        address: data.address,
        profile_photo_url: data.profilePhotoUrl 
      })
      .select('id, email, first_name, last_name, role, profile_photo_url, phone, address, created_at')
      .single()

    console.log('👤 User creation result:', { newUser, error })

    if (error) {
      console.error('Database error:', error)
      throw new Error('Failed to create user')
    }

    const dbUser = newUser as DatabaseUser

    // Generate token
    const token = generateToken(dbUser.id, dbUser.role)

    // Transform to camelCase for frontend
    const userResponse: UserResponse = {
      id: dbUser.id,
      email: dbUser.email,
      firstName: dbUser.first_name,
      lastName: dbUser.last_name,
      role: dbUser.role,
      profilePhotoUrl: dbUser.profile_photo_url,
      phone: dbUser.phone,
      address: dbUser.address,
      createdAt: dbUser.created_at
    }

    console.log('🎉 Final user response:', userResponse)

    return {
      user: userResponse,
      token
    }
  } catch (error) {
    const customError = error as CustomError
    console.error('Registration error:', customError)
    throw customError
  }
}

export async function login(data: LoginInput): Promise<AuthResponse> {
  try {
    // Find user by email
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', data.email)
      .single()

    if (error || !user) {
      throw new Error('Invalid email or password')
    }

    const dbUser = user as DatabaseUser

    // Verify password
    const isValidPassword = await verifyPassword(data.password, dbUser.password_hash!)

    if (!isValidPassword) {
      throw new Error('Invalid email or password')
    }

    // Generate token
    const token = generateToken(dbUser.id, dbUser.role)

    // Transform to camelCase for frontend
    const userResponse: UserResponse = {
      id: dbUser.id,
      email: dbUser.email,
      firstName: dbUser.first_name,
      lastName: dbUser.last_name,
      role: dbUser.role,
      profilePhotoUrl: dbUser.profile_photo_url,
      phone: dbUser.phone,
      address: dbUser.address,
      createdAt: dbUser.created_at,
      updatedAt: dbUser.updated_at
    }

    return {
      user: userResponse,
      token
    }
  } catch (error) {
    const customError = error as CustomError
    console.error('Login error:', customError)
    throw customError
  }
}

export async function getProfile(userId: string): Promise<ProfileResponse> {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, first_name, last_name, role, profile_photo_url, phone, address, created_at, updated_at')
      .eq('id', userId)
      .single()

    if (error || !user) {
      throw new Error('User not found')
    }

    const dbUser = user as DatabaseUser

    // Transform to camelCase for frontend
    const userResponse: UserResponse = {
      id: dbUser.id,
      email: dbUser.email,
      firstName: dbUser.first_name,
      lastName: dbUser.last_name,
      role: dbUser.role,
      profilePhotoUrl: dbUser.profile_photo_url,
      phone: dbUser.phone,
      address: dbUser.address,
      createdAt: dbUser.created_at,
      updatedAt: dbUser.updated_at
    }

    return {
      user: userResponse
    }
  } catch (error) {
    const customError = error as CustomError
    console.error('Get profile error:', customError)
    throw customError
  }
}