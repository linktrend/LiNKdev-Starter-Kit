'use client';

import { useCurrentOrg as useCurrentOrgFromContext } from '@/contexts/OrgContext';

export function useCurrentOrg() {
  return useCurrentOrgFromContext();
}
