import { describe, it, expect, vi, beforeEach } from 'vitest';
import { resolveOrgId, persistOrgCookie } from '@/server/org-context';
import { listUserMemberships } from '@/server/queries/orgs';

// Mock Next.js cookies
const mockCookies = {
  get: vi.fn(),
  set: vi.fn(),
};

// Mock Supabase client
const mockSupabase = {
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        order: vi.fn(() => ({
          limit: vi.fn(() => ({
            data: [],
            error: null,
          })),
        })),
      })),
    })),
  })),
};

// Mock the createClient function
vi.mock('@/utils/supabase/server', () => ({
  createClient: vi.fn(() => mockSupabase),
}));

// Mock Next.js cookies
vi.mock('next/headers', () => ({
  cookies: vi.fn(() => mockCookies),
}));

describe('Org Context Resolution', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('resolveOrgId', () => {
    it('should resolve orgId from params with highest priority', async () => {
      const result = await resolveOrgId({
        params: { orgId: 'param-org-123' },
        searchParams: { orgId: 'query-org-456' },
        cookies: mockCookies,
        userId: 'user-123',
      });

      expect(result).toEqual({
        orgId: 'param-org-123',
        source: 'param',
      });
    });

    it('should resolve orgId from searchParams when no params', async () => {
      const result = await resolveOrgId({
        searchParams: { orgId: 'query-org-456' },
        cookies: mockCookies,
        userId: 'user-123',
      });

      expect(result).toEqual({
        orgId: 'query-org-456',
        source: 'query',
      });
    });

    it('should resolve orgId from URLSearchParams', async () => {
      const searchParams = new URLSearchParams('orgId=query-org-789');
      const result = await resolveOrgId({
        searchParams,
        cookies: mockCookies,
        userId: 'user-123',
      });

      expect(result).toEqual({
        orgId: 'query-org-789',
        source: 'query',
      });
    });

    it('should resolve orgId from cookie when no params/query', async () => {
      mockCookies.get.mockReturnValue({ value: 'cookie-org-999' });

      const result = await resolveOrgId({
        cookies: mockCookies,
        userId: 'user-123',
      });

      expect(result).toEqual({
        orgId: 'cookie-org-999',
        source: 'cookie',
      });
    });

    it('should resolve orgId from default org when no other sources', async () => {
      mockCookies.get.mockReturnValue(undefined);
      mockSupabase.from.mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn(() => ({
              limit: vi.fn(() => ({
                data: [{ org_id: 'default-org-111' }],
                error: null,
              })),
            })),
          })),
        })),
      });

      const result = await resolveOrgId({
        cookies: mockCookies,
        userId: 'user-123',
      });

      expect(result).toEqual({
        orgId: 'default-org-111',
        source: 'default',
      });
    });

    it('should return null when no org found', async () => {
      mockCookies.get.mockReturnValue(undefined);
      mockSupabase.from.mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn(() => ({
              limit: vi.fn(() => ({
                data: [],
                error: null,
              })),
            })),
          })),
        })),
      });

      const result = await resolveOrgId({
        cookies: mockCookies,
        userId: 'user-123',
      });

      expect(result).toEqual({
        orgId: null,
        source: null,
      });
    });

    it('should handle errors gracefully', async () => {
      mockCookies.get.mockReturnValue(undefined);
      mockSupabase.from.mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn(() => ({
              limit: vi.fn(() => ({
                data: null,
                error: new Error('Database error'),
              })),
            })),
          })),
        })),
      });

      const result = await resolveOrgId({
        cookies: mockCookies,
        userId: 'user-123',
      });

      expect(result).toEqual({
        orgId: null,
        source: null,
      });
    });
  });

  describe('persistOrgCookie', () => {
    it('should set org_id cookie with correct options', () => {
      const mockResponse = {
        cookies: {
          set: vi.fn(),
        },
      } as any;

      persistOrgCookie(mockResponse, 'test-org-123');

      expect(mockResponse.cookies.set).toHaveBeenCalledWith('org_id', 'test-org-123', {
        path: '/',
        sameSite: 'lax',
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
      });
    });
  });

  describe('listUserMemberships', () => {
    it('should return user memberships', async () => {
      const mockMemberships = [
        { org_id: 'org-1', role: 'owner' },
        { org_id: 'org-2', role: 'admin' },
      ];

      mockSupabase.from.mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn(() => ({
              data: mockMemberships,
              error: null,
            })),
          })),
        })),
      });

      const result = await listUserMemberships('user-123');

      expect(result).toEqual(mockMemberships);
    });

    it('should return empty array on error', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn(() => ({
              data: null,
              error: new Error('Database error'),
            })),
          })),
        })),
      });

      const result = await listUserMemberships('user-123');

      expect(result).toEqual([]);
    });
  });
});
