import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'

// Mock next-intl middleware
vi.mock('next-intl/middleware', () => ({
  default: vi.fn(() => vi.fn(() => NextResponse.next())),
}))

// Mock Supabase SSR
const mockGetSession = vi.fn()
const mockRefreshSession = vi.fn()
const mockSignOut = vi.fn()
const mockFrom = vi.fn()

vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(() => ({
    auth: {
      getSession: mockGetSession,
      refreshSession: mockRefreshSession,
      signOut: mockSignOut,
    },
    from: mockFrom,
  })),
}))

// Mock i18n routing
vi.mock('../../i18n/routing', () => ({
  routing: {
    locales: ['en', 'es'],
    defaultLocale: 'en',
  },
}))

describe('Middleware - Token Refresh', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key'
  })

  it('should refresh token when expiring within 5 minutes', async () => {
    const now = Math.floor(Date.now() / 1000)
    const expiresAt = now + 240 // 4 minutes from now

    mockGetSession.mockResolvedValue({
      data: {
        session: {
          user: { id: 'user-1' },
          expires_at: expiresAt,
        },
      },
    })

    mockRefreshSession.mockResolvedValue({
      data: {
        session: {
          user: { id: 'user-1' },
          expires_at: now + 3600,
        },
      },
      error: null,
    })

    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: { onboarding_completed: true, account_type: 'user' },
      }),
    })

    const { middleware } = await import('../../middleware')
    const request = new NextRequest(new URL('http://localhost:3000/en/dashboard'))

    await middleware(request)

    expect(mockRefreshSession).toHaveBeenCalled()
  })

  it('should not refresh token when more than 5 minutes until expiry', async () => {
    const now = Math.floor(Date.now() / 1000)
    const expiresAt = now + 600 // 10 minutes from now

    mockGetSession.mockResolvedValue({
      data: {
        session: {
          user: { id: 'user-1' },
          expires_at: expiresAt,
        },
      },
    })

    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: { onboarding_completed: true, account_type: 'user' },
      }),
    })

    const { middleware } = await import('../../middleware')
    const request = new NextRequest(new URL('http://localhost:3000/en/dashboard'))

    await middleware(request)

    expect(mockRefreshSession).not.toHaveBeenCalled()
  })

  it('should clear session on refresh failure', async () => {
    const now = Math.floor(Date.now() / 1000)
    const expiresAt = now + 240 // 4 minutes from now

    mockGetSession.mockResolvedValue({
      data: {
        session: {
          user: { id: 'user-1' },
          expires_at: expiresAt,
        },
      },
    })

    mockRefreshSession.mockResolvedValue({
      data: { session: null },
      error: { message: 'Refresh failed' },
    })

    const { middleware } = await import('../../middleware')
    const request = new NextRequest(new URL('http://localhost:3000/en/dashboard'))

    await middleware(request)

    expect(mockSignOut).toHaveBeenCalled()
  })
})

describe('Middleware - Route Protection', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key'
  })

  it('should protect /dashboard route without session', async () => {
    mockGetSession.mockResolvedValue({
      data: { session: null },
    })

    const { middleware } = await import('../../middleware')
    const request = new NextRequest(new URL('http://localhost:3000/en/dashboard'))

    const response = await middleware(request)

    expect(response.status).toBe(307) // Redirect
    expect(response.headers.get('location')).toContain('/login')
    expect(response.headers.get('location')).toContain('redirect=')
  })

  it('should protect /org route without session', async () => {
    mockGetSession.mockResolvedValue({
      data: { session: null },
    })

    const { middleware } = await import('../../middleware')
    const request = new NextRequest(new URL('http://localhost:3000/en/org/test-org'))

    const response = await middleware(request)

    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toContain('/login')
  })

  it('should protect /settings route without session', async () => {
    mockGetSession.mockResolvedValue({
      data: { session: null },
    })

    const { middleware } = await import('../../middleware')
    const request = new NextRequest(new URL('http://localhost:3000/en/settings'))

    const response = await middleware(request)

    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toContain('/login')
  })

  it('should allow public routes without session', async () => {
    mockGetSession.mockResolvedValue({
      data: { session: null },
    })

    const { middleware } = await import('../../middleware')
    const publicRoutes = [
      'http://localhost:3000/en/',
      'http://localhost:3000/en/login',
      'http://localhost:3000/en/signup',
      'http://localhost:3000/en/forgot-password',
    ]

    for (const url of publicRoutes) {
      const request = new NextRequest(new URL(url))
      const response = await middleware(request)
      expect(response.status).not.toBe(307)
    }
  })

  it('should redirect authenticated users from /login to /dashboard', async () => {
    const now = Math.floor(Date.now() / 1000)

    mockGetSession.mockResolvedValue({
      data: {
        session: {
          user: { id: 'user-1' },
          expires_at: now + 3600,
        },
      },
    })

    const { middleware } = await import('../../middleware')
    const request = new NextRequest(new URL('http://localhost:3000/en/login'))

    const response = await middleware(request)

    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toContain('/dashboard')
  })

  it('should redirect authenticated users from /signup to /dashboard', async () => {
    const now = Math.floor(Date.now() / 1000)

    mockGetSession.mockResolvedValue({
      data: {
        session: {
          user: { id: 'user-1' },
          expires_at: now + 3600,
        },
      },
    })

    const { middleware } = await import('../../middleware')
    const request = new NextRequest(new URL('http://localhost:3000/en/signup'))

    const response = await middleware(request)

    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toContain('/dashboard')
  })
})

