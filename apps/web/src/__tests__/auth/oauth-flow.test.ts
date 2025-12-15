import { describe, it, expect, vi, beforeEach } from 'vitest';
import { signInWithOAuth } from '@/utils/auth-helpers/client';

// Mock Supabase client
vi.mock('@/utils/supabase/client', () => ({
  createClient: vi.fn(() => ({
    auth: {
      signInWithOAuth: vi.fn(),
    },
  })),
}));

// Mock getURL helper
vi.mock('@/utils/helpers', () => ({
  getURL: vi.fn((path: string) => `http://localhost:3000${path}`),
}));

describe('OAuth Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('signInWithOAuth', () => {
    it('should initiate OAuth flow with Google provider', async () => {
      const { createClient } = await import('@/utils/supabase/client');
      const mockSignInWithOAuth = vi.fn().mockResolvedValue({
        data: { url: 'https://accounts.google.com/oauth', provider: 'google' },
        error: null,
      });
      
      (createClient as any).mockReturnValue({
        auth: {
          signInWithOAuth: mockSignInWithOAuth,
        },
      });

      await signInWithOAuth('google');

      expect(mockSignInWithOAuth).toHaveBeenCalledWith({
        provider: 'google',
        options: {
          redirectTo: 'http://localhost:3000/auth/callback',
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });
    });

    it('should initiate OAuth flow with Apple provider', async () => {
      const { createClient } = await import('@/utils/supabase/client');
      const mockSignInWithOAuth = vi.fn().mockResolvedValue({
        data: { url: 'https://appleid.apple.com/auth', provider: 'apple' },
        error: null,
      });
      
      (createClient as any).mockReturnValue({
        auth: {
          signInWithOAuth: mockSignInWithOAuth,
        },
      });

      await signInWithOAuth('apple');

      expect(mockSignInWithOAuth).toHaveBeenCalledWith({
        provider: 'apple',
        options: {
          redirectTo: 'http://localhost:3000/auth/callback',
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });
    });

    it('should initiate OAuth flow with Microsoft (Azure) provider', async () => {
      const { createClient } = await import('@/utils/supabase/client');
      const mockSignInWithOAuth = vi.fn().mockResolvedValue({
        data: { url: 'https://login.microsoftonline.com/oauth', provider: 'azure' },
        error: null,
      });
      
      (createClient as any).mockReturnValue({
        auth: {
          signInWithOAuth: mockSignInWithOAuth,
        },
      });

      await signInWithOAuth('azure');

      expect(mockSignInWithOAuth).toHaveBeenCalledWith({
        provider: 'azure',
        options: {
          redirectTo: 'http://localhost:3000/auth/callback',
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });
    });

    it('should throw error when OAuth provider returns error', async () => {
      const { createClient } = await import('@/utils/supabase/client');
      const mockError = new Error('Provider not configured');
      const mockSignInWithOAuth = vi.fn().mockResolvedValue({
        data: null,
        error: mockError,
      });
      
      (createClient as any).mockReturnValue({
        auth: {
          signInWithOAuth: mockSignInWithOAuth,
        },
      });

      await expect(signInWithOAuth('google')).rejects.toThrow('Failed to sign in with google');
    });

    it('should generate correct redirect URL', async () => {
      const { getURL } = await import('@/utils/helpers');
      const { createClient } = await import('@/utils/supabase/client');
      
      const mockSignInWithOAuth = vi.fn().mockResolvedValue({
        data: { url: 'https://provider.com/oauth', provider: 'google' },
        error: null,
      });
      
      (createClient as any).mockReturnValue({
        auth: {
          signInWithOAuth: mockSignInWithOAuth,
        },
      });

      await signInWithOAuth('google');

      expect(getURL).toHaveBeenCalledWith('/auth/callback');
    });
  });
});
