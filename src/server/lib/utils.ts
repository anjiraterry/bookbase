import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Date utilities
export function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

export function formatDateShort(date: string | Date) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

// Calculate days between dates
export function daysBetween(date1: Date | string, date2: Date | string) {
  const d1 = new Date(date1)
  const d2 = new Date(date2)
  const diffTime = Math.abs(d2.getTime() - d1.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

// Check if a book is overdue
export function isOverdue(dueDate: string | Date) {
  const due = new Date(dueDate)
  const today = new Date()
  return due < today
}

// Calculate due date (10 days from checkout)
export function calculateDueDate(checkoutDate: Date | string = new Date()) {
  const checkout = new Date(checkoutDate)
  checkout.setDate(checkout.getDate() + 10)
  return checkout
}

// String utilities
export function truncateText(text: string, maxLength: number) {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

// Validation utilities
export function isValidEmail(email: string) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function isValidISBN(isbn: string) {
  // Remove hyphens and spaces
  const cleanISBN = isbn.replace(/[-\s]/g, '')
  
  // Check if it's 10 or 13 digits
  if (!/^\d{10}$/.test(cleanISBN) && !/^\d{13}$/.test(cleanISBN)) {
    return false
  }
  
  return true
}