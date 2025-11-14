import { NextRequest, NextResponse } from 'next/server'

import { requireAuth } from '@/lib/auth/server'
import type { ApiResponse } from '@/lib/api/types'
import { checkFeatureAccess } from '@/lib/features/server'

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
  const orgId = searchParams.get('orgId')

  if (!featureKey) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Feature key is required' },
      { status: 400 }
    )
  }

  const access = await checkFeatureAccess(featureKey, orgId || undefined)

  return NextResponse.json<ApiResponse>({
    success: true,
    data: access,
  })
}
