import { z } from 'zod'

// Auth validations
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
})

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  role: z.enum(['librarian', 'reader']).default('reader'),
  phone: z.string().optional(),
  address: z.string().optional(),
  profilePhotoUrl: z.string().url().optional() // ✅ Added optional profile photo URL
})


// User management validations
export const updateProfileSchema = z.object({
  firstName: z.string().min(1, 'First name is required').optional(),
  lastName: z.string().min(1, 'Last name is required').optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  profilePhotoUrl: z.string().url('Invalid URL').optional()
})

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(6, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Confirm password is required')
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
})

// Book validations
export const bookSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  isbn: z.string().min(1, 'ISBN is required'),
  authors: z.array(z.string()).min(1, 'At least one author is required'),
  publisher: z.string().optional(),
  publishedDate: z.string().optional(),
  genre: z.string().optional(),
  description: z.string().optional(),
  totalCopies: z.number().min(1, 'Must have at least 1 copy').default(1),
  revisionNumber: z.string().optional(),
  coverImageUrl: z.string().url('Invalid URL').optional().or(z.literal(''))
})

export const updateBookSchema = bookSchema.partial()

// Search validations - Fixed to handle query string parameters
export const searchBooksSchema = z.object({
  title: z.string().optional(),
  isbn: z.string().optional(),
  publisher: z.string().optional(),
  dateAddedFrom: z.string().optional(),
  dateAddedTo: z.string().optional(),
  genre: z.string().optional(),
  // Transform string query params to numbers with defaults
  page: z.string().transform(Number).pipe(z.number().min(1)).default('1'),
  limit: z.string().transform(Number).pipe(z.number().min(1).max(100)).default('10')
})

// Checkout validations - Made less strict for IDs
export const checkoutSchema = z.object({
  bookId: z.string().min(1, 'Invalid book ID'), // Changed from UUID to basic string
  userId: z.string().min(1, 'Invalid user ID').optional() // Optional for readers (auto-filled from token)
})

export const checkinSchema = z.object({
  checkoutId: z.string().min(1, 'Invalid checkout ID') // Changed from UUID to basic string
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>
export type BookInput = z.infer<typeof bookSchema>
export type UpdateBookInput = z.infer<typeof updateBookSchema>
export type SearchBooksInput = z.infer<typeof searchBooksSchema>
export type CheckoutInput = z.infer<typeof checkoutSchema>
export type CheckinInput = z.infer<typeof checkinSchema>