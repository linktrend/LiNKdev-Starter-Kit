import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useSession } from '@/hooks/useSession'

// Mock Supabase client
const mockGetSession = vi.fn()
const mockRefreshSession = vi.fn()
const mockOnAuthStateChange = vi.fn()

vi.mock('@/lib/auth/client', () => ({
  createClient: vi.fn(() => ({
    auth: {
      getSession: mockGetSession,
      refreshSession: mockRefreshSession,
      onAuthStateChange: mockOnAuthStateChange,
    },
  })),
}))

describe('useSession Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should initialize with loading state', () => {
    mockGetSession.mockResolvedValue({
      data: { session: null },
      error: null,
    })

    mockOnAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    })

    const { result } = renderHook(() => useSession())

    expect(result.current.loading).toBe(true)
    expect(result.current.session).toBe(null)
    expect(result.current.user).toBe(null)
  })

  it('should load session on mount', async () => {
    const mockSession = {
      user: { id: 'user-1', email: 'test@example.com' },
      expires_at: Math.floor(Date.now() / 1000) + 3600,
      access_token: 'token',
      refresh_token: 'refresh',
    }

    mockGetSession.mockResolvedValue({
      data: { session: mockSession },
      error: null,
    })

    mockOnAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    })

    const { result } = renderHook(() => useSession())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    }, { timeout: 10000 })

    expect(result.current.session).toEqual(mockSession)
    expect(result.current.user).toEqual(mockSession.user)
    expect(result.current.error).toBe(null)
  })

  it('should handle session error', async () => {
    const mockError = new Error('Session error')

    mockGetSession.mockResolvedValue({
      data: { session: null },
      error: mockError,
    })

    mockOnAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    })

    const { result } = renderHook(() => useSession())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    }, { timeout: 10000 })

    expect(result.current.error).toBeTruthy()
    expect(result.current.session).toBe(null)
  })

  it('should refresh session when near expiry', async () => {
    const now = Math.floor(Date.now() / 1000)
    const expiresAt = now + 240 // 4 minutes from now

    const mockSession = {
      user: { id: 'user-1', email: 'test@example.com' },
      expires_at: expiresAt,
      access_token: 'token',
      refresh_token: 'refresh',
    }

    mockGetSession.mockResolvedValue({
      data: { session: mockSession },
      error: null,
    })

    mockRefreshSession.mockResolvedValue({
      data: {
        session: {
          ...mockSession,
          expires_at: now + 3600,
        },
      },
      error: null,
    })

    mockOnAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    })

    const { result } = renderHook(() => useSession())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    }, { timeout: 10000 })

    // Should have called refresh on mount due to near expiry
    expect(mockRefreshSession).toHaveBeenCalled()
  })

  it('should not refresh session when not near expiry', async () => {
    const now = Math.floor(Date.now() / 1000)
    const expiresAt = now + 3600 // 1 hour from now

    const mockSession = {
      user: { id: 'user-1', email: 'test@example.com' },
      expires_at: expiresAt,
      access_token: 'token',
      refresh_token: 'refresh',
    }

    mockGetSession.mockResolvedValue({
      data: { session: mockSession },
      error: null,
    })

    mockOnAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    })

    const { result } = renderHook(() => useSession())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    }, { timeout: 10000 })

    // Should not have called refresh on mount
    expect(mockRefreshSession).not.toHaveBeenCalled()
  })

  it('should handle manual refresh', { timeout: 15000 }, async () => {
    const mockSession = {
      user: { id: 'user-1', email: 'test@example.com' },
      expires_at: Math.floor(Date.now() / 1000) + 3600,
      access_token: 'token',
      refresh_token: 'refresh',
    }

    mockGetSession.mockResolvedValue({
      data: { session: mockSession },
      error: null,
    })

    const refreshedSession = {
      ...mockSession,
      access_token: 'new-token',
    }

    mockRefreshSession.mockResolvedValue({
      data: { session: refreshedSession },
      error: null,
    })

    mockOnAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    })

    const { result } = renderHook(() => useSession())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    }, { timeout: 10000 })

    // Call manual refresh
    await act(async () => {
      await result.current.refresh()
    })

    expect(mockRefreshSession).toHaveBeenCalled()
    
    await waitFor(() => {
      expect(result.current.session?.access_token).toBe('new-token')
    }, { timeout: 10000 })
  })

  it('should subscribe to auth state changes', async () => {
    const mockSession = {
      user: { id: 'user-1', email: 'test@example.com' },
      expires_at: Math.floor(Date.now() / 1000) + 3600,
      access_token: 'token',
      refresh_token: 'refresh',
    }

    mockGetSession.mockResolvedValue({
      data: { session: mockSession },
      error: null,
    })

    let authCallback: ((event: string, session: any) => void) | null = null

    mockOnAuthStateChange.mockImplementation((callback) => {
      authCallback = callback
      return {
        data: { subscription: { unsubscribe: vi.fn() } },
      }
    })

    const { result } = renderHook(() => useSession())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    }, { timeout: 10000 })

    // Simulate sign out event
    act(() => {
      if (authCallback) {
        authCallback('SIGNED_OUT', null)
      }
    })

    await waitFor(() => {
      expect(result.current.session).toBe(null)
      expect(result.current.user).toBe(null)
    }, { timeout: 10000 })
  })

  it('should handle refresh error', async () => {
    const mockSession = {
      user: { id: 'user-1', email: 'test@example.com' },
      expires_at: Math.floor(Date.now() / 1000) + 3600,
      access_token: 'token',
      refresh_token: 'refresh',
    }

    mockGetSession.mockResolvedValue({
      data: { session: mockSession },
      error: null,
    })

    const refreshError = new Error('Refresh failed')

    mockRefreshSession.mockResolvedValue({
      data: { session: null },
      error: refreshError,
    })

    mockOnAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    })

    const { result } = renderHook(() => useSession())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    }, { timeout: 10000 })

    // Call manual refresh
    await act(async () => {
      await result.current.refresh()
    })

    await waitFor(() => {
      expect(result.current.error).toBeTruthy()
    }, { timeout: 10000 })
  })

  it('should clear error on successful sign in', async () => {
    mockGetSession.mockResolvedValue({
      data: { session: null },
      error: new Error('Initial error'),
    })

    let authCallback: ((event: string, session: any) => void) | null = null

    mockOnAuthStateChange.mockImplementation((callback) => {
      authCallback = callback
      return {
        data: { subscription: { unsubscribe: vi.fn() } },
      }
    })

    const { result } = renderHook(() => useSession())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    }, { timeout: 10000 })

    expect(result.current.error).toBeTruthy()

    // Simulate sign in event
    const mockSession = {
      user: { id: 'user-1', email: 'test@example.com' },
      expires_at: Math.floor(Date.now() / 1000) + 3600,
      access_token: 'token',
      refresh_token: 'refresh',
    }

    act(() => {
      if (authCallback) {
        authCallback('SIGNED_IN', mockSession)
      }
    })

    await waitFor(() => {
      expect(result.current.error).toBe(null)
      expect(result.current.session).toEqual(mockSession)
    }, { timeout: 10000 })
  })
})
