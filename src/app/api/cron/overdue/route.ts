import { NextRequest, NextResponse } from 'next/server'
import { getOverdueCheckouts } from '@/server/controller/checkoutController'
import { emailService } from '@/lib/email'

interface CustomError {
  message?: string
}

interface OverdueBook {
  id: string
  bookId: string
  userId: string
  checkoutDate: string
  expectedReturnDate: string
  daysOverdue: number  
  book?: {
    id: string
    title: string
    isbn: string
    authors: string[]
    cover_image_url?: string
  }
  user?: {
    id: string
    first_name: string
    last_name: string
    email: string
    phone?: string
  }
}

export async function GET() {
  try {
    console.log('Running overdue notifications cron job...')
    
    const overdueCheckouts = await getOverdueCheckouts('librarian')
    
    if (overdueCheckouts.length === 0) {
      console.log('No overdue books found')
      return NextResponse.json({
        success: true,
        message: 'No overdue books found'
      })
    }

    // Transform TransformedCheckout[] to OverdueBook[]
    const overdueBooks: OverdueBook[] = overdueCheckouts.map(checkout => ({
      id: checkout.id,
      bookId: checkout.bookId,
      userId: checkout.userId,
      checkoutDate: checkout.checkoutDate,
      expectedReturnDate: checkout.expectedReturnDate,
      daysOverdue: checkout.daysOverdue || 0, // Ensure it's never undefined
      book: checkout.book,
      user: checkout.user
    }))

    const librarianEmail = process.env.LIBRARIAN_EMAIL
    if (!librarianEmail) {
      throw new Error('LIBRARIAN_EMAIL environment variable not set')
    }

    const result = await emailService.sendOverdueNotification(librarianEmail, overdueBooks)
    
    if (result.success) {
      console.log(`Overdue notification sent successfully for ${overdueBooks.length} books`)
      return NextResponse.json({
        success: true,
        message: `Sent overdue notification for ${overdueBooks.length} books`,
        details: {
          totalOverdueBooks: overdueBooks.length,
          librarianEmail
        }
      })
    } else {
      throw new Error('Failed to send overdue email')
    }
  } catch (error) {
    const customError = error as CustomError
    console.error('Error in overdue cron job:', customError)
    return NextResponse.json(
      { error: 'Failed to send overdue notifications', details: customError.message },
      { status: 500 }
    )
  }
}