import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { OrgProvider, useOrg } from '@/contexts/OrgContext';

const mockUseQuery = vi.fn();

vi.mock('@/trpc/react', () => ({
  api: {
    organization: {
      list: {
        useQuery: (...args: unknown[]) => mockUseQuery(...args),
      },
    },
  },
}));

const orgs = [
  { id: 'org-1', name: 'Default Org', is_personal: false },
  { id: 'org-personal', name: 'Personal Org', is_personal: true },
  { id: 'org-2', name: 'Secondary', is_personal: false },
] as any[];

function createWrapper() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={client}>
      <OrgProvider>{children}</OrgProvider>
    </QueryClientProvider>
  );
}

describe('OrgContext', () => {
  beforeEach(() => {
    localStorage.clear();
    mockUseQuery.mockReturnValue({
      data: orgs,
      isLoading: false,
      isFetching: false,
      error: null,
      refetch: vi.fn(),
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('defaults to personal org and persists selection', async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useOrg(), { wrapper });

    expect(result.current.currentOrgId).toBe('org-personal');
    expect(localStorage.getItem('console.currentOrgId')).toBe('org-personal');
  });

  it('loads stored org when valid and switches orgs', async () => {
    localStorage.setItem('console.currentOrgId', 'org-2');
    const wrapper = createWrapper();
    const { result } = renderHook(() => useOrg(), { wrapper });

    expect(result.current.currentOrgId).toBe('org-2');

    await act(async () => {
      result.current.switchOrg('org-1');
    });

    expect(result.current.currentOrgId).toBe('org-1');
    expect(localStorage.getItem('console.currentOrgId')).toBe('org-1');
  });
});
