import { describe, it, expect, vi, beforeEach } from 'vitest'
import { completeOnboardingStep2, checkUsernameAvailability } from '@/app/actions/profile'

// Mock dependencies
vi.mock('@/lib/auth/server', () => ({
  requireAuth: vi.fn(),
  createClient: vi.fn(),
}))

vi.mock('@/app/actions/onboarding', () => ({
  createPersonalOrganization: vi.fn(),
}))

describe('Profile Creation - completeOnboardingStep2', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should validate required fields', async () => {
    const { requireAuth, createClient } = await import('@/lib/auth/server')
    
    vi.mocked(requireAuth).mockResolvedValue({
      id: 'user-123',
      email: 'test@example.com',
    } as any)

    const formData = new FormData()
    formData.append('username', '')
    formData.append('first_name', '')
    formData.append('last_name', '')
    formData.append('locale', 'en')

    const result = await completeOnboardingStep2(formData)

    expect(result.error).toBeDefined()
    expect(result.error?.username).toBeDefined()
    expect(result.error?.first_name).toBeDefined()
    expect(result.error?.last_name).toBeDefined()
  })

  it('should reject invalid username format', async () => {
    const { requireAuth } = await import('@/lib/auth/server')
    
    vi.mocked(requireAuth).mockResolvedValue({
      id: 'user-123',
      email: 'test@example.com',
    } as any)

    const formData = new FormData()
    formData.append('username', 'ab') // Too short
    formData.append('first_name', 'John')
    formData.append('last_name', 'Doe')
    formData.append('locale', 'en')

    const result = await completeOnboardingStep2(formData)

    expect(result.error).toBeDefined()
    expect(result.error?.username).toBeDefined()
  })

  it('should reject username with special characters', async () => {
    const { requireAuth } = await import('@/lib/auth/server')
    
    vi.mocked(requireAuth).mockResolvedValue({
      id: 'user-123',
      email: 'test@example.com',
    } as any)

    const formData = new FormData()
    formData.append('username', 'john@doe') // Invalid characters
    formData.append('first_name', 'John')
    formData.append('last_name', 'Doe')
    formData.append('locale', 'en')

    const result = await completeOnboardingStep2(formData)

    expect(result.error).toBeDefined()
    expect(result.error?.username).toBeDefined()
  })

  it('should check username availability', async () => {
    const { requireAuth, createClient } = await import('@/lib/auth/server')
    
    const mockSupabase = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({
              data: { id: 'other-user' },
              error: null,
            }),
          }),
        }),
      }),
    }

    vi.mocked(requireAuth).mockResolvedValue({
      id: 'user-123',
      email: 'test@example.com',
    } as any)
    
    vi.mocked(createClient).mockReturnValue(mockSupabase as any)

    const result = await checkUsernameAvailability('johndoe')

    expect(result.available).toBe(false)
  })

  it('should successfully complete profile with valid data', async () => {
    const { requireAuth, createClient } = await import('@/lib/auth/server')
    const { createPersonalOrganization } = await import('@/app/actions/onboarding')
    
    const mockSupabase = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            neq: vi.fn().mockReturnValue({
              maybeSingle: vi.fn().mockResolvedValue({
                data: null,
                error: null,
              }),
            }),
            maybeSingle: vi.fn().mockResolvedValue({
              data: null,
              error: null,
            }),
          }),
        }),
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: null,
            error: null,
          }),
        }),
      }),
    }

    vi.mocked(requireAuth).mockResolvedValue({
      id: 'user-123',
      email: 'test@example.com',
    } as any)
    
    vi.mocked(createClient).mockReturnValue(mockSupabase as any)
    
    vi.mocked(createPersonalOrganization).mockResolvedValue({
      success: true,
      organization: { id: 'org-123' },
    } as any)

    const formData = new FormData()
    formData.append('username', 'johndoe')
    formData.append('first_name', 'John')
    formData.append('last_name', 'Doe')
    formData.append('display_name', 'John D.')
    formData.append('locale', 'en')

    const result = await completeOnboardingStep2(formData)

    expect(result.success).toBe(true)
    expect(result.redirectTo).toBe('/en/dashboard')
    expect(createPersonalOrganization).toHaveBeenCalled()
  })

  it('should handle org creation failure gracefully', async () => {
    const { requireAuth, createClient } = await import('@/lib/auth/server')
    const { createPersonalOrganization } = await import('@/app/actions/onboarding')
    
    const mockSupabase = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            neq: vi.fn().mockReturnValue({
              maybeSingle: vi.fn().mockResolvedValue({
                data: null,
                error: null,
              }),
            }),
          }),
        }),
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: null,
            error: null,
          }),
        }),
      }),
    }

    vi.mocked(requireAuth).mockResolvedValue({
      id: 'user-123',
      email: 'test@example.com',
    } as any)
    
    vi.mocked(createClient).mockReturnValue(mockSupabase as any)
    
    vi.mocked(createPersonalOrganization).mockResolvedValue({
      error: 'Failed to create organization',
    } as any)

    const formData = new FormData()
    formData.append('username', 'johndoe')
    formData.append('first_name', 'John')
    formData.append('last_name', 'Doe')
    formData.append('locale', 'en')

    const result = await completeOnboardingStep2(formData)

    expect(result.error).toBeDefined()
    expect(result.error?.form).toContain('Failed to create organization')
  })
})

describe('Username Validation', () => {
  it('should enforce minimum length', async () => {
    const result = await checkUsernameAvailability('ab')
    expect(result.available).toBe(false)
    expect(result.error).toContain('at least 3 characters')
  })

  it('should enforce maximum length', async () => {
    const longUsername = 'a'.repeat(31)
    const result = await checkUsernameAvailability(longUsername)
    expect(result.available).toBe(false)
    expect(result.error).toContain('less than 30 characters')
  })

  it('should normalize username to lowercase', async () => {
    const { createClient } = await import('@/lib/auth/server')
    
    const mockSupabase = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn((field, value) => {
            expect(value).toBe('johndoe') // Should be lowercase
            return {
              maybeSingle: vi.fn().mockResolvedValue({
                data: null,
                error: null,
              }),
            }
          }),
        }),
      }),
    }
    
    vi.mocked(createClient).mockReturnValue(mockSupabase as any)

    await checkUsernameAvailability('JohnDoe')
    expect(mockSupabase.from).toHaveBeenCalledWith('users')
  })
})
