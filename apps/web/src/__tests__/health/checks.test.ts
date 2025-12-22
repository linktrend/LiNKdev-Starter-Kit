import { beforeEach, describe, expect, it, vi } from 'vitest'

import { checkEdgeFunctions, checkSupabaseAuth, runAllChecks } from '@/lib/health/checks'
import { getHealthStatus } from '@/app/actions/health'

vi.mock('@/env', () => ({
  env: {
    NEXT_PUBLIC_SUPABASE_URL: 'http://localhost:54321',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: 'anon',
    SUPABASE_SERVICE_ROLE_KEY: 'service',
  },
}))

const mockSelect = vi.fn().mockReturnValue({
  limit: vi.fn().mockResolvedValue({ data: [], error: null }),
})
const mockFrom = vi.fn().mockReturnValue({
  select: mockSelect,
})
const mockListBuckets = vi.fn().mockResolvedValue([])
const mockAuthGetSession = vi.fn().mockResolvedValue({ data: { session: null }, error: null })

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    auth: { getSession: mockAuthGetSession },
    from: mockFrom,
    storage: { listBuckets: mockListBuckets },
  })),
}))

const mockStatus = vi.fn().mockResolvedValue({ ok: true })

vi.mock(
  '@starter/api',
  () => ({
    createCaller: vi.fn(() => ({ status: mockStatus })),
  }),
  { virtual: true }
)

vi.mock('@/server/api/trpc', () => ({
  createTRPCContext: vi.fn(async () => ({})),
}))

vi.mock('@/lib/auth/server', () => ({
  requireAdmin: vi.fn(async () => ({ id: 'admin' })),
}))

describe('health checks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('marks Supabase auth as operational when session fetch is fast', async () => {
    const result = await checkSupabaseAuth()
    expect(result.status).toBe('operational')
    expect(result.responseTime).toBeLessThan(200)
    expect(mockAuthGetSession).toHaveBeenCalled()
  })

  it('returns degraded when edge functions are not configured', async () => {
    const result = await checkEdgeFunctions()
    expect(result.status).toBe('degraded')
    expect(result.error).toContain('No edge functions configured')
  })

  it('caches health results for 30 seconds', async () => {
    vi.useFakeTimers()

    const first = await getHealthStatus()
    expect(first.fromCache).toBe(false)

    const second = await getHealthStatus()
    expect(second.fromCache).toBe(true)

    // Advance beyond cache window
    vi.advanceTimersByTime(31_000)
    const third = await getHealthStatus()
    expect(third.fromCache).toBe(false)

    vi.useRealTimers()
  })

  it('runs all checks in parallel and returns five services', async () => {
    const results = await runAllChecks()
    expect(results).toHaveLength(5)
    expect(mockStatus).toHaveBeenCalled()
    expect(mockListBuckets).toHaveBeenCalled()
  })
})
