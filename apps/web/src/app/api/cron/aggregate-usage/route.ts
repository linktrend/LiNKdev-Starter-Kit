import { NextRequest, NextResponse } from 'next/server'

import { triggerUsageAggregation } from '@/lib/usage/server'

const CRON_SECRET = process.env.CRON_SECRET

function isAuthorized(request: NextRequest) {
  if (!CRON_SECRET) {
    return true
  }
  const authHeader = request.headers.get('authorization')
  return authHeader === `Bearer ${CRON_SECRET}`
}

function getYesterdayRange() {
  const now = new Date()
  const start = new Date(now)
  start.setDate(start.getDate() - 1)
  start.setHours(0, 0, 0, 0)

  const end = new Date(start)
  end.setHours(23, 59, 59, 999)

  return { start, end }
}

function getLastMonthRange(reference: Date) {
  const start = new Date(reference.getFullYear(), reference.getMonth() - 1, 1, 0, 0, 0, 0)
  const end = new Date(reference.getFullYear(), reference.getMonth(), 0, 23, 59, 59, 999)
  return { start, end }
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const now = new Date()
    const daily = getYesterdayRange()

    await triggerUsageAggregation({
      periodType: 'daily',
      periodStart: daily.start,
      periodEnd: daily.end,
    })

    if (now.getDate() === 1) {
      const monthly = getLastMonthRange(now)
      await triggerUsageAggregation({
        periodType: 'monthly',
        periodStart: monthly.start,
        periodEnd: monthly.end,
      })
    }

    return NextResponse.json({
      success: true,
      timestamp: now.toISOString(),
    })
  } catch (error) {
    console.error('Aggregation cron error', error)
    return NextResponse.json({ error: 'Aggregation failed' }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
