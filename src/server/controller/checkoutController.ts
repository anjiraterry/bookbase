import { supabase } from '../lib/supabase'
import { getDaysRemaining } from '../lib/serverUtils'
import { calculateDueDate } from '../lib/utils'
import { CheckoutInput, CheckinInput } from '../lib/validations'

interface DatabaseBook {
  id: string
  title: string
  isbn: string
  authors: string[]
  cover_image_url?: string
  available_copies: number
  total_copies: number
}

interface DatabaseUser {
  first_name: string
  last_name: string
  email: string
  phone?: string
}

interface DatabaseCheckout {
  id: string
  book_id: string
  user_id: string
  checkout_date: string
  expected_return_date: string
  actual_return_date?: string
  is_returned: boolean
  created_at: string
  updated_at: string
  book?: DatabaseBook
  user?: DatabaseUser
}

interface TransformedCheckout {
  id: string
  bookId: string
  userId: string
  checkoutDate: string
  expectedReturnDate: string
  actualReturnDate?: string
  isReturned: boolean
  createdAt: string
  updatedAt: string
  book?: DatabaseBook
  user?: DatabaseUser
  daysRemaining?: number
  isOverdue?: boolean
  daysOverdue?: number
}

interface CheckoutResponse {
  checkout: TransformedCheckout
  message: string
}

interface CustomError {
  message: string
  code?: string
}

export async function checkoutBook(data: CheckoutInput, userId: string, userRole: string): Promise<CheckoutResponse> {
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

    const dbCheckout = checkout as DatabaseCheckout

    // Transform to camelCase for frontend
    const transformedCheckout: TransformedCheckout = {
      id: dbCheckout.id,
      bookId: dbCheckout.book_id,
      userId: dbCheckout.user_id,
      checkoutDate: dbCheckout.checkout_date,
      expectedReturnDate: dbCheckout.expected_return_date,
      actualReturnDate: dbCheckout.actual_return_date,
      isReturned: dbCheckout.is_returned,
      createdAt: dbCheckout.created_at,
      updatedAt: dbCheckout.updated_at,
      book: dbCheckout.book,
      user: dbCheckout.user
    }

    return {
      checkout: transformedCheckout,
      message: 'Book checked out successfully'
    }
  } catch (error) {
    const customError = error as CustomError
    console.error('Error in checkoutBook controller:', customError)
    throw customError
  }
}

export async function checkinBook(data: CheckinInput, userId: string, userRole: string): Promise<CheckoutResponse> {
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

    const dbUpdatedCheckout = updatedCheckout as DatabaseCheckout

    // Transform to camelCase for frontend
    const transformedCheckout: TransformedCheckout = {
      id: dbUpdatedCheckout.id,
      bookId: dbUpdatedCheckout.book_id,
      userId: dbUpdatedCheckout.user_id,
      checkoutDate: dbUpdatedCheckout.checkout_date,
      expectedReturnDate: dbUpdatedCheckout.expected_return_date,
      actualReturnDate: dbUpdatedCheckout.actual_return_date,
      isReturned: dbUpdatedCheckout.is_returned,
      createdAt: dbUpdatedCheckout.created_at,
      updatedAt: dbUpdatedCheckout.updated_at,
      book: dbUpdatedCheckout.book,
      user: dbUpdatedCheckout.user
    }

    return {
      checkout: transformedCheckout,
      message: 'Book returned successfully'
    }
  } catch (error) {
    const customError = error as CustomError
    console.error('Error in checkinBook controller:', customError)
    throw customError
  }
}

export async function getUserCheckouts(userId: string, requestingUserId: string, requestingUserRole: string): Promise<TransformedCheckout[]> {
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

    const dbCheckouts = checkouts as DatabaseCheckout[]

    // Add calculated fields and transform to camelCase
    const enhancedCheckouts: TransformedCheckout[] = dbCheckouts.map(checkout => ({
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
  } catch (error) {
    const customError = error as CustomError
    console.error('Error in getUserCheckouts controller:', customError)
    throw customError
  }
}

export async function getAllCheckouts(userRole: string): Promise<TransformedCheckout[]> {
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

    const dbCheckouts = checkouts as DatabaseCheckout[]

    // Add calculated fields and transform to camelCase
    const enhancedCheckouts: TransformedCheckout[] = dbCheckouts.map(checkout => ({
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
  } catch (error) {
    const customError = error as CustomError
    console.error('Error in getAllCheckouts controller:', customError)
    throw customError
  }
}

export async function getOverdueCheckouts(userRole: string): Promise<TransformedCheckout[]> {
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

    const dbCheckouts = checkouts as DatabaseCheckout[]

    // Add calculated fields and transform to camelCase
    const overdueCheckouts: TransformedCheckout[] = dbCheckouts.map(checkout => ({
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
  } catch (error) {
    const customError = error as CustomError
    console.error('Error in getOverdueCheckouts controller:', customError)
    throw customError
  }
}

export async function getActiveCheckouts(userRole: string, userId?: string): Promise<TransformedCheckout[]> {
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

    const dbCheckouts = checkouts as DatabaseCheckout[]

    // Add calculated fields and transform to camelCase
    const activeCheckouts: TransformedCheckout[] = dbCheckouts.map(checkout => ({
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
  } catch (error) {
    const customError = error as CustomError
    console.error('Error in getActiveCheckouts controller:', customError)
    throw customError
  }
}

export async function getCheckoutsDueSoon(): Promise<TransformedCheckout[]> {
  try {
    console.log('getCheckoutsDueSoon called')
    
    const twoDaysFromNow = new Date()
    twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2)
    
    const { data: checkouts, error } = await supabase
      .from('checkouts')
      .select(`
        *,
        book:books(title, isbn, authors, cover_image_url),
        user:users(first_name, last_name, email, firstName, lastName)
      `)
      .eq('is_returned', false)
      .lte('expected_return_date', twoDaysFromNow.toISOString())
      .gt('expected_return_date', new Date().toISOString())
      .order('expected_return_date', { ascending: true })

    if (error) {
      console.error('Database error getting checkouts due soon:', error)
      throw new Error('Failed to get checkouts due soon')
    }

    const dbCheckouts = checkouts as DatabaseCheckout[]

    // Add calculated fields and transform
    const dueSoonCheckouts: TransformedCheckout[] = dbCheckouts.map(checkout => ({
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

    console.log('Checkouts due soon retrieved:', dueSoonCheckouts.length)
    return dueSoonCheckouts
  } catch (error) {
    const customError = error as CustomError
    console.error('Error in getCheckoutsDueSoon controller:', customError)
    throw customError
  }
}