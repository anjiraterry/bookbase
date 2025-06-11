import { NextRequest, NextResponse } from 'next/server'
import { getOverdueCheckoutsForEmail } from '@/server/controller/checkoutController'
import { emailService } from '@/lib/email'

interface CustomError {
  message?: string
}

export async function GET(_request: NextRequest) {
  try {
    console.log('Running overdue notifications cron job...')
    
    const overdueCheckouts = await getOverdueCheckoutsForEmail()
    
    if (overdueCheckouts.length === 0) {
      console.log('No overdue books found')
      return NextResponse.json({
        success: true,
        message: 'No overdue books found'
      })
    }

    const librarianEmail = process.env.LIBRARIAN_EMAIL
    if (!librarianEmail) {
      throw new Error('LIBRARIAN_EMAIL environment variable not set')
    }

    const result = await emailService.sendOverdueNotification(librarianEmail, overdueCheckouts)
    
    if (result.success) {
      console.log(`Overdue notification sent successfully for ${overdueCheckouts.length} books`)
      return NextResponse.json({
        success: true,
        message: `Sent overdue notification for ${overdueCheckouts.length} books`,
        details: {
          totalOverdueBooks: overdueCheckouts.length,
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