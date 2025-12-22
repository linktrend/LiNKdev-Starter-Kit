import { vi } from 'vitest';
import type { Session, User } from '@supabase/supabase-js';

/**
 * Factory to create mock users for testing
 */
export function createMockUser(overrides?: Partial<User>): User {
  const id = overrides?.id || `user-${Math.random().toString(36).substring(7)}`;
  return {
    id,
    aud: 'authenticated',
    role: 'authenticated',
    email: overrides?.email || `test-${id}@example.com`,
    email_confirmed_at: new Date().toISOString(),
    phone: overrides?.phone || null,
    confirmed_at: new Date().toISOString(),
    last_sign_in_at: new Date().toISOString(),
    app_metadata: {
      provider: overrides?.app_metadata?.provider || 'email',
      providers: [overrides?.app_metadata?.provider || 'email'],
      ...overrides?.app_metadata,
    },
    user_metadata: {
      full_name: overrides?.user_metadata?.full_name || 'Test User',
      avatar_url: overrides?.user_metadata?.avatar_url || null,
      ...overrides?.user_metadata,
    },
    identities: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  } as User;
}

/**
 * Factory to create mock sessions for testing
 */
export function createMockSession(user?: User, overrides?: Partial<Session>): Session {
  const mockUser = user || createMockUser();
  return {
    access_token: overrides?.access_token || `access-token-${Math.random().toString(36).substring(7)}`,
    refresh_token: overrides?.refresh_token || `refresh-token-${Math.random().toString(36).substring(7)}`,
    expires_in: overrides?.expires_in || 3600,
    expires_at: overrides?.expires_at || Math.floor(Date.now() / 1000) + 3600,
    token_type: 'bearer',
    user: mockUser,
    ...overrides,
  };
}

/**
 * Create a mock database row for users table
 */
export function createMockUserRow(userId: string, overrides?: any) {
  return {
    id: userId,
    email: `test-${userId}@example.com`,
    username: overrides?.username || `user_${userId.substring(0, 8)}`,
    full_name: overrides?.full_name || 'Test User',
    first_name: overrides?.first_name || 'Test',
    last_name: overrides?.last_name || 'User',
    display_name: overrides?.display_name || null,
    avatar_url: overrides?.avatar_url || null,
    phone_country_code: overrides?.phone_country_code || null,
    phone_number: overrides?.phone_number || null,
    bio: overrides?.bio || null,
    account_type: overrides?.account_type || 'user',
    profile_completed: overrides?.profile_completed ?? false,
    onboarding_completed: overrides?.onboarding_completed ?? false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    last_sign_in_at: new Date().toISOString(),
    ...overrides,
  };
}

/**
 * Create a mock organization row
 */
export function createMockOrganization(userId: string, overrides?: any) {
  const orgId = overrides?.id || `org-${Math.random().toString(36).substring(7)}`;
  return {
    id: orgId,
    name: overrides?.name || `${userId}'s Organization`,
    slug: overrides?.slug || `org-${orgId.substring(0, 8)}`,
    is_personal: overrides?.is_personal ?? true,
    org_type: overrides?.org_type || 'personal',
    created_by: userId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  };
}

/**
 * Email capture utility for testing
 */
export class EmailCapture {
  private emails: Array<{ to: string; subject: string; body: string; link?: string }> = [];

  capture(to: string, subject: string, body: string) {
    const linkMatch = body.match(/https?:\/\/[^\s<]+/);
    this.emails.push({
      to,
      subject,
      body,
      link: linkMatch ? linkMatch[0] : undefined,
    });
  }

  getEmails() {
    return this.emails;
  }

  getLastEmail() {
    return this.emails[this.emails.length - 1];
  }

  getEmailsTo(email: string) {
    return this.emails.filter((e) => e.to === email);
  }

  clear() {
    this.emails = [];
  }

  extractMagicLink(email: string): string | undefined {
    const emailData = this.getEmailsTo(email).find((e) => e.link);
    return emailData?.link;
  }

  extractResetLink(email: string): string | undefined {
    const emailData = this.getEmailsTo(email).find((e) => 
      e.subject.toLowerCase().includes('reset') && e.link
    );
    return emailData?.link;
  }
}

/**
 * SMS capture utility for testing
 */
export class SMSCapture {
  private messages: Array<{ phone: string; message: string; otp?: string }> = [];

  capture(phone: string, message: string) {
    const otpMatch = message.match(/\b\d{6}\b/);
    this.messages.push({
      phone,
      message,
      otp: otpMatch ? otpMatch[0] : undefined,
    });
  }

  getMessages() {
    return this.messages;
  }

  getLastMessage() {
    return this.messages[this.messages.length - 1];
  }

  getMessagesTo(phone: string) {
    return this.messages.filter((m) => m.phone === phone);
  }

  clear() {
    this.messages = [];
  }

  extractOTP(phone: string): string | undefined {
    const message = this.getMessagesTo(phone).find((m) => m.otp);
    return message?.otp;
  }
}

/**
 * Mock Supabase Auth with comprehensive functionality
 */
export function mockSupabaseAuth(options: {
  emailCapture?: EmailCapture;
  smsCapture?: SMSCapture;
  database?: any;
} = {}) {
  const { emailCapture, smsCapture, database } = options;

  return {
    signInWithOAuth: vi.fn(async ({ provider, options: authOptions }: any) => {
      // Simulate OAuth redirect
      const redirectUrl = `https://${provider}.com/oauth/authorize`;
      return {
        data: { url: redirectUrl, provider },
        error: null,
      };
    }),

    exchangeCodeForSession: vi.fn(async (code: string) => {
      if (code === 'invalid-code') {
        return {
          data: { session: null, user: null },
          error: { message: 'Invalid authorization code' },
        };
      }

      const user = createMockUser({
        app_metadata: { provider: 'google' },
      });
      const session = createMockSession(user);

      return {
        data: { session, user },
        error: null,
      };
    }),

    signInWithOtp: vi.fn(async ({ email, phone, options: authOptions }: any) => {
      if (email) {
        emailCapture?.capture(
          email,
          'Magic Link Login',
          `Click here to login: ${authOptions?.emailRedirectTo}?token=mock-token-${Date.now()}`
        );
      }

      if (phone) {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        smsCapture?.capture(phone, `Your verification code is: ${otp}`);
      }

      return { error: null };
    }),

    verifyOtp: vi.fn(async ({ phone, token, type }: any) => {
      const capturedOTP = smsCapture?.extractOTP(phone);
      
      if (token === '000000' || token !== capturedOTP) {
        return {
          data: { session: null, user: null },
          error: { message: 'Invalid OTP' },
        };
      }

      if (token === '999999') {
        return {
          data: { session: null, user: null },
          error: { message: 'OTP expired' },
        };
      }

      const user = createMockUser({ phone });
      const session = createMockSession(user);

      return {
        data: { session, user },
        error: null,
      };
    }),

    signInWithPassword: vi.fn(async ({ email, password }: any) => {
      if (password === 'wrong-password') {
        return {
          data: { session: null, user: null },
          error: { message: 'Invalid login credentials' },
        };
      }

      const user = createMockUser({ email });
      const session = createMockSession(user);

      return {
        data: { session, user },
        error: null,
      };
    }),

    resetPasswordForEmail: vi.fn(async (email: string, options: any) => {
      emailCapture?.capture(
        email,
        'Reset Your Password',
        `Click here to reset: ${options?.redirectTo}?token=reset-token-${Date.now()}`
      );

      return { error: null };
    }),

    updateUser: vi.fn(async ({ password }: any) => {
      if (password && password.length < 8) {
        return {
          data: { user: null },
          error: { message: 'Password must be at least 8 characters' },
        };
      }

      const user = createMockUser();
      return {
        data: { user },
        error: null,
      };
    }),

    getSession: vi.fn(async () => {
      return {
        data: { session: null },
        error: null,
      };
    }),

    getUser: vi.fn(async () => {
      return {
        data: { user: null },
        error: null,
      };
    }),

    signOut: vi.fn(async () => {
      return { error: null };
    }),

    refreshSession: vi.fn(async () => {
      const user = createMockUser();
      const session = createMockSession(user);
      return {
        data: { session, user },
        error: null,
      };
    }),
  };
}

/**
 * Wait for auth state to change (useful for async operations)
 */
export async function waitForAuthState(
  checkFn: () => boolean | Promise<boolean>,
  timeout = 5000
): Promise<void> {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    const result = await checkFn();
    if (result) {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  
  throw new Error(`Timeout waiting for auth state change after ${timeout}ms`);
}

/**
 * Create a complete mock Supabase client for integration tests
 */
export function createMockSupabaseClient(database: any, auth: any) {
  return {
    auth,
    from: (table: string) => database.table(table),
  };
}
