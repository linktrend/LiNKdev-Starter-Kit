import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getSession, getUser, requireAuth, requireAdmin, requireSuperAdmin, checkRole } from '@/lib/auth/server'

// Mock Supabase client
const mockGetSession = vi.fn()
const mockFrom = vi.fn()

vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(() => ({
    auth: {
      getSession: mockGetSession,
    },
    from: mockFrom,
  })),
}))

vi.mock('next/headers', () => ({
  cookies: vi.fn(() => ({
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
  })),
}))

describe('Session Utilities - getSession', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return session when available', async () => {
    const mockSession = {
      user: { id: 'user-1', email: 'test@example.com' },
      expires_at: Math.floor(Date.now() / 1000) + 3600,
      access_token: 'token',
    }

    mockGetSession.mockResolvedValue({
      data: { session: mockSession },
      error: null,
    })

    const session = await getSession()

    expect(session).toEqual(mockSession)
  })

  it('should return null when no session', async () => {
    mockGetSession.mockResolvedValue({
      data: { session: null },
      error: null,
    })

    const session = await getSession()

    expect(session).toBe(null)
  })

  it('should return null on error', async () => {
    mockGetSession.mockResolvedValue({
      data: { session: null },
      error: { message: 'Session error' },
    })

    const session = await getSession()

    expect(session).toBe(null)
  })
})

describe('Session Utilities - getUser', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return user from database when session exists', async () => {
    const mockSession = {
      user: { id: 'user-1', email: 'test@example.com' },
      expires_at: Math.floor(Date.now() / 1000) + 3600,
    }

    const mockUserData = {
      id: 'user-1',
      email: 'test@example.com',
      username: 'testuser',
      full_name: 'Test User',
      account_type: 'user',
      onboarding_completed: true,
      profile_completed: true,
    }

    mockGetSession.mockResolvedValue({
      data: { session: mockSession },
      error: null,
    })

    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: mockUserData,
        error: null,
      }),
    })

    const user = await getUser()

    expect(user).toBeTruthy()
    expect(user?.id).toBe('user-1')
    expect(user?.username).toBe('testuser')
  })

  it('should return null when no session', async () => {
    mockGetSession.mockResolvedValue({
      data: { session: null },
      error: null,
    })

    const user = await getUser()

    expect(user).toBe(null)
  })

  it('should return fallback user when database query fails', async () => {
    const mockSession = {
      user: {
        id: 'user-1',
        email: 'test@example.com',
        user_metadata: { full_name: 'Test User' },
        created_at: new Date().toISOString(),
      },
      expires_at: Math.floor(Date.now() / 1000) + 3600,
    }

    mockGetSession.mockResolvedValue({
      data: { session: mockSession },
      error: null,
    })

    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: null,
        error: null,
      }),
    })

    const user = await getUser()

    expect(user).toBeTruthy()
    expect(user?.id).toBe('user-1')
    expect(user?.email).toBe('test@example.com')
    expect(user?.full_name).toBe('Test User')
    expect(user?.onboarding_completed).toBe(null)
  })
})

describe('Session Utilities - requireAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return user when authenticated', async () => {
    const mockSession = {
      user: { id: 'user-1', email: 'test@example.com' },
      expires_at: Math.floor(Date.now() / 1000) + 3600,
    }

    const mockUserData = {
      id: 'user-1',
      email: 'test@example.com',
      account_type: 'user',
      onboarding_completed: true,
    }

    mockGetSession.mockResolvedValue({
      data: { session: mockSession },
      error: null,
    })

    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: mockUserData,
        error: null,
      }),
    })

    const user = await requireAuth()

    expect(user).toBeTruthy()
    expect(user.id).toBe('user-1')
  })

  it('should throw error when not authenticated', async () => {
    mockGetSession.mockResolvedValue({
      data: { session: null },
      error: null,
    })

    await expect(requireAuth()).rejects.toThrow('Unauthorized')
  })
})

describe('Session Utilities - requireAdmin', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return user when user is admin', async () => {
    const mockSession = {
      user: { id: 'user-1', email: 'admin@example.com' },
      expires_at: Math.floor(Date.now() / 1000) + 3600,
    }

    const mockUserData = {
      id: 'user-1',
      email: 'admin@example.com',
      account_type: 'admin',
      onboarding_completed: true,
    }

    mockGetSession.mockResolvedValue({
      data: { session: mockSession },
      error: null,
    })

    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: mockUserData,
        error: null,
      }),
    })

    const user = await requireAdmin()

    expect(user).toBeTruthy()
    expect(user.account_type).toBe('admin')
  })

  it('should return user when user is super_admin', async () => {
    const mockSession = {
      user: { id: 'user-1', email: 'superadmin@example.com' },
      expires_at: Math.floor(Date.now() / 1000) + 3600,
    }

    const mockUserData = {
      id: 'user-1',
      email: 'superadmin@example.com',
      account_type: 'super_admin',
      onboarding_completed: true,
    }

    mockGetSession.mockResolvedValue({
      data: { session: mockSession },
      error: null,
    })

    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: mockUserData,
        error: null,
      }),
    })

    const user = await requireAdmin()

    expect(user).toBeTruthy()
    expect(user.account_type).toBe('super_admin')
  })

  it('should throw error when user is not admin', async () => {
    const mockSession = {
      user: { id: 'user-1', email: 'user@example.com' },
      expires_at: Math.floor(Date.now() / 1000) + 3600,
    }

    const mockUserData = {
      id: 'user-1',
      email: 'user@example.com',
      account_type: 'user',
      onboarding_completed: true,
    }

    mockGetSession.mockResolvedValue({
      data: { session: mockSession },
      error: null,
    })

    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: mockUserData,
        error: null,
      }),
    })

    await expect(requireAdmin()).rejects.toThrow('Forbidden: Admin access required')
  })
})

describe('Session Utilities - requireSuperAdmin', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return user when user is super_admin', async () => {
    const mockSession = {
      user: { id: 'user-1', email: 'superadmin@example.com' },
      expires_at: Math.floor(Date.now() / 1000) + 3600,
    }

    const mockUserData = {
      id: 'user-1',
      email: 'superadmin@example.com',
      account_type: 'super_admin',
      onboarding_completed: true,
    }

    mockGetSession.mockResolvedValue({
      data: { session: mockSession },
      error: null,
    })

    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: mockUserData,
        error: null,
      }),
    })

    const user = await requireSuperAdmin()

    expect(user).toBeTruthy()
    expect(user.account_type).toBe('super_admin')
  })

  it('should throw error when user is admin but not super_admin', async () => {
    const mockSession = {
      user: { id: 'user-1', email: 'admin@example.com' },
      expires_at: Math.floor(Date.now() / 1000) + 3600,
    }

    const mockUserData = {
      id: 'user-1',
      email: 'admin@example.com',
      account_type: 'admin',
      onboarding_completed: true,
    }

    mockGetSession.mockResolvedValue({
      data: { session: mockSession },
      error: null,
    })

    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: mockUserData,
        error: null,
      }),
    })

    await expect(requireSuperAdmin()).rejects.toThrow('Forbidden: Super admin access required')
  })
})

describe('Session Utilities - checkRole', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return true for super_admin checking super_admin role', async () => {
    const mockSession = {
      user: { id: 'user-1', email: 'superadmin@example.com' },
      expires_at: Math.floor(Date.now() / 1000) + 3600,
    }

    const mockUserData = {
      id: 'user-1',
      account_type: 'super_admin',
    }

    mockGetSession.mockResolvedValue({
      data: { session: mockSession },
      error: null,
    })

    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: mockUserData,
        error: null,
      }),
    })

    const hasRole = await checkRole('super_admin')

    expect(hasRole).toBe(true)
  })

  it('should return true for super_admin checking admin role', async () => {
    const mockSession = {
      user: { id: 'user-1', email: 'superadmin@example.com' },
      expires_at: Math.floor(Date.now() / 1000) + 3600,
    }

    const mockUserData = {
      id: 'user-1',
      account_type: 'super_admin',
    }

    mockGetSession.mockResolvedValue({
      data: { session: mockSession },
      error: null,
    })

    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: mockUserData,
        error: null,
      }),
    })

    const hasRole = await checkRole('admin')

    expect(hasRole).toBe(true)
  })

  it('should return false when no user', async () => {
    mockGetSession.mockResolvedValue({
      data: { session: null },
      error: null,
    })

    const hasRole = await checkRole('user')

    expect(hasRole).toBe(false)
  })
})
