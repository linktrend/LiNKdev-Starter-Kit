import { NextRequest, NextResponse } from 'next/server'

import { createClient } from '@/lib/auth/server'
import { strictRateLimiter } from '@/lib/api/rate-limit'
import type { ApiResponse, AvailabilityResponse } from '@/lib/api/types'
import { usernameSchema } from '@/lib/validation/profile'

export async function GET(req: NextRequest) {
  const rateLimitResult = strictRateLimiter(req)

  if (!rateLimitResult.success) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: rateLimitResult.error },
      {
        status: 429,
        headers: { 'Retry-After': String(rateLimitResult.retryAfter) },
      }
    )
  }

  const { searchParams } = new URL(req.url)
  const username = searchParams.get('username')

  if (!username) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Username parameter is required' },
      { status: 400 }
    )
  }

  const validation = usernameSchema.safeParse(username)
  if (!validation.success) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: validation.error.errors[0]?.message },
      { status: 400 }
    )
  }

  const normalizedUsername = validation.data
  const supabase = createClient()

  const { data, error } = await supabase
    .from('users')
    .select('username')
    .eq('username', normalizedUsername)
    .maybeSingle()

  if (error) {
    console.error('Error checking username:', error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }

  const available = !data
  const suggestions: string[] = []

  if (!available) {
    for (let i = 1; i <= 3; i += 1) {
      suggestions.push(`${normalizedUsername}${Math.floor(Math.random() * 1000)}`)
    }
  }

  return NextResponse.json<ApiResponse<AvailabilityResponse>>({
    success: true,
    data: {
      available,
      suggestions: available ? undefined : suggestions,
    },
  })
}
