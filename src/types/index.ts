// Re-export all types from database
export * from './database'

// Additional utility types
export type UserRole = 'librarian' | 'reader'
export type BookGenre = 'fiction' | 'non_fiction' | 'science' | 'history' | 'biography' | 'mystery' | 'romance' | 'fantasy' | 'thriller' | 'self_help' | 'children' | 'other'
export type ModalMode = 'view' | 'add' | 'edit'