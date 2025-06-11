import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

interface ValidationResult<T> {
  data: T | null
  error: NextResponse | null
}

interface ProcessedParams {
  [key: string]: string | number
}

export function validateBody<T>(schema: z.ZodSchema<T>) {
  return async (req: NextRequest): Promise<ValidationResult<T>> => {
    try {
      const body = await req.json()
      const data = schema.parse(body)
      return { data, error: null }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          data: null,
          error: NextResponse.json(
            {
              success: false,
              error: 'Validation error',
              details: error.errors
            },
            { status: 400 }
          )
        }
      }
      return {
        data: null,
        error: NextResponse.json(
          { success: false, error: 'Invalid JSON' },
          { status: 400 }
        )
      }
    }
  }
}

export function validateQuery<T>(schema: z.ZodSchema<T>) {
  return (req: NextRequest): ValidationResult<T> => {
    try {
      const url = new URL(req.url)
      const queryParams = Object.fromEntries(url.searchParams.entries())
      
      // Convert string numbers to actual numbers
      const processedParams = Object.entries(queryParams).reduce((acc, [key, value]) => {
        if (!isNaN(Number(value)) && value !== '') {
          acc[key] = Number(value)
        } else {
          acc[key] = value
        }
        return acc
      }, {} as ProcessedParams)

      const data = schema.parse(processedParams)
      return { data, error: null }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          data: null,
          error: NextResponse.json(
            {
              success: false,
              error: 'Invalid query parameters',
              details: error.errors
            },
            { status: 400 }
          )
        }
      }
      return {
        data: null,
        error: NextResponse.json(
          { success: false, error: 'Invalid query parameters' },
          { status: 400 }
        )
      }
    }
  }
}