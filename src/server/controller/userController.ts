import { supabase } from '../lib/supabase'
import { hashPassword, verifyPassword } from '../lib/serverUtils'
import { UpdateProfileInput, ChangePasswordInput } from '../lib/validations'

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
  updatedAt: string
}

interface UpdateData {
  first_name?: string
  last_name?: string
  phone?: string
  address?: string
  profile_photo_url?: string
}

interface ProfileUpdateResponse {
  user: UserResponse
  message: string
}

interface MessageResponse {
  message: string
}

interface UserDetailResponse {
  user: UserResponse
  message: string
}

interface CustomError {
  message: string
  code?: string
}

export async function updateProfile(userId: string, data: UpdateProfileInput): Promise<ProfileUpdateResponse> {
  try {
    const updateData: UpdateData = {}
    
    if (data.firstName) updateData.first_name = data.firstName
    if (data.lastName) updateData.last_name = data.lastName
    if (data.phone !== undefined) updateData.phone = data.phone
    if (data.address !== undefined) updateData.address = data.address
    if (data.profilePhotoUrl !== undefined) updateData.profile_photo_url = data.profilePhotoUrl

    const { data: updatedUser, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .select('id, email, first_name, last_name, role, profile_photo_url, phone, address, created_at, updated_at')
      .single()

    if (error) {
      console.error('Database error:', error)
      throw new Error('Failed to update profile')
    }

    const dbUser = updatedUser as DatabaseUser

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
      message: 'Profile updated successfully'
    }
  } catch (error) {
    const customError = error as CustomError
    console.error('Update profile error:', customError)
    throw customError
  }
}

export async function changePassword(userId: string, data: ChangePasswordInput): Promise<MessageResponse> {
  try {
    // Get current user
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('password_hash')
      .eq('id', userId)
      .single()

    if (userError || !user) {
      throw new Error('User not found')
    }

    const dbUser = user as DatabaseUser
   
    const isValidPassword = await verifyPassword(data.currentPassword, dbUser.password_hash!)
    
    if (!isValidPassword) {
      throw new Error('Current password is incorrect')
    }

    const newPasswordHash = await hashPassword(data.newPassword)

    const { error } = await supabase
      .from('users')
      .update({ 
        password_hash: newPasswordHash,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (error) {
      console.error('Database error:', error)
      throw new Error('Failed to update password')
    }

    return {
      message: 'Password changed successfully'
    }
  } catch (error) {
    const customError = error as CustomError
    console.error('Change password error:', customError)
    throw customError
  }
}

export async function getAllUsers(requestingUserRole: string): Promise<UserResponse[]> {
  try {
    // Only librarians can view all users
    if (requestingUserRole !== 'librarian') {
      throw new Error('Librarian access required')
    }

    const { data: users, error } = await supabase
      .from('users')
      .select('id, email, first_name, last_name, role, profile_photo_url, phone, address, created_at, updated_at')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Database error:', error)
      throw new Error('Failed to fetch users')
    }

    const dbUsers = users as DatabaseUser[]

    // Transform to camelCase for frontend
    const transformedUsers: UserResponse[] = dbUsers.map(user => ({
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
    }))

    return transformedUsers
  } catch (error) {
    const customError = error as CustomError
    console.error('Get all users error:', customError)
    throw customError
  }
}

export async function getUserById(userId: string, requestingUserId: string, requestingUserRole: string): Promise<UserDetailResponse> {
  try {
    if (requestingUserRole !== 'librarian' && userId !== requestingUserId) {
      throw new Error('Access denied')
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, first_name, last_name, role, profile_photo_url, phone, address, created_at, updated_at')
      .eq('id', userId)
      .single()

    if (error || !user) {
      throw new Error('User not found')
    }

    const dbUser = user as DatabaseUser

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
      message: 'User retrieved successfully'
    }
  } catch (error) {
    const customError = error as CustomError
    console.error('Get user by ID error:', customError)
    throw customError
  }
}

export async function deleteUser(userId: string, requestingUserRole: string): Promise<MessageResponse> {
  try {
    if (requestingUserRole !== 'librarian') {
      throw new Error('Librarian access required')
    }

    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId)

    if (error) {
      console.error('Database error:', error)
      throw new Error('Failed to delete user')
    }

    return {
      message: 'User deleted successfully'
    }
  } catch (error) {
    const customError = error as CustomError
    console.error('Delete user error:', customError)
    throw customError
  }
}