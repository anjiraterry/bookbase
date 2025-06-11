import { supabase } from '../lib/supabase'
import { getDaysRemaining } from '../lib/serverUtils'
import { calculateDueDate } from '../lib/utils'
import { CheckoutInput, CheckinInput } from '../lib/validations'

export async function checkoutBook(data: CheckoutInput, userId: string, userRole: string) {
  try {
    console.log('checkoutBook called with data:', data, 'userId:', userId, 'userRole:', userRole)
    
    const bookId = data.bookId
    const checkoutUserId = data.userId || userId // Librarians can checkout for others

    // Check if book exists and is available
    const { data: book, error: bookError } = await supabase
      .from('books')
      .select('id, title, available_copies, total_copies')
      .eq('id', bookId)
      .single()

    if (bookError || !book) {
      throw new Error('Book not found')
    }

    if (book.available_copies <= 0) {
      throw new Error('Book is not available for checkout')
    }

    // Check if user already has this book checked out
    const { data: existingCheckout } = await supabase
      .from('checkouts')
      .select('id')
      .eq('book_id', bookId)
      .eq('user_id', checkoutUserId)
      .eq('is_returned', false)
      .single()

    if (existingCheckout) {
      throw new Error('User already has this book checked out')
    }

    // Calculate expected return date (10 days from now)
    const checkoutDate = new Date()
    const expectedReturnDate = calculateDueDate(checkoutDate)

    // Create checkout record
    const { data: checkout, error: checkoutError } = await supabase
      .from('checkouts')
      .insert({
        book_id: bookId,
        user_id: checkoutUserId,
        checkout_date: checkoutDate.toISOString(),
        expected_return_date: expectedReturnDate.toISOString()
      })
      .select(`
        *,
        book:books(title, isbn, authors, cover_image_url),
        user:users(first_name, last_name, email)
      `)
      .single()

    if (checkoutError) {
      console.error('Database error creating checkout:', checkoutError)
      throw new Error('Failed to checkout book')
    }

    // Update book availability
    const { error: updateError } = await supabase
      .from('books')
      .update({ available_copies: book.available_copies - 1 })
      .eq('id', bookId)

    if (updateError) {
      console.error('Database error updating book availability:', updateError)
      throw new Error('Failed to update book availability')
    }

    console.log('Book checked out successfully')

    // Transform to camelCase for frontend
    const transformedCheckout = {
      id: checkout.id,
      bookId: checkout.book_id,
      userId: checkout.user_id,
      checkoutDate: checkout.checkout_date,
      expectedReturnDate: checkout.expected_return_date,
      actualReturnDate: checkout.actual_return_date,
      isReturned: checkout.is_returned,
      createdAt: checkout.created_at,
      updatedAt: checkout.updated_at,
      book: checkout.book,
      user: checkout.user
    }

    return {
      checkout: transformedCheckout,
      message: 'Book checked out successfully'
    }
  } catch (error: any) {
    console.error('Error in checkoutBook controller:', error)
    throw error
  }
}

export async function checkinBook(data: CheckinInput, userId: string, userRole: string) {
  try {
    console.log('checkinBook called with data:', data, 'userId:', userId, 'userRole:', userRole)
    
    const checkoutId = data.checkoutId

    // Get checkout details
    const { data: checkout, error: checkoutError } = await supabase
      .from('checkouts')
      .select(`
        *,
        book:books(id, title, available_copies),
        user:users(first_name, last_name, email)
      `)
      .eq('id', checkoutId)
      .single()

    if (checkoutError || !checkout) {
      throw new Error('Checkout record not found')
    }

    // Check if already returned
    if (checkout.is_returned) {
      throw new Error('Book has already been returned')
    }

    // Check permissions (user can only return their own books, librarians can return any)
    if (userRole !== 'librarian' && checkout.user_id !== userId) {
      throw new Error('You can only return your own books')
    }

    const returnDate = new Date()

    // Update checkout record
    const { data: updatedCheckout, error: updateError } = await supabase
      .from('checkouts')
      .update({
        actual_return_date: returnDate.toISOString(),
        is_returned: true
      })
      .eq('id', checkoutId)
      .select(`
        *,
        book:books(title, isbn, authors, cover_image_url),
        user:users(first_name, last_name, email)
      `)
      .single()

    if (updateError) {
      console.error('Database error updating checkout:', updateError)
      throw new Error('Failed to return book')
    }

    // Update book availability
    const { error: bookUpdateError } = await supabase
      .from('books')
      .update({ 
        available_copies: checkout.book.available_copies + 1 
      })
      .eq('id', checkout.book_id)

    if (bookUpdateError) {
      console.error('Database error updating book availability:', bookUpdateError)
      throw new Error('Failed to update book availability')
    }

    console.log('Book returned successfully')

    // Transform to camelCase for frontend
    const transformedCheckout = {
      id: updatedCheckout.id,
      bookId: updatedCheckout.book_id,
      userId: updatedCheckout.user_id,
      checkoutDate: updatedCheckout.checkout_date,
      expectedReturnDate: updatedCheckout.expected_return_date,
      actualReturnDate: updatedCheckout.actual_return_date,
      isReturned: updatedCheckout.is_returned,
      createdAt: updatedCheckout.created_at,
      updatedAt: updatedCheckout.updated_at,
      book: updatedCheckout.book,
      user: updatedCheckout.user
    }

    return {
      checkout: transformedCheckout,
      message: 'Book returned successfully'
    }
  } catch (error: any) {
    console.error('Error in checkinBook controller:', error)
    throw error
  }
}

export async function getUserCheckouts(userId: string, requestingUserId: string, requestingUserRole: string) {
  try {
    console.log('getUserCheckouts called for userId:', userId, 'by:', requestingUserId, 'role:', requestingUserRole)
    
    // Users can only view their own checkouts, librarians can view any
    if (requestingUserRole !== 'librarian' && userId !== requestingUserId) {
      throw new Error('Access denied')
    }

    const { data: checkouts, error } = await supabase
      .from('checkouts')
      .select(`
        *,
        book:books(title, isbn, authors, cover_image_url),
        user:users(first_name, last_name, email)
      `)
      .eq('user_id', userId)
      .order('checkout_date', { ascending: false })

    if (error) {
      console.error('Database error getting user checkouts:', error)
      throw new Error('Failed to get user checkouts')
    }

    // Add calculated fields and transform to camelCase
    const enhancedCheckouts = checkouts.map(checkout => ({
      id: checkout.id,
      bookId: checkout.book_id,
      userId: checkout.user_id,
      checkoutDate: checkout.checkout_date,
      expectedReturnDate: checkout.expected_return_date,
      actualReturnDate: checkout.actual_return_date,
      isReturned: checkout.is_returned,
      createdAt: checkout.created_at,
      updatedAt: checkout.updated_at,
      book: checkout.book,
      user: checkout.user,
      daysRemaining: getDaysRemaining(checkout.expected_return_date),
      isOverdue: new Date(checkout.expected_return_date) < new Date() && !checkout.is_returned
    }))

    console.log('User checkouts retrieved:', enhancedCheckouts.length)
    return enhancedCheckouts
  } catch (error: any) {
    console.error('Error in getUserCheckouts controller:', error)
    throw error
  }
}

export async function getAllCheckouts(userRole: string) {
  try {
    console.log('getAllCheckouts called for role:', userRole)
    
    // Only librarians can view all checkouts
    if (userRole !== 'librarian') {
      throw new Error('Librarian access required')
    }

    const { data: checkouts, error } = await supabase
      .from('checkouts')
      .select(`
        *,
        book:books(title, isbn, authors, cover_image_url),
        user:users(first_name, last_name, email)
      `)
      .order('checkout_date', { ascending: false })

    if (error) {
      console.error('Database error getting all checkouts:', error)
      throw new Error('Failed to get all checkouts')
    }

    // Add calculated fields and transform to camelCase
    const enhancedCheckouts = checkouts.map(checkout => ({
      id: checkout.id,
      bookId: checkout.book_id,
      userId: checkout.user_id,
      checkoutDate: checkout.checkout_date,
      expectedReturnDate: checkout.expected_return_date,
      actualReturnDate: checkout.actual_return_date,
      isReturned: checkout.is_returned,
      createdAt: checkout.created_at,
      updatedAt: checkout.updated_at,
      book: checkout.book,
      user: checkout.user,
      daysRemaining: getDaysRemaining(checkout.expected_return_date),
      isOverdue: new Date(checkout.expected_return_date) < new Date() && !checkout.is_returned
    }))

    console.log('All checkouts retrieved:', enhancedCheckouts.length)
    return enhancedCheckouts
  } catch (error: any) {
    console.error('Error in getAllCheckouts controller:', error)
    throw error
  }
}

export async function getOverdueCheckouts(userRole: string) {
  try {
    console.log('getOverdueCheckouts called for role:', userRole)
    
    // Only librarians can view overdue reports
    if (userRole !== 'librarian') {
      throw new Error('Librarian access required')
    }

    const { data: checkouts, error } = await supabase
      .from('checkouts')
      .select(`
        *,
        book:books(title, isbn, authors, cover_image_url),
        user:users(first_name, last_name, email, phone)
      `)
      .eq('is_returned', false)
      .lt('expected_return_date', new Date().toISOString())
      .order('expected_return_date', { ascending: true })

    if (error) {
      console.error('Database error getting overdue checkouts:', error)
      throw new Error('Failed to get overdue checkouts')
    }

    // Add calculated fields and transform to camelCase
    const overdueCheckouts = checkouts.map(checkout => ({
      id: checkout.id,
      bookId: checkout.book_id,
      userId: checkout.user_id,
      checkoutDate: checkout.checkout_date,
      expectedReturnDate: checkout.expected_return_date,
      actualReturnDate: checkout.actual_return_date,
      isReturned: checkout.is_returned,
      createdAt: checkout.created_at,
      updatedAt: checkout.updated_at,
      book: checkout.book,
      user: checkout.user,
      daysOverdue: Math.abs(getDaysRemaining(checkout.expected_return_date))
    }))

    console.log('Overdue checkouts retrieved:', overdueCheckouts.length)
    return overdueCheckouts
  } catch (error: any) {
    console.error('Error in getOverdueCheckouts controller:', error)
    throw error
  }
}

export async function getActiveCheckouts(userRole: string, userId?: string) {
  try {
    console.log('getActiveCheckouts called for role:', userRole, 'userId:', userId)
    
    let query = supabase
      .from('checkouts')
      .select(`
        *,
        book:books(title, isbn, authors, cover_image_url),
        user:users(first_name, last_name, email)
      `)
      .eq('is_returned', false)

    // If it's a reader, only show their own checkouts
    if (userRole === 'reader' && userId) {
      query = query.eq('user_id', userId)
    }

    query = query.order('expected_return_date', { ascending: true })

    const { data: checkouts, error } = await query

    if (error) {
      console.error('Database error getting active checkouts:', error)
      throw new Error('Failed to get active checkouts')
    }

    // Add calculated fields and transform to camelCase
    const activeCheckouts = checkouts.map(checkout => ({
      id: checkout.id,
      bookId: checkout.book_id,
      userId: checkout.user_id,
      checkoutDate: checkout.checkout_date,
      expectedReturnDate: checkout.expected_return_date,
      actualReturnDate: checkout.actual_return_date,
      isReturned: checkout.is_returned,
      createdAt: checkout.created_at,
      updatedAt: checkout.updated_at,
      book: checkout.book,
      user: checkout.user,
      daysRemaining: getDaysRemaining(checkout.expected_return_date),
      isOverdue: new Date(checkout.expected_return_date) < new Date()
    }))

    console.log('Active checkouts retrieved:', activeCheckouts.length)
    return activeCheckouts
  } catch (error: any) {
    console.error('Error in getActiveCheckouts controller:', error)
    throw error
  }
}


export async function getCheckoutsDueSoon() {
  try {
    console.log('getCheckoutsDueSoon called')
    
    // Calculate 2 days from now
    const twoDaysFromNow = new Date()
    twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2)
    twoDaysFromNow.setHours(23, 59, 59, 999)

    const startOfDay = new Date(twoDaysFromNow)
    startOfDay.setHours(0, 0, 0, 0)

    const { data: checkouts, error } = await supabase
      .from('checkouts')
      .select(`
        *,
        book:books(title, isbn, authors, cover_image_url),
        user:users(first_name, last_name, email)
      `)
      .eq('is_returned', false)
      .gte('expected_return_date', startOfDay.toISOString())
      .lte('expected_return_date', twoDaysFromNow.toISOString())
      .order('user_id')

    if (error) {
      console.error('Database error getting due soon checkouts:', error)
      throw new Error('Failed to get due soon checkouts')
    }

    // Transform to camelCase for frontend
    const transformedCheckouts = checkouts.map(checkout => ({
      id: checkout.id,
      bookId: checkout.book_id,
      userId: checkout.user_id,
      checkoutDate: checkout.checkout_date,
      expectedReturnDate: checkout.expected_return_date,
      actualReturnDate: checkout.actual_return_date,
      isReturned: checkout.is_returned,
      createdAt: checkout.created_at,
      updatedAt: checkout.updated_at,
      book: checkout.book,
      user: checkout.user,
      daysRemaining: getDaysRemaining(checkout.expected_return_date)
    }))

    console.log('Due soon checkouts retrieved:', transformedCheckouts.length)
    return transformedCheckouts
  } catch (error: any) {
    console.error('Error in getCheckoutsDueSoon controller:', error)
    throw error
  }
}

export async function getOverdueCheckoutsForEmail() {
  try {
    console.log('getOverdueCheckoutsForEmail called')
    
    const { data: checkouts, error } = await supabase
      .from('checkouts')
      .select(`
        *,
        book:books(title, isbn, authors, cover_image_url),
        user:users(first_name, last_name, email, phone)
      `)
      .eq('is_returned', false)
      .lt('expected_return_date', new Date().toISOString())
      .order('expected_return_date', { ascending: true })

    if (error) {
      console.error('Database error getting overdue checkouts for email:', error)
      throw new Error('Failed to get overdue checkouts for email')
    }

    // Add calculated fields and transform to camelCase
    const overdueCheckouts = checkouts.map(checkout => ({
      id: checkout.id,
      bookId: checkout.book_id,
      userId: checkout.user_id,
      checkoutDate: checkout.checkout_date,
      expectedReturnDate: checkout.expected_return_date,
      actualReturnDate: checkout.actual_return_date,
      isReturned: checkout.is_returned,
      createdAt: checkout.created_at,
      updatedAt: checkout.updated_at,
      book: checkout.book,
      user: checkout.user,
      daysOverdue: Math.abs(getDaysRemaining(checkout.expected_return_date))
    }))

    console.log('Overdue checkouts for email retrieved:', overdueCheckouts.length)
    return overdueCheckouts
  } catch (error: any) {
    console.error('Error in getOverdueCheckoutsForEmail controller:', error)
    throw error
  }
}