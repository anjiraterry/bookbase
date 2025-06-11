import { NextRequest, NextResponse } from 'next/server'
import { getCheckoutsDueSoon } from '@/server/controller/checkoutController'
import { emailService } from '@/lib/email'

export async function GET(request: NextRequest) {
  try {
    console.log('Running due soon notifications cron job...')
    
    // Get all checkouts due in 2 days
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

    // Group checkouts by user
    const userGroups = dueSoonCheckouts.reduce((groups: any, checkout: any) => {
      const userId = checkout.userId
      if (!groups[userId]) {
        // ✅ Handle both naming conventions
        const firstName = checkout.user?.firstName || checkout.user?.first_name || ''
        const lastName = checkout.user?.lastName || checkout.user?.last_name || ''
        const fullName = `${firstName} ${lastName}`.trim()
        
        groups[userId] = {
          userEmail: checkout.user.email,
          userName: fullName || checkout.user.email || 'Library User',
          books: []
        }
        
        console.log(`User group created for ${userId}:`, {
          email: checkout.user.email,
          name: fullName,
          bookTitle: checkout.book?.title
        })
      }
      groups[userId].books.push(checkout)
      return groups
    }, {})

    console.log(`Created ${Object.keys(userGroups).length} user groups`)

    // Send emails to each user
    let emailsSent = 0
    let emailsFailed = 0

    for (const [userId, userData] of Object.entries(userGroups) as [string, any][]) {
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
      message: `Sent due soon notification for ${dueSoonCheckouts.length} books to ${emailsSent} users`,
      details: {
        totalBooks: dueSoonCheckouts.length,
        emailsSent,
        emailsFailed,
        totalUsers: Object.keys(userGroups).length
      }
    })
  } catch (error: any) {
    console.error('Error in due soon cron job:', error)
    return NextResponse.json(
      { error: 'Failed to send due soon notifications', details: error.message },
      { status: 500 }
    )
  }
}