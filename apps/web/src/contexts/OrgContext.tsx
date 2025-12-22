'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { OrgRole, Organization } from '@starter/types';

import { api } from '@/trpc/react';

type OrgWithRole = Organization & { role?: OrgRole | null };

export type OrgContextType = {
  currentOrgId: string | null;
  currentOrg: OrgWithRole | null;
  organizations: OrgWithRole[];
  switchOrg: (orgId: string) => void;
  refresh: () => void;
  isLoading: boolean;
  error: string | null;
};

const OrgContext = createContext<OrgContextType | null>(null);

const STORAGE_KEY = 'console.currentOrgId';

export function OrgProvider({ children }: PropsWithChildren) {
  const queryClient = useQueryClient();
  const {
    data: orgs = [],
    isLoading,
    isFetching,
    error,
    refetch,
  } = api.organization.list.useQuery(undefined, {
    staleTime: 5 * 60 * 1000,
  });

  const [currentOrgId, setCurrentOrgId] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  // Load persisted org selection on first client render
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setCurrentOrgId(stored);
    }
    setHydrated(true);
  }, []);

  // Establish initial org selection when orgs load or change
  useEffect(() => {
    if (!hydrated) return;

    if (!orgs.length) {
      setCurrentOrgId(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem(STORAGE_KEY);
      }
      return;
    }

    const savedIsValid = currentOrgId && orgs.some((org) => org.id === currentOrgId);
    const nextId =
      (savedIsValid && currentOrgId) ||
      orgs.find((org) => org.is_personal)?.id ||
      orgs[0]?.id ||
      null;

    if (nextId !== currentOrgId) {
      setCurrentOrgId(nextId);
      if (typeof window !== 'undefined') {
        if (nextId) {
          localStorage.setItem(STORAGE_KEY, nextId);
        } else {
          localStorage.removeItem(STORAGE_KEY);
        }
      }
    }
  }, [hydrated, orgs, currentOrgId]);

  const switchOrg = useCallback(
    (orgId: string) => {
      if (!orgs.some((org) => org.id === orgId)) return;
      setCurrentOrgId(orgId);
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, orgId);
      }
      // Clear org-scoped caches to avoid stale data when switching
      queryClient.invalidateQueries();
    },
    [orgs, queryClient],
  );

  const currentOrg = useMemo(
    () => orgs.find((org) => org.id === currentOrgId) ?? null,
    [orgs, currentOrgId],
  );

  const contextValue: OrgContextType = {
    currentOrgId: currentOrgId ?? null,
    currentOrg: currentOrg as any,
    organizations: orgs as any,
    switchOrg,
    refresh: () => {
      void refetch();
    },
    isLoading: !hydrated || isLoading || isFetching,
    error: error?.message ?? null,
  };

  return <OrgContext.Provider value={contextValue}>{children}</OrgContext.Provider>;
}

export function useOrg(): OrgContextType {
  const ctx = useContext(OrgContext);
  if (!ctx) {
    throw new Error('useOrg must be used within an OrgProvider');
  }
  return ctx;
}

export function useCurrentOrg() {
  const { currentOrgId, currentOrg, organizations, isLoading } = useOrg();
  return {
    currentOrgId,
    currentOrg,
    currentOrgRole: currentOrg?.role ?? null,
    organizations,
    isLoading,
  };
}
