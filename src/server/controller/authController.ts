import { supabase } from '../lib/supabase'
import { hashPassword, verifyPassword, generateToken } from '../lib/serverUtils'
import { LoginInput, RegisterInput } from '../lib/validations'

export async function register(data: RegisterInput) {
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

    // Generate token
    const token = generateToken(newUser.id, newUser.role)

    // Transform to camelCase for frontend
    const userResponse = {
      id: newUser.id,
      email: newUser.email,
      firstName: newUser.first_name,
      lastName: newUser.last_name,
      role: newUser.role,
      profilePhotoUrl: newUser.profile_photo_url,
      phone: newUser.phone,
      address: newUser.address,
      createdAt: newUser.created_at
    }

    console.log('🎉 Final user response:', userResponse)

    return {
      user: userResponse,
      token
    }
  } catch (error: any) {
    console.error('Registration error:', error)
    throw error
  }
}

export async function login(data: LoginInput) {
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

    // Verify password
    const isValidPassword = await verifyPassword(data.password, user.password_hash)

    if (!isValidPassword) {
      throw new Error('Invalid email or password')
    }

    // Generate token
    const token = generateToken(user.id, user.role)

    // Transform to camelCase for frontend
    const userResponse = {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role,
      profilePhotoUrl: user.profile_photo_url,
      phone: user.phone,
      address: user.address,
      createdAt: user.created_at,
      updatedAt: user.updated_at
    }

    return {
      user: userResponse,
      token
    }
  } catch (error: any) {
    console.error('Login error:', error)
    throw error
  }
}

export async function getProfile(userId: string) {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, first_name, last_name, role, profile_photo_url, phone, address, created_at, updated_at')
      .eq('id', userId)
      .single()

    if (error || !user) {
      throw new Error('User not found')
    }

    // Transform to camelCase for frontend
    const userResponse = {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role,
      profilePhotoUrl: user.profile_photo_url,
      phone: user.phone,
      address: user.address,
      createdAt: user.created_at,
      updatedAt: user.updated_at
    }

    return {
      user: userResponse
    }
  } catch (error: any) {
    console.error('Get profile error:', error)
    throw error
  }
}