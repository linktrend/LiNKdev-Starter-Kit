import { NextResponse } from 'next/server'

import { getHealthStatus } from '@/app/actions/health'

export async function GET() {
  try {
    const payload = await getHealthStatus()
    return NextResponse.json(payload, { status: 200 })
  } catch (error) {
    console.error('Health API failed', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch health status',
      },
      { status: 500 }
    )
  }
}
