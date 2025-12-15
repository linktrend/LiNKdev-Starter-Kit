import { describe, it, expect, vi, beforeEach } from 'vitest'
import { logout } from '@/app/actions/auth'

// Mock dependencies
const mockSignOut = vi.fn()
const mockRevalidatePath = vi.fn()
const mockRedirect = vi.fn()

vi.mock('@/lib/auth/server', () => ({
  createClient: vi.fn(() => ({
    auth: {
      signOut: mockSignOut,
    },
  })),
}))

vi.mock('next/cache', () => ({
  revalidatePath: mockRevalidatePath,
}))

vi.mock('next/navigation', () => ({
  redirect: mockRedirect,
}))

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
    mockRedirect.mockImplementation(() => {
      throw new Error('NEXT_REDIRECT')
    })

    const formData = new FormData()
    formData.append('locale', 'en')

    try {
      await logout(formData)
    } catch (error) {
      // Redirect throws error in Next.js
    }

    expect(mockSignOut).toHaveBeenCalled()
  })

  it('should revalidate path on logout', async () => {
    mockSignOut.mockResolvedValue({ error: null })
    mockRedirect.mockImplementation(() => {
      throw new Error('NEXT_REDIRECT')
    })

    const formData = new FormData()
    formData.append('locale', 'en')

    try {
      await logout(formData)
    } catch (error) {
      // Redirect throws error in Next.js
    }

    expect(mockRevalidatePath).toHaveBeenCalledWith('/', 'layout')
  })

  it('should redirect to login with correct locale', async () => {
    mockSignOut.mockResolvedValue({ error: null })
    mockRedirect.mockImplementation((path) => {
      throw new Error(`NEXT_REDIRECT: ${path}`)
    })

    const formData = new FormData()
    formData.append('locale', 'en')

    try {
      await logout(formData)
    } catch (error) {
      expect(error).toBeInstanceOf(Error)
      expect((error as Error).message).toContain('/en/login')
    }

    expect(mockRedirect).toHaveBeenCalledWith('/en/login')
  })

  it('should handle Spanish locale', async () => {
    mockSignOut.mockResolvedValue({ error: null })
    mockRedirect.mockImplementation((path) => {
      throw new Error(`NEXT_REDIRECT: ${path}`)
    })

    const formData = new FormData()
    formData.append('locale', 'es')

    try {
      await logout(formData)
    } catch (error) {
      expect(error).toBeInstanceOf(Error)
      expect((error as Error).message).toContain('/es/login')
    }

    expect(mockRedirect).toHaveBeenCalledWith('/es/login')
  })

  it('should use default locale when no locale provided', async () => {
    mockSignOut.mockResolvedValue({ error: null })
    mockRedirect.mockImplementation((path) => {
      throw new Error(`NEXT_REDIRECT: ${path}`)
    })

    try {
      await logout()
    } catch (error) {
      expect(error).toBeInstanceOf(Error)
      expect((error as Error).message).toContain('/en/login')
    }

    expect(mockRedirect).toHaveBeenCalledWith('/en/login')
  })

  it('should handle invalid locale gracefully', async () => {
    mockSignOut.mockResolvedValue({ error: null })
    mockRedirect.mockImplementation((path) => {
      throw new Error(`NEXT_REDIRECT: ${path}`)
    })

    const formData = new FormData()
    formData.append('locale', 'invalid')

    try {
      await logout(formData)
    } catch (error) {
      expect(error).toBeInstanceOf(Error)
      // Should fall back to default locale
      expect((error as Error).message).toContain('/en/login')
    }

    expect(mockRedirect).toHaveBeenCalledWith('/en/login')
  })

  it('should complete logout even if signOut fails', async () => {
    mockSignOut.mockResolvedValue({ error: { message: 'Sign out error' } })
    mockRedirect.mockImplementation((path) => {
      throw new Error(`NEXT_REDIRECT: ${path}`)
    })

    const formData = new FormData()
    formData.append('locale', 'en')

    try {
      await logout(formData)
    } catch (error) {
      // Should still redirect
    }

    expect(mockSignOut).toHaveBeenCalled()
    expect(mockRevalidatePath).toHaveBeenCalled()
    expect(mockRedirect).toHaveBeenCalled()
  })
})
