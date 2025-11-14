import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { createClient } from '@/lib/auth/server'
import { strictRateLimiter } from '@/lib/api/rate-limit'
import type { ApiResponse, AvailabilityResponse } from '@/lib/api/types'

const slugSchema = z
  .string()
  .min(3)
  .max(50)
  .regex(/^[a-z0-9-]+$/)

export async function GET(req: NextRequest) {
  const rateLimitResult = strictRateLimiter(req)
  if (!rateLimitResult.success) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: rateLimitResult.error },
      { status: 429 }
    )
  }

  const { searchParams } = new URL(req.url)
  const slug = searchParams.get('slug')

  if (!slug) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Slug parameter is required' },
      { status: 400 }
    )
  }

  const validation = slugSchema.safeParse(slug)
  if (!validation.success) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: validation.error.errors[0]?.message },
      { status: 400 }
    )
  }

  const supabase = createClient()

  const { data, error } = await supabase
    .from('organizations')
    .select('slug')
    .eq('slug', validation.data)
    .maybeSingle()

  if (error) {
    console.error('Error checking slug:', error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }

  const available = !data
  const suggestions: string[] = []
  if (!available) {
    for (let i = 1; i <= 3; i += 1) {
      suggestions.push(`${validation.data}-${Math.floor(Math.random() * 1000)}`)
    }
  }

  return NextResponse.json<ApiResponse<AvailabilityResponse>>({
    success: true,
    data: { available, suggestions: available ? undefined : suggestions },
  })
}
