import { NextResponse } from 'next/server'

import { requireAuth } from '@/lib/auth/server'
import { logUsage } from '@/lib/usage/server'

interface AiUsagePayload {
  tokensUsed: number
  orgId?: string
  metadata?: Record<string, any>
}

export async function POST(request: Request) {
  const user = await requireAuth()
  const body = (await request.json()) as AiUsagePayload
  const tokensUsed = Number(body.tokensUsed)

  if (!Number.isFinite(tokensUsed) || tokensUsed <= 0) {
    return NextResponse.json(
      { error: 'tokensUsed must be a positive number' },
      { status: 400 }
    )
  }

  logUsage({
    userId: user.id,
    orgId: body.orgId,
    eventType: 'ai_tokens_used',
    quantity: Math.round(tokensUsed),
    metadata: {
      ...body.metadata,
      source: body.metadata?.source ?? 'ai_assistant',
    },
  }).catch(() => {
    // best-effort logging
  })

  return NextResponse.json({ success: true })
}
