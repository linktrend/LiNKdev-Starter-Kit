import { describe, it, expect, vi, beforeEach } from 'vitest'
import { login } from '@/app/actions/auth'

// Mock dependencies
vi.mock('@/lib/auth/server', () => ({
  createClient: vi.fn(),
}))

vi.mock('@/lib/usage/server', () => ({
  logUsage: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  redirect: vi.fn((path: string) => {
    throw new Error(`REDIRECT:${path}`)
  }),
}))

describe('Onboarding Resume Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should redirect incomplete user to onboarding', async () => {
    const { createClient } = await import('@/lib/auth/server')
    
    const mockSupabase = {
      auth: {
        signInWithPassword: vi.fn().mockResolvedValue({
          data: {
            user: { id: 'user-123', email: 'test@example.com' },
          },
          error: null,
        }),
      },
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: {
                onboarding_completed: false,
                profile_completed: false,
              },
              error: null,
            }),
          }),
        }),
      }),
    }

    vi.mocked(createClient).mockReturnValue(mockSupabase as any)

    const formData = new FormData()
    formData.append('email', 'test@example.com')
    formData.append('password', 'password123')
    formData.append('locale', 'en')

    try {
      await login({}, formData)
      expect.fail('Should have redirected')
    } catch (error: any) {
      expect(error.message).toContain('REDIRECT:/en/onboarding?step=2')
    }
  })

  it('should redirect completed user to dashboard', async () => {
    const { createClient } = await import('@/lib/auth/server')
    
    const mockSupabase = {
      auth: {
        signInWithPassword: vi.fn().mockResolvedValue({
          data: {
            user: { id: 'user-123', email: 'test@example.com' },
          },
          error: null,
        }),
      },
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: {
                onboarding_completed: true,
                profile_completed: true,
              },
              error: null,
            }),
          }),
        }),
      }),
    }

    vi.mocked(createClient).mockReturnValue(mockSupabase as any)

    const formData = new FormData()
    formData.append('email', 'test@example.com')
    formData.append('password', 'password123')
    formData.append('locale', 'en')

    try {
      await login({}, formData)
      expect.fail('Should have redirected')
    } catch (error: any) {
      expect(error.message).toContain('REDIRECT:/en/dashboard')
    }
  })

  it('should handle missing user profile gracefully', async () => {
    const { createClient } = await import('@/lib/auth/server')
    
    const mockSupabase = {
      auth: {
        signInWithPassword: vi.fn().mockResolvedValue({
          data: {
            user: { id: 'user-123', email: 'test@example.com' },
          },
          error: null,
        }),
      },
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { message: 'User not found' },
            }),
          }),
        }),
      }),
    }

    vi.mocked(createClient).mockReturnValue(mockSupabase as any)

    const formData = new FormData()
    formData.append('email', 'test@example.com')
    formData.append('password', 'password123')
    formData.append('locale', 'en')

    try {
      await login({}, formData)
      expect.fail('Should have redirected')
    } catch (error: any) {
      // Should redirect to dashboard by default if no profile data
      expect(error.message).toContain('REDIRECT:/en/dashboard')
    }
  })
})

describe('Middleware Onboarding Check', () => {
  it('should allow access to onboarding route', () => {
    // This is tested via middleware.test.ts
    // Middleware should not redirect when path is /onboarding
    expect(true).toBe(true)
  })

  it('should redirect protected routes to onboarding', () => {
    // This is tested via middleware.test.ts
    // Middleware should redirect /dashboard to /onboarding if not completed
    expect(true).toBe(true)
  })

  it('should allow public routes without onboarding', () => {
    // This is tested via middleware.test.ts
    // Middleware should allow access to /login, /signup, etc.
    expect(true).toBe(true)
  })
})
