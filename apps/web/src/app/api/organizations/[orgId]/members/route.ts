import { NextRequest, NextResponse } from 'next/server'

import { createClient, requireAuth } from '@/lib/auth/server'
import { defaultRateLimiter } from '@/lib/api/rate-limit'
import type { ApiResponse } from '@/lib/api/types'

export async function GET(
  req: NextRequest,
  { params }: { params: { orgId: string } }
) {
  let currentUser
  try {
    currentUser = await requireAuth()
  } catch {
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    )
  }

  const rateLimitResult = defaultRateLimiter(req)
  if (!rateLimitResult.success) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: rateLimitResult.error },
      { status: 429 }
    )
  }

  const { orgId } = params
  const supabase = createClient()

  const { data: membership, error: membershipError } = await supabase
    .from('organization_members')
    .select('role')
    .eq('org_id', orgId)
    .eq('user_id', currentUser.id)
    .maybeSingle()

  if (membershipError) {
    console.error('Error verifying organization membership:', membershipError)
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }

  if (!membership) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Forbidden' },
      { status: 403 }
    )
  }

  const { data, error } = await supabase
    .from('organization_members')
    .select(
      `
      role,
      joined_at,
      users (
        id,
        username,
        email,
        full_name,
        avatar_url
      )
    `
    )
    .eq('org_id', orgId)
    .order('joined_at', { ascending: true })

  if (error) {
    console.error('Error fetching members:', error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }

  return NextResponse.json<ApiResponse>({
    success: true,
    data: data || [],
  })
}
