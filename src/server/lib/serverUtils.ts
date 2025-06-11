import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET!

interface JwtPayload {
  userId: string
  role: string
  iat?: number
  exp?: number
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function generateToken(userId: string, role: string): string {
  return jwt.sign(
    { userId, role },
    JWT_SECRET,
    { expiresIn: '7d' }
  )
}

export function verifyToken(token: string): { userId: string; role: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload
    return { userId: decoded.userId, role: decoded.role }
  } catch {
    return null
  }
}

export function calculateDueDate(checkoutDate: Date = new Date()): Date {
  const dueDate = new Date(checkoutDate)
  dueDate.setDate(dueDate.getDate() + 10) // 10 days checkout period
  return dueDate
}

export function isOverdue(expectedReturnDate: string): boolean {
  return new Date(expectedReturnDate) < new Date()
}

export function getDaysRemaining(expectedReturnDate: string): number {
  const due = new Date(expectedReturnDate)
  const today = new Date()
  const diffTime = due.getTime() - today.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

export function formatApiResponse<T>(data: T, message?: string) {
  return {
    success: true,
    data,
    message
  }
}

export function formatApiError(error: string, statusCode: number = 400) {
  return {
    success: false,
    error,
    statusCode
  }
}