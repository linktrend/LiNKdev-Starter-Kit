'use client';

import { useEffect } from 'react';

interface OrgContextProviderProps {
  orgId: string;
  source: 'param' | 'query' | 'cookie' | 'default' | null;
  children: React.ReactNode;
}

/**
 * Client component to persist org context in cookie when not from cookie source
 */
export function OrgContextProvider({ orgId, source, children }: OrgContextProviderProps) {
  useEffect(() => {
    // Only persist if orgId is resolved but not from cookie source
    if (orgId && source && source !== 'cookie') {
      document.cookie = `org_id=${orgId}; path=/; samesite=lax`;
    }
  }, [orgId, source]);

  return <>{children}</>;
}
