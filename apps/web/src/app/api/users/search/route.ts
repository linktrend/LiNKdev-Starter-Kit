import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { createClient, requireAuth } from '@/lib/auth/server'
import { defaultRateLimiter } from '@/lib/api/rate-limit'
import type { ApiResponse } from '@/lib/api/types'

const searchQuerySchema = z.object({
  q: z.string().min(2).max(50),
  limit: z.coerce.number().min(1).max(20).default(10),
})

export async function GET(req: NextRequest) {
  try {
    await requireAuth()
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

  const { searchParams } = new URL(req.url)
  const validation = searchQuerySchema.safeParse({
    q: searchParams.get('q'),
    limit: searchParams.get('limit'),
  })

  if (!validation.success) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: validation.error.errors[0]?.message },
      { status: 400 }
    )
  }

  const { q, limit } = validation.data
  const supabase = createClient()

  const { data, error } = await supabase
    .from('users')
    .select('id, username, email, full_name, avatar_url')
    .or(`username.ilike.%${q}%,email.ilike.%${q}%,full_name.ilike.%${q}%`)
    .limit(limit)

  if (error) {
    console.error('Error searching users:', error)
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
