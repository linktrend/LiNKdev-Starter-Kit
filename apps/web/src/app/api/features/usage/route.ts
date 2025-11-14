import { NextRequest, NextResponse } from 'next/server'

import { requireAuth } from '@/lib/auth/server'
import type { ApiResponse } from '@/lib/api/types'
import { checkUsageLimit } from '@/lib/features/server'

export async function GET(req: NextRequest) {
  try {
    await requireAuth()
  } catch {
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    )
  }

  const { searchParams } = new URL(req.url)
  const featureKey = searchParams.get('feature')
  const usage = searchParams.get('usage')
  const orgId = searchParams.get('orgId')

  if (!featureKey || !usage) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Feature key and usage are required' },
      { status: 400 }
    )
  }

  const currentUsage = parseInt(usage, 10)
  if (Number.isNaN(currentUsage)) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Invalid usage value' },
      { status: 400 }
    )
  }

  const result = await checkUsageLimit(featureKey, currentUsage, orgId || undefined)

  return NextResponse.json<ApiResponse>({
    success: true,
    data: result,
  })
}
