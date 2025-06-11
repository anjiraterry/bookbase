import { supabase } from '../lib/supabase'
import { hashPassword, verifyPassword } from '../lib/serverUtils'
import { UpdateProfileInput, ChangePasswordInput } from '../lib/validations'

export async function updateProfile(userId: string, data: UpdateProfileInput) {
  try {
    const updateData: any = {}
    
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

    // Transform to camelCase for frontend
    const userResponse = {
      id: updatedUser.id,
      email: updatedUser.email,
      firstName: updatedUser.first_name,
      lastName: updatedUser.last_name,
      role: updatedUser.role,
      profilePhotoUrl: updatedUser.profile_photo_url,
      phone: updatedUser.phone,
      address: updatedUser.address,
      createdAt: updatedUser.created_at,
      updatedAt: updatedUser.updated_at
    }

    // Return plain object (not NextResponse)
    return {
      user: userResponse,
      message: 'Profile updated successfully'
    }
  } catch (error: any) {
    console.error('Update profile error:', error)
    throw error
  }
}

export async function changePassword(userId: string, data: ChangePasswordInput) {
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

    // Verify current password
    const isValidPassword = await verifyPassword(data.currentPassword, user.password_hash)
    
    if (!isValidPassword) {
      throw new Error('Current password is incorrect')
    }

    // Hash new password
    const newPasswordHash = await hashPassword(data.newPassword)

    // Update password
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

    // Return plain object (not NextResponse)
    return {
      message: 'Password changed successfully'
    }
  } catch (error: any) {
    console.error('Change password error:', error)
    throw error
  }
}

export async function getAllUsers(requestingUserRole: string) {
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

    // Transform to camelCase for frontend
    const transformedUsers = users.map(user => ({
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

    // Return plain array (not NextResponse)
    return transformedUsers
  } catch (error: any) {
    console.error('Get all users error:', error)
    throw error
  }
}

export async function getUserById(userId: string, requestingUserId: string, requestingUserRole: string) {
  try {
    // Users can only view their own profile, unless they're a librarian
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

    // Return plain object (not NextResponse)
    return {
      user: userResponse,
      message: 'User retrieved successfully'
    }
  } catch (error: any) {
    console.error('Get user by ID error:', error)
    throw error
  }
}

export async function deleteUser(userId: string, requestingUserRole: string) {
  try {
    // Only librarians can delete users
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

    // Return plain object (not NextResponse)
    return {
      message: 'User deleted successfully'
    }
  } catch (error: any) {
    console.error('Delete user error:', error)
    throw error
  }
}