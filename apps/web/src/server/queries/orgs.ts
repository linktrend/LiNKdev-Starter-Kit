import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { z } from 'zod';

const OrgSummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  members: z.number(),
});

const UserOrgRoleSchema = z.enum(['owner', 'member', 'viewer']).nullable();

export type OrgSummary = z.infer<typeof OrgSummarySchema>;
export type UserOrgRole = z.infer<typeof UserOrgRoleSchema>;

/**
 * Get organization summary information
 */
export async function getOrgSummary(orgId: string): Promise<OrgSummary | null> {
  // TEMPORARY: Offline mode for testing
  if (process.env.TEMPLATE_OFFLINE === '1') {
    return {
      id: orgId,
      name: 'Test Organization',
      members: 1,
    };
  }

  try {
    const supabase = createClient({ cookies });
    
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .select('id, name')
      .eq('id', orgId)
      .single();

    type OrgResult = { id: string; name: string };
    const typedOrg = org as OrgResult | null;

    if (orgError || !typedOrg) {
      return null;
    }

    // Get member count
    const { count: memberCount, error: countError } = await supabase
      .from('organization_members')
      .select('*', { count: 'exact', head: true })
      .eq('org_id', orgId);

    if (countError) {
      console.error('Error counting members:', countError);
      return null;
    }

    return {
      id: typedOrg.id,
      name: typedOrg.name,
      members: memberCount || 0,
    };
  } catch (error) {
    console.error('Error fetching org summary:', error);
    return null;
  }
}

/**
 * Get user's role in a specific organization
 */
export async function getUserOrgRole(orgId: string, userId: string): Promise<UserOrgRole> {
  // TEMPORARY: Offline mode for testing
  if (process.env.TEMPLATE_OFFLINE === '1') {
    return 'owner';
  }

  try {
    const supabase = createClient({ cookies });
    
    const { data: membership, error } = await supabase
      .from('organization_members')
      .select('role')
      .eq('org_id', orgId)
      .eq('user_id', userId)
      .single();

    type MembershipResult = { role: string };
    const typedMembership = membership as MembershipResult | null;

    if (error || !typedMembership) {
      return null;
    }

    return typedMembership.role as UserOrgRole;
  } catch (error) {
    console.error('Error fetching user org role:', error);
    return null;
  }
}

/**
 * Check if user has access to organization
 */
export async function hasOrgAccess(orgId: string, userId: string): Promise<boolean> {
  // TEMPORARY: Offline mode for testing - always grant access
  if (process.env.TEMPLATE_OFFLINE === '1') {
    return true;
  }
  
  const role = await getUserOrgRole(orgId, userId);
  return role !== null;
}

/**
 * List user's organization memberships
 * 
 * @param userId - User ID
 * @returns Array of organization memberships
 */
export async function listUserMemberships(userId: string): Promise<Array<{org_id: string, role: string}>> {
  try {
    const supabase = createClient({ cookies });
    
    const { data: memberships, error } = await supabase
      .from('organization_members')
      .select('org_id, role')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching user memberships:', error);
      return [];
    }

    type MembershipResult = { org_id: string; role: string };
    return (memberships as MembershipResult[]) || [];
  } catch (error) {
    console.error('Error listing user memberships:', error);
    return [];
  }
}

/**
 * Get user's default organization ID (first active membership)
 * 
 * @param userId - User ID
 * @returns Default organization ID or null
 */
export async function getDefaultOrgId(userId: string): Promise<string | null> {
  try {
    const supabase = createClient({ cookies });
    
    const { data: memberships, error } = await supabase
      .from('organization_members')
      .select('org_id')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
      .limit(1);

    if (error) {
      console.error('Error fetching user memberships:', error);
      return null;
    }

    type OrgIdResult = { org_id: string };
    const typedMemberships = (memberships as OrgIdResult[]) || [];
    return typedMemberships[0]?.org_id || null;
  } catch (error) {
    console.error('Error getting default org ID:', error);
    return null;
  }
}
