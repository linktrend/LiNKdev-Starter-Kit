import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock environment variables
const mockEnv = {
  NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
};

describe('Supabase Client Creation', () => {
  beforeEach(() => {
    vi.resetModules();
    // Set up environment variables
    process.env.NEXT_PUBLIC_SUPABASE_URL = mockEnv.NEXT_PUBLIC_SUPABASE_URL;
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = mockEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  });

  describe('Browser Client', () => {
    it('should create client with valid environment variables', async () => {
      const { createClient } = await import('@/lib/auth/client');
      
      const client = createClient();
      
      expect(client).toBeDefined();
      expect(client.auth).toBeDefined();
    });

    it('should throw error with missing SUPABASE_URL', async () => {
      delete process.env.NEXT_PUBLIC_SUPABASE_URL;
      
      const { createClient } = await import('@/lib/auth/client');
      
      expect(() => createClient()).toThrow('Missing Supabase environment variables');
    });

    it('should throw error with missing SUPABASE_ANON_KEY', async () => {
      delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      const { createClient } = await import('@/lib/auth/client');
      
      expect(() => createClient()).toThrow('Missing Supabase environment variables');
    });
  });

  // Note: Server client tests require more complex mocking of Next.js server components
  // and are better tested through integration tests
});
