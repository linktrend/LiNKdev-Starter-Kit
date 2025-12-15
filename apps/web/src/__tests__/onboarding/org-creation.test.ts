import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createPersonalOrganization } from '@/app/actions/onboarding'

// Mock dependencies
vi.mock('@/lib/auth/server', () => ({
  requireAuth: vi.fn(),
  createClient: vi.fn(),
}))

vi.mock('@/utils/onboarding', () => ({
  generateUniqueSlug: vi.fn(),
}))

describe('Personal Organization Creation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should create org with correct fields', async () => {
    const { requireAuth, createClient } = await import('@/lib/auth/server')
    const { generateUniqueSlug } = await import('@/utils/onboarding')
    
    const mockSupabase = {
      from: vi.fn((table: string) => {
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
              expect(data.is_personal).toBe(true)
              expect(data.org_type).toBe('personal')
              expect(data.owner_id).toBe('user-123')
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
              expect(data.role).toBe('owner')
              expect(data.user_id).toBe('user-123')
              return Promise.resolve({ error: null })
            }),
          }
        }
        if (table === 'org_subscriptions') {
          return {
            insert: vi.fn((data) => {
              expect(data.plan_name).toBe('free')
              expect(data.status).toBe('active')
              expect(data.seats).toBe(1)
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
      full_name: 'John Doe',
    } as any)
    
    vi.mocked(createClient).mockReturnValue(mockSupabase as any)
    vi.mocked(generateUniqueSlug).mockResolvedValue('johndoe-workspace')

    const result = await createPersonalOrganization()

    expect(result.success).toBe(true)
    expect(result.organization).toBeDefined()
  })

  it('should add user as owner in organization_members', async () => {
    const { requireAuth, createClient } = await import('@/lib/auth/server')
    const { generateUniqueSlug } = await import('@/utils/onboarding')
    
    let memberInsertCalled = false
    
    const mockSupabase = {
      from: vi.fn((table: string) => {
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
            insert: vi.fn((data) => {
              memberInsertCalled = true
              expect(data.org_id).toBe('org-123')
              expect(data.user_id).toBe('user-123')
              expect(data.role).toBe('owner')
              return Promise.resolve({ error: null })
            }),
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

    await createPersonalOrganization()

    expect(memberInsertCalled).toBe(true)
  })

  it('should enforce slug uniqueness', async () => {
    const { requireAuth, createClient } = await import('@/lib/auth/server')
    const { generateUniqueSlug } = await import('@/utils/onboarding')
    
    const mockSupabase = {
      from: vi.fn((table: string) => {
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
    vi.mocked(generateUniqueSlug).mockResolvedValue('johndoe-workspace-1')

    await createPersonalOrganization()

    expect(generateUniqueSlug).toHaveBeenCalledWith('johndoe')
  })

  it('should rollback on membership failure', async () => {
    const { requireAuth, createClient } = await import('@/lib/auth/server')
    const { generateUniqueSlug } = await import('@/utils/onboarding')
    
    let orgDeleteCalled = false
    
    const mockSupabase = {
      from: vi.fn((table: string) => {
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
              eq: vi.fn((field, value) => {
                if (field === 'id' && value === 'org-123') {
                  orgDeleteCalled = true
                }
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

    const result = await createPersonalOrganization()

    expect(result.error).toBeDefined()
    expect(orgDeleteCalled).toBe(true)
  })

  it('should return existing org if already created', async () => {
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

    const result = await createPersonalOrganization()

    expect(result.success).toBe(true)
    expect(result.organization?.id).toBe('existing-org-123')
  })

  it('should create free subscription for personal org', async () => {
    const { requireAuth, createClient } = await import('@/lib/auth/server')
    const { generateUniqueSlug } = await import('@/utils/onboarding')
    
    let subscriptionCreated = false
    
    const mockSupabase = {
      from: vi.fn((table: string) => {
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
            insert: vi.fn((data) => {
              subscriptionCreated = true
              expect(data.org_id).toBe('org-123')
              expect(data.plan_name).toBe('free')
              expect(data.status).toBe('active')
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
    } as any)
    
    vi.mocked(createClient).mockReturnValue(mockSupabase as any)
    vi.mocked(generateUniqueSlug).mockResolvedValue('johndoe-workspace')

    await createPersonalOrganization()

    expect(subscriptionCreated).toBe(true)
  })
})