describe('Middleware - Onboarding Redirect', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key'
  })

  it('should redirect to /onboarding if onboarding_completed is false', async () => {
    const now = Math.floor(Date.now() / 1000)

    mockGetSession.mockResolvedValue({
      data: {
        session: {
          user: { id: 'user-1' },
          expires_at: now + 3600,
        },
      },
    })

    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: { onboarding_completed: false, account_type: 'user' },
      }),
    })

    const { middleware } = await import('../../middleware')
    const request = new NextRequest(new URL('http://localhost:3000/en/dashboard'))

    const response = await middleware(request)

    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toContain('/onboarding')
  })

  it('should allow access if onboarding_completed is true', async () => {
    const now = Math.floor(Date.now() / 1000)

    mockGetSession.mockResolvedValue({
      data: {
        session: {
          user: { id: 'user-1' },
          expires_at: now + 3600,
        },
      },
    })

    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: { onboarding_completed: true, account_type: 'user' },
      }),
    })

    const { middleware } = await import('../../middleware')
    const request = new NextRequest(new URL('http://localhost:3000/en/dashboard'))

    const response = await middleware(request)

    expect(response.status).not.toBe(307)
  })

  it('should not redirect from /onboarding to /onboarding', async () => {
    const now = Math.floor(Date.now() / 1000)

    mockGetSession.mockResolvedValue({
      data: {
        session: {
          user: { id: 'user-1' },
          expires_at: now + 3600,
        },
      },
    })

    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: { onboarding_completed: false, account_type: 'user' },
      }),
    })

    const { middleware } = await import('../../middleware')
    const request = new NextRequest(new URL('http://localhost:3000/en/onboarding'))

    const response = await middleware(request)

    expect(response.status).not.toBe(307)
  })
})

describe('Middleware - Console Admin Check', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key'
  })

  it('should allow admin users to access /console', async () => {
    const now = Math.floor(Date.now() / 1000)

    mockGetSession.mockResolvedValue({
      data: {
        session: {
          user: { id: 'user-1' },
          expires_at: now + 3600,
        },
      },
    })

    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: { onboarding_completed: true, account_type: 'admin' },
      }),
    })

    const { middleware } = await import('../../middleware')
    const request = new NextRequest(new URL('http://localhost:3000/en/console'))

    const response = await middleware(request)

    expect(response.status).not.toBe(307)
  })

  it('should redirect non-admin users from /console to /dashboard', async () => {
    const now = Math.floor(Date.now() / 1000)

    mockGetSession.mockResolvedValue({
      data: {
        session: {
          user: { id: 'user-1' },
          expires_at: now + 3600,
        },
      },
    })

    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: { onboarding_completed: true, account_type: 'user' },
      }),
    })

    const { middleware } = await import('../../middleware')
    const request = new NextRequest(new URL('http://localhost:3000/en/console'))

    const response = await middleware(request)

    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toContain('/dashboard')
  })
})
