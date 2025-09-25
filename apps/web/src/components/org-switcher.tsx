'use client';

import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@starter/ui';
import { Loader2 } from 'lucide-react';

interface OrgMembership {
  org_id: string;
  role: string;
  name?: string; // Will be populated by server
}

interface OrgSwitcherProps {
  userId: string;
  currentOrgId?: string;
}

/**
 * Client component for switching between user's organizations
 * Sets org_id cookie and navigates to the selected org
 */
export function OrgSwitcher({ userId, currentOrgId }: OrgSwitcherProps) {
  const [memberships, setMemberships] = useState<OrgMembership[]>([]);
  const [loading, setLoading] = useState(true);
  const [switching, setSwitching] = useState(false);

  useEffect(() => {
    // Fetch user memberships
    const fetchMemberships = async () => {
      try {
        const response = await fetch('/api/orgs/memberships');
        if (response.ok) {
          const data = await response.json();
          setMemberships(data);
        }
      } catch (error) {
        console.error('Failed to fetch memberships:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMemberships();
  }, [userId]);

  const handleOrgChange = async (orgId: string) => {
    if (orgId === currentOrgId) return;
    
    setSwitching(true);
    
    try {
      // Set cookie
      document.cookie = `org_id=${orgId}; path=/; samesite=lax`;
      
      // Navigate to org page
      window.location.href = `/org/${orgId}`;
    } catch (error) {
      console.error('Failed to switch organization:', error);
      setSwitching(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm text-muted-foreground">Loading...</span>
      </div>
    );
  }

  if (memberships.length === 0) {
    return (
      <div className="text-sm text-muted-foreground">
        No organizations found
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">Organization:</span>
      <Select
        value={currentOrgId || ''}
        onValueChange={handleOrgChange}
        disabled={switching}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Select organization" />
        </SelectTrigger>
        <SelectContent>
          {memberships.map((membership) => (
            <SelectItem key={membership.org_id} value={membership.org_id}>
              <div className="flex items-center gap-2">
                <span>{membership.name || `Org ${membership.org_id.slice(0, 8)}`}</span>
                <span className="text-xs text-muted-foreground">
                  ({membership.role})
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {switching && <Loader2 className="h-4 w-4 animate-spin" />}
    </div>
  );
}
