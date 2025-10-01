'use client';

import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { SupportWidget } from './support-widget';
import { env } from '@/env';

/**
 * SupportWidgetWrapper - Client-side wrapper for SupportWidget
 * 
 * This component extracts organization context from the URL and cookies
 * to pass to the SupportWidget component. It also handles the environment
 * variable check for enabling/disabling the widget.
 */
export function SupportWidgetWrapper() {
  const [orgId, setOrgId] = useState<string | null>(null);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Extract orgId from URL path (e.g., /org/[orgId]/...)
    const orgMatch = pathname.match(/\/org\/([^/]+)/);
    if (orgMatch) {
      setOrgId(orgMatch[1]);
      return;
    }

    // Extract orgId from search params
    const queryOrgId = searchParams.get('orgId');
    if (queryOrgId) {
      setOrgId(queryOrgId);
      return;
    }

    // Try to get orgId from cookie (client-side)
    const cookieOrgId = document.cookie
      .split('; ')
      .find(row => row.startsWith('org_id='))
      ?.split('=')[1];
    
    if (cookieOrgId) {
      setOrgId(cookieOrgId);
      return;
    }

    // No orgId found
    setOrgId(null);
  }, [pathname, searchParams]);

  // Check if support widget is enabled via environment variable
  const isEnabled = env.NEXT_PUBLIC_SUPPORT_ENABLED === 'true';

  if (!isEnabled) {
    return null;
  }

  return <SupportWidget orgId={orgId} />;
}
