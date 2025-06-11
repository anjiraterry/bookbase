import { Book, User, Checkout } from '../../types/database'

export const mockBooks: Book[] = [
  {
    id: '1',
    title: 'The Psychology of Money',
    isbn: '978-0857197689',
    authors: ['Morgan Housel'],
    publisher: 'Harriman House',
    published_date: '2020-09-08',
    genre: 'self_help',
    description: 'Timeless lessons on wealth, greed, and happiness. Doing well with money isn\'t necessarily about what you know. It\'s about how you behave.',
    total_copies: 5,
    available_copies: 3,
    revision_number: '1st Edition',
    cover_image_url: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=300&h=400&fit=crop',
    date_added_to_library: '2024-01-01T00:00:00Z',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    added_by: 'librarian-1'
  },
  {
    id: '2',
    title: 'Atomic Habits',
    isbn: '978-0735211292',
    authors: ['James Clear'],
    publisher: 'Avery',
    published_date: '2018-10-16',
    genre: 'self_help',
    description: 'An Easy & Proven Way to Build Good Habits & Break Bad Ones. No matter your goals, Atomic Habits offers a proven framework for improving.',
    total_copies: 4,
    available_copies: 2,
    revision_number: '1st Edition',
    cover_image_url: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=400&fit=crop',
    date_added_to_library: '2024-01-02T00:00:00Z',
    created_at: '2024-01-02T00:00:00Z',
    updated_at: '2024-01-02T00:00:00Z',
    added_by: 'librarian-1'
  },
  // Add more mock books as needed
]

export const mockUsers: User[] = [
  {
    id: 'user-1',
    email: 'john.doe@example.com',
    first_name: 'John',
    last_name: 'Doe',
    role: 'reader',
    profile_photo_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    phone: '(555) 123-4567',
    address: '123 Main St, Anytown, ST 12345',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'librarian-1',
    email: 'librarian@library.com',
    first_name: 'Sarah',
    last_name: 'Wilson',
    role: 'librarian',
    profile_photo_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b1e7?w=100&h=100&fit=crop&crop=face',
    phone: '(555) 987-6543',
    address: '456 Library Ave, Booktown, ST 54321',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
]

export const mockCheckouts: Checkout[] = [
  {
    id: 'checkout-1',
    book_id: '1',
    user_id: 'user-1',
    checkout_date: '2024-01-15T00:00:00Z',
    expected_return_date: '2024-01-25T00:00:00Z',
    actual_return_date: undefined,
    is_returned: false,
    is_overdue: false,
    overdue_notification_sent: false,
    librarian_notification_sent: false,
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z'
  }
]