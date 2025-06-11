export interface User {
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
  }
  
  export interface Book {
    id: string
    title: string
    isbn: string
    revision_number?: string
    published_date?: string
    publisher?: string
    authors: string[]
    genre?: string
    cover_image_url?: string
    description?: string
    total_copies: number
    available_copies: number
    date_added_to_library: string
    created_at: string
    updated_at: string
    added_by: string
  }
  
  export interface Checkout {
    id: string
    book_id: string
    user_id: string
    checkout_date: string
    expected_return_date: string
    actual_return_date?: string
    overdue_notification_sent: boolean
    librarian_notification_sent: boolean
    is_returned: boolean
    is_overdue: boolean
    created_at: string
    updated_at: string
  }