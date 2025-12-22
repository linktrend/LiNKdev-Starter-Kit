import { describe, it, expect, vi, beforeEach } from 'vitest'
import { completeOnboardingStep2 } from '@/app/actions/profile'
import { createPersonalOrganization } from '@/app/actions/onboarding'

// Mock dependencies
vi.mock('@/lib/auth/server', () => ({
  requireAuth: vi.fn(),
  createClient: vi.fn(),
}))

vi.mock('@/utils/onboarding', () => ({
  generateUniqueSlug: vi.fn(),
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

describe('End-to-End Onboarding Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should complete full onboarding flow', async () => {
    const { requireAuth, createClient } = await import('@/lib/auth/server')
    const { generateUniqueSlug } = await import('@/utils/onboarding')
    
    let profileUpdated = false
    let orgCreated = false
    let membershipCreated = false
    let subscriptionCreated = false
    let onboardingCompleted = false
    
    const mockSupabase = {
      from: vi.fn((table: string) => {
        if (table === 'users') {
          return {
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
            update: vi.fn((data) => {
              if (data.profile_completed) {
                profileUpdated = true
              }
              if (data.onboarding_completed) {
                onboardingCompleted = true
              }
              return {
                eq: vi.fn().mockResolvedValue({
                  data: null,
                  error: null,
                }),
              }
            }),
          }
        }
        if (table === 'organizations') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  maybeSingle: vi.fn().mockResolvedValue({
                    data: null,
                    error: null,
                  }),
                }),
              }),
            }),
            insert: vi.fn((data) => {
              orgCreated = true
              expect(data.is_personal).toBe(true)
              expect(data.org_type).toBe('personal')
              return {
                select: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: { id: 'org-123', ...data },
                    error: null,
                  }),
                }),
              }
            }),
          }
        }
        if (table === 'organization_members') {
          return {
            insert: vi.fn((data) => {
              membershipCreated = true
              expect(data.role).toBe('owner')
              return Promise.resolve({ error: null })
            }),
          }
        }
        if (table === 'org_subscriptions') {
          return {
            insert: vi.fn((data) => {
              subscriptionCreated = true
              expect(data.plan_name).toBe('free')
              return Promise.resolve({ error: null })
            }),
          }
        }
        return {}
      }),
    }

    vi.mocked(requireAuth).mockResolvedValue({
      id: 'user-123',
      username: 'johndoe',
      email: 'test@example.com',
      full_name: 'John Doe',
    } as any)
    
    vi.mocked(createClient).mockReturnValue(mockSupabase as any)
    vi.mocked(generateUniqueSlug).mockResolvedValue('johndoe-workspace')

    // Step 1: Complete profile
    const formData = new FormData()
    formData.append('username', 'johndoe')
    formData.append('first_name', 'John')
    formData.append('last_name', 'Doe')
    formData.append('display_name', 'John D.')
    formData.append('locale', 'en')

    const result = await completeOnboardingStep2(formData)

    // Verify all steps completed
    expect(result.success).toBe(true)
    expect(result.redirectTo).toBe('/en/dashboard')
    expect(profileUpdated).toBe(true)
    expect(orgCreated).toBe(true)
    expect(membershipCreated).toBe(true)
    expect(subscriptionCreated).toBe(true)
    expect(onboardingCompleted).toBe(true)
  })

  it('should set all required flags correctly', async () => {
    const { requireAuth, createClient } = await import('@/lib/auth/server')
    const { generateUniqueSlug } = await import('@/utils/onboarding')
    
    let profileCompletedFlag = false
    let onboardingCompletedFlag = false
    
    const mockSupabase = {
      from: vi.fn((table: string) => {
        if (table === 'users') {
          return {
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
            update: vi.fn((data) => {
              if (data.profile_completed === true) {
                profileCompletedFlag = true
              }
              if (data.onboarding_completed === true) {
                onboardingCompletedFlag = true
              }
              return {
                eq: vi.fn().mockResolvedValue({
                  data: null,
                  error: null,
                }),
              }
            }),
          }
        }
        if (table === 'organizations') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  maybeSingle: vi.fn().mockResolvedValue({
                    data: null,
                    error: null,
                  }),
                }),
              }),
            }),
            insert: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: { id: 'org-123' },
                  error: null,
                }),
              }),
            }),
          }
        }
        if (table === 'organization_members') {
          return {
            insert: vi.fn().mockResolvedValue({ error: null }),
          }
        }
        if (table === 'org_subscriptions') {
          return {
            insert: vi.fn().mockResolvedValue({ error: null }),
          }
        }
        return {}
      }),
    }

    vi.mocked(requireAuth).mockResolvedValue({
      id: 'user-123',
      username: 'johndoe',
    } as any)
    
    vi.mocked(createClient).mockReturnValue(mockSupabase as any)
    vi.mocked(generateUniqueSlug).mockResolvedValue('johndoe-workspace')

    const formData = new FormData()
    formData.append('username', 'johndoe')
    formData.append('first_name', 'John')
    formData.append('last_name', 'Doe')
    formData.append('locale', 'en')

    await completeOnboardingStep2(formData)

    expect(profileCompletedFlag).toBe(true)
    expect(onboardingCompletedFlag).toBe(true)
  })

  it('should not create orphaned records on failure', async () => {
    const { requireAuth, createClient } = await import('@/lib/auth/server')
    const { generateUniqueSlug } = await import('@/utils/onboarding')
    
    let orgDeleted = false
    
    const mockSupabase = {
      from: vi.fn((table: string) => {
        if (table === 'users') {
          return {
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
          }
        }
        if (table === 'organizations') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  maybeSingle: vi.fn().mockResolvedValue({
                    data: null,
                    error: null,
                  }),
                }),
              }),
            }),
            insert: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: { id: 'org-123' },
                  error: null,
                }),
              }),
            }),
            delete: vi.fn().mockReturnValue({
              eq: vi.fn(() => {
                orgDeleted = true
                return Promise.resolve({ error: null })
              }),
            }),
          }
        }
        if (table === 'organization_members') {
          return {
            insert: vi.fn().mockResolvedValue({
              error: { message: 'Failed to add member' },
            }),
          }
        }
        return {}
      }),
    }

    vi.mocked(requireAuth).mockResolvedValue({
      id: 'user-123',
      username: 'johndoe',
    } as any)
    
    vi.mocked(createClient).mockReturnValue(mockSupabase as any)
    vi.mocked(generateUniqueSlug).mockResolvedValue('johndoe-workspace')

    const formData = new FormData()
    formData.append('username', 'johndoe')
    formData.append('first_name', 'John')
    formData.append('last_name', 'Doe')
    formData.append('locale', 'en')

    const result = await completeOnboardingStep2(formData)

    expect(result.error).toBeDefined()
    expect(orgDeleted).toBe(true)
  })

  it('should handle idempotent operations', async () => {
    const { requireAuth, createClient } = await import('@/lib/auth/server')
    
    const mockSupabase = {
      from: vi.fn((table: string) => {
        if (table === 'organizations') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  maybeSingle: vi.fn().mockResolvedValue({
                    data: { id: 'existing-org-123' },
                    error: null,
                  }),
                }),
              }),
            }),
          }
        }
        return {}
      }),
    }

    vi.mocked(requireAuth).mockResolvedValue({
      id: 'user-123',
      username: 'johndoe',
    } as any)
    
    vi.mocked(createClient).mockReturnValue(mockSupabase as any)

    // Call twice - should return existing org
    const result1 = await createPersonalOrganization()
    const result2 = await createPersonalOrganization()

    expect(result1.success).toBe(true)
    expect(result2.success).toBe(true)
    expect(result1.organization?.id).toBe('existing-org-123')
    expect(result2.organization?.id).toBe('existing-org-123')
  })
})
