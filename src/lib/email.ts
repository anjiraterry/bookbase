import nodemailer from 'nodemailer'

interface Book {
  id: string
  title: string
  authors: string[]
  isbn?: string
}

interface User {
  id: string
  first_name: string
  last_name: string
  email: string
  phone?: string
}

interface DueSoonBook {
  book?: Book
  expectedReturnDate: string
  daysRemaining: number
}

interface OverdueBook {
  book?: Book
  user?: User
  checkoutDate: string
  expectedReturnDate: string
  daysOverdue: number
}

interface EmailResult {
  success: boolean
  messageId?: string
  error?: unknown
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER, 
    pass: process.env.GMAIL_APP_PASSWORD, 
  },
})

export const emailService = {
  sendDueSoonNotification: async (userEmail: string, userName: string, books: DueSoonBook[]): Promise<EmailResult> => {
    try {
      console.log('=== SENDING DUE SOON EMAIL VIA GMAIL ===')
      console.log('To:', userEmail)
      console.log('User:', userName)
      console.log('Books count:', books.length)

      const booksList = books.map(book => {
        const title = book.book?.title || 'Unknown Title'
        const authors = book.book?.authors?.join(', ') || 'Unknown Author'
        const dueDate = new Date(book.expectedReturnDate).toLocaleDateString()
        const daysRemaining = book.daysRemaining
        
        return `• ${title} by ${authors} - Due: ${dueDate} (${daysRemaining} days remaining)`
      }).join('\n')

      const mailOptions = {
        from: `"Library System" <${process.env.GMAIL_USER}>`,
        to: userEmail,
        subject: 'Books Due Soon - Library Reminder',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Hello ${userName},</h2>
            <p>This is a friendly reminder that you have <strong>${books.length}</strong> book(s) due in 2 days:</p>
            <div style="background-color: #f0f9ff; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #3b82f6;">
              <pre style="margin: 0; white-space: pre-wrap; font-family: inherit;">${booksList}</pre>
            </div>
            <p>Please return them on time to avoid late fees.</p>
            <p><strong>Library Policies:</strong></p>
            <ul style="margin: 10px 0;">
              <li>Books must be returned by the due date</li>
              <li>Late fees may apply for overdue books</li>
              <li>You can return books at the library during operating hours</li>
            </ul>
            <br>
            <p>Best regards,<br>Your Library Team</p>
            <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
            <p style="font-size: 12px; color: #6b7280;">
              This is an automated reminder from the Library Management System.
            </p>
          </div>
        `
      }

      console.log('About to send email via Gmail...')
      const result = await transporter.sendMail(mailOptions)
      
      console.log('✅ Email sent successfully!')
      console.log('Message ID:', result.messageId)
      return { success: true, messageId: result.messageId }
    } catch (error) {
      console.error('❌ Failed to send due soon email:', error)
      return { success: false, error }
    }
  },

  sendOverdueNotification: async (librarianEmail: string, overdueBooks: OverdueBook[]): Promise<EmailResult> => {
    try {
      console.log('=== SENDING OVERDUE EMAIL VIA GMAIL ===')
      console.log('To:', librarianEmail)
      console.log('Books count:', overdueBooks.length)

      const booksList = overdueBooks.map(book => {
        const title = book.book?.title || 'Unknown Title'
        const authors = book.book?.authors?.join(', ') || 'Unknown Author'
        const isbn = book.book?.isbn || 'No ISBN'
        const userName = book.user ? `${book.user.first_name} ${book.user.last_name}`.trim() : 'Unknown User'
        const userEmail = book.user?.email || 'No email'
        const userPhone = book.user?.phone || 'No phone'
        const checkoutDate = new Date(book.checkoutDate).toLocaleDateString()
        const dueDate = new Date(book.expectedReturnDate).toLocaleDateString()
        const daysOverdue = book.daysOverdue
        
        return `
📚 Book: ${title} by ${authors} (ISBN: ${isbn})
👤 User: ${userName}
📧 Email: ${userEmail}
📞 Phone: ${userPhone}
📅 Checked out: ${checkoutDate}
⏰ Due date: ${dueDate}
🚨 Days overdue: ${daysOverdue}
        `.trim()
      }).join('\n\n' + '─'.repeat(50) + '\n\n')

      const totalOverdue = overdueBooks.length
      const averageDaysOverdue = Math.round(overdueBooks.reduce((sum, book) => sum + book.daysOverdue, 0) / totalOverdue)
      const mostOverdueBook = overdueBooks.reduce((max, book) => book.daysOverdue > max.daysOverdue ? book : max, overdueBooks[0])

      const mailOptions = {
        from: `"Library System" <${process.env.GMAIL_USER}>`,
        to: librarianEmail,
        subject: `📚 Overdue Books Report - ${totalOverdue} books need attention`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto;">
            <h2 style="color: #dc2626;">📚 Daily Overdue Books Report</h2>
            <p>The following <strong>${totalOverdue}</strong> books are overdue as of <strong>${new Date().toLocaleDateString()}</strong>:</p>
            
            <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444;">
              <h3 style="margin-top: 0; color: #dc2626;">Summary Statistics</h3>
              <ul style="margin: 10px 0;">
                <li><strong>Total overdue books:</strong> ${totalOverdue}</li>
                <li><strong>Average days overdue:</strong> ${averageDaysOverdue} days</li>
                <li><strong>Most overdue book:</strong> "${mostOverdueBook.book?.title}" (${mostOverdueBook.daysOverdue} days overdue)</li>
              </ul>
            </div>

            <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Detailed List:</h3>
              <pre style="margin: 0; white-space: pre-wrap; font-family: 'Courier New', monospace; font-size: 14px; line-height: 1.4;">${booksList}</pre>
            </div>

            <div style="background-color: #f0f9ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #1d4ed8;">📋 Recommended Actions:</h3>
              <ul>
                <li>Contact users with books overdue more than 7 days</li>
                <li>Send follow-up reminders to users with multiple overdue books</li>
                <li>Consider applying late fees as per library policy</li>
                <li>Update user records if necessary</li>
              </ul>
            </div>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
            <p style="font-size: 14px; color: #6b7280;">
              Generated automatically by the Library Management System on ${new Date().toLocaleString()}<br>
              This report is sent daily at 6:00 PM to help manage overdue books.
            </p>
          </div>
        `
      }

      console.log('About to send overdue email via Gmail...')
      const result = await transporter.sendMail(mailOptions)
      
      console.log('✅ Overdue email sent successfully!')
      console.log('Message ID:', result.messageId)
      return { success: true, messageId: result.messageId }
    } catch (error) {
      console.error('❌ Failed to send overdue email:', error)
      return { success: false, error }
    }
  }
}