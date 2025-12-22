import { describe, it, expect, vi, beforeEach } from 'vitest';
import { sendMagicLink } from '@/app/actions/auth';

// Mock the Supabase client
vi.mock('@/lib/auth/server', () => ({
  createClient: vi.fn(() => ({
    auth: {
      signInWithOtp: vi.fn(),
    },
  })),
}));

describe('Magic Link Authentication', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should send magic link for valid email', async () => {
    const { createClient } = await import('@/lib/auth/server');
    const mockSignInWithOtp = vi.fn().mockResolvedValue({ error: null });
    vi.mocked(createClient).mockReturnValue({
      auth: { signInWithOtp: mockSignInWithOtp },
    } as any);

    const formData = new FormData();
    formData.append('email', 'test@example.com');
    formData.append('locale', 'en');

    const result = await sendMagicLink({}, formData);

    expect(result.success).toBe(true);
    expect(result.message).toBe('Check your email for the magic link.');
    expect(mockSignInWithOtp).toHaveBeenCalledWith({
      email: 'test@example.com',
      options: expect.objectContaining({
        emailRedirectTo: expect.stringContaining('/auth/callback'),
      }),
    });
  });

  it('should reject invalid email format', async () => {
    const formData = new FormData();
    formData.append('email', 'invalid-email');

    const result = await sendMagicLink({}, formData);

    expect(result.error?.email).toBeDefined();
    expect(result.success).toBeUndefined();
  });

  it('should handle rate limit errors', async () => {
    const { createClient } = await import('@/lib/auth/server');
    const mockSignInWithOtp = vi.fn().mockResolvedValue({
      error: { status: 429, message: 'Rate limit exceeded' },
    });
    vi.mocked(createClient).mockReturnValue({
      auth: { signInWithOtp: mockSignInWithOtp },
    } as any);

    const formData = new FormData();
    formData.append('email', 'test@example.com');

    const result = await sendMagicLink({}, formData);

    expect(result.error?.form).toContain('Rate limit exceeded');
  });

  it('should handle Supabase errors', async () => {
    const { createClient } = await import('@/lib/auth/server');
    const mockSignInWithOtp = vi.fn().mockResolvedValue({
      error: { message: 'Email service unavailable' },
    });
    vi.mocked(createClient).mockReturnValue({
      auth: { signInWithOtp: mockSignInWithOtp },
    } as any);

    const formData = new FormData();
    formData.append('email', 'test@example.com');

    const result = await sendMagicLink({}, formData);

    expect(result.error?.form).toContain('Email service unavailable');
  });
});
