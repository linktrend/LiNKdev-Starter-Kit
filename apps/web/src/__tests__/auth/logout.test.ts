import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock dependencies - must be before imports
const mockSignOut = vi.fn()

vi.mock('@/lib/auth/server', () => ({
  createClient: vi.fn(() => ({
    auth: {
      signOut: mockSignOut,
    },
  })),
}))

// Import after mocks
import { logout } from '@/app/actions/auth'

vi.mock('@/i18n/routing', () => ({
  routing: {
    locales: ['en', 'es'],
    defaultLocale: 'en',
  },
}))

describe('Logout Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should call signOut on logout', async () => {
    mockSignOut.mockResolvedValue({ error: null })

    const formData = new FormData()
    formData.append('locale', 'en')

    await logout(formData)

    expect(mockSignOut).toHaveBeenCalled()
  })
})
