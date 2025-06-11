import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type')

  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    
    if (type === 'due-soon') {
      const response = await fetch(`${baseUrl}/api/cron/due-soon`)
      const data = await response.json()
      return NextResponse.json(data)
    } else if (type === 'overdue') {
      const response = await fetch(`${baseUrl}/api/cron/overdue`)
      const data = await response.json()
      return NextResponse.json(data)
    } else {
      return NextResponse.json({ 
        error: 'Invalid type. Use ?type=due-soon or ?type=overdue',
        examples: [
          `${baseUrl}/api/cron/test?type=due-soon`,
          `${baseUrl}/api/cron/test?type=overdue`
        ]
      })
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}