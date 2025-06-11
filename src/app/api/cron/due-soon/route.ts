import { NextRequest, NextResponse } from 'next/server'
import { getCheckoutsDueSoon } from '@/server/controller/checkoutController'
import { emailService } from '@/lib/email'

interface CustomError {
  message?: string
}

interface Book {
  id: string
  title: string
  authors: string[]
  isbn?: string
}

interface User {
  id: string
  email: string
  first_name: string
  last_name: string
  phone?: string
}

// Define DueSoonBook to match what emailService expects
interface DueSoonBook {
  id: string
  bookId: string
  userId: string
  checkoutDate: string
  expectedReturnDate: string
  daysRemaining: number  // Required, not optional
  book?: Book
  user?: User
}

interface UserGroup {
  userEmail: string
  userName: string
  books: DueSoonBook[]
}

interface UserGroups {
  [userId: string]: UserGroup
}

export async function GET() {
  try {
    console.log('Running due soon notifications cron job...')
    
    const dueSoonCheckouts = await getCheckoutsDueSoon()
    
    if (dueSoonCheckouts.length === 0) {
      console.log('No books due soon found')
      return NextResponse.json({
        success: true,
        message: 'No books due soon found'
      })
    }

    console.log(`Found ${dueSoonCheckouts.length} checkouts due soon`)
    console.log('Sample checkout data:', dueSoonCheckouts[0])

    // Transform TransformedCheckout[] to DueSoonBook[]
    const dueSoonBooks: DueSoonBook[] = dueSoonCheckouts.map(checkout => ({
      id: checkout.id,
      bookId: checkout.bookId,
      userId: checkout.userId,
      checkoutDate: checkout.checkoutDate,
      expectedReturnDate: checkout.expectedReturnDate,
      daysRemaining: checkout.daysRemaining || 0, // Ensure it's never undefined
      book: checkout.book,
      user: checkout.user
    }))

    const userGroups = dueSoonBooks.reduce((groups: UserGroups, checkout: DueSoonBook) => {
      const checkoutUserId = checkout.userId
      if (!groups[checkoutUserId]) {
        const firstName = checkout.user?.first_name || ''
        const lastName = checkout.user?.last_name || ''
        const fullName = `${firstName} ${lastName}`.trim()
        
        groups[checkoutUserId] = {
          userEmail: checkout.user?.email || '',
          userName: fullName || checkout.user?.email || 'Library User',
          books: []
        }
        
        console.log(`User group created for ${checkoutUserId}:`, {
          email: checkout.user?.email,
          name: fullName,
          bookTitle: checkout.book?.title
        })
      }
      groups[checkoutUserId].books.push(checkout)
      return groups
    }, {} as UserGroups)

    console.log(`Created ${Object.keys(userGroups).length} user groups`)

    let emailsSent = 0
    let emailsFailed = 0

    for (const [, userData] of Object.entries(userGroups)) {
      console.log(`Sending email to ${userData.userEmail}...`)
      
      const result = await emailService.sendDueSoonNotification(
        userData.userEmail,
        userData.userName,
        userData.books
      )
      
      if (result.success) {
        emailsSent++
        console.log(`✅ Email sent to ${userData.userEmail}`)
      } else {
        emailsFailed++
        console.log(`❌ Email failed for ${userData.userEmail}:`, result.error)
      }
    }

    console.log(`Due soon notifications completed: ${emailsSent} sent, ${emailsFailed} failed`)

    return NextResponse.json({
      success: true,
      message: `Sent due soon notification for ${dueSoonBooks.length} books to ${emailsSent} users`,
      details: {
        totalBooks: dueSoonBooks.length,
        emailsSent,
        emailsFailed,
        totalUsers: Object.keys(userGroups).length
      }
    })
  } catch (error) {
    const customError = error as CustomError
    console.error('Error in due soon cron job:', customError)
    return NextResponse.json(
      { error: 'Failed to send due soon notifications', details: customError.message },
      { status: 500 }
    )
  }
}