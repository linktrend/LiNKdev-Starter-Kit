import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { z } from 'zod';

/**
 * Organization context resolution result
 */
export type OrgContext = { 
  orgId: string | null; 
  source: 'param' | 'query' | 'cookie' | 'default' | null;
};

/**
 * Input schema for org context resolution
 */
const OrgContextInputSchema = z.object({
  params: z.object({
    orgId: z.string().optional(),
  }).optional(),
  searchParams: z.union([
    z.instanceof(URLSearchParams),
    z.record(z.string(), z.string()),
  ]).optional(),
  cookies: z.any(), // Next.js RequestCookies type
  userId: z.string(),
});

type OrgContextInput = z.infer<typeof OrgContextInputSchema>;

/**
 * Resolve organization ID with priority-based resolution
 * 
 * Priority order:
 * 1. params.orgId (for /org/[orgId]/** routes)
 * 2. searchParams.orgId (e.g., /records?orgId=...)
 * 3. cookie 'org_id'
 * 4. user's default org (first active membership)
 * 
 * @param opts - Resolution options
 * @returns Organization context with resolved orgId and source
 */
export async function resolveOrgId(opts: OrgContextInput): Promise<OrgContext> {
  try {
    // Validate input
    const validatedInput = OrgContextInputSchema.parse(opts);
    const { params, searchParams, cookies: requestCookies, userId } = validatedInput;

    // 1. Check params.orgId (highest priority)
    if (params?.orgId) {
      return { orgId: params.orgId, source: 'param' };
    }

    // 2. Check searchParams.orgId
    let queryOrgId: string | undefined;
    if (searchParams) {
      if (searchParams instanceof URLSearchParams) {
        queryOrgId = searchParams.get('orgId') || undefined;
      } else {
        queryOrgId = searchParams.orgId;
      }
    }
    
    if (queryOrgId) {
      return { orgId: queryOrgId, source: 'query' };
    }

    // 3. Check cookie 'org_id'
    const cookieOrgId = requestCookies.get('org_id')?.value;
    if (cookieOrgId) {
      return { orgId: cookieOrgId, source: 'cookie' };
    }

    // 4. Get user's default org (first active membership)
    const defaultOrgId = await getDefaultOrgId(userId);
    if (defaultOrgId) {
      return { orgId: defaultOrgId, source: 'default' };
    }

    // No org found
    return { orgId: null, source: null };
  } catch (error) {
    console.error('Error resolving org context:', error);
    return { orgId: null, source: null };
  }
}

/**
 * Persist organization ID in cookie
 * 
 * @param response - Next.js response object
 * @param orgId - Organization ID to persist
 */
export function persistOrgCookie(response: import('next/server').NextResponse, orgId: string): void {
  response.cookies.set('org_id', orgId, {
    path: '/',
    sameSite: 'lax',
    httpOnly: false, // Allow client-side access for org switching
    secure: process.env.NODE_ENV === 'production',
  });
}

/**
 * Get user's default organization ID (first active membership)
 * 
 * @param userId - User ID
 * @returns Default organization ID or null
 */
async function getDefaultOrgId(userId: string): Promise<string | null> {
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

    return memberships?.[0]?.org_id || null;
  } catch (error) {
    console.error('Error getting default org ID:', error);
    return null;
  }
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

    return memberships || [];
  } catch (error) {
    console.error('Error listing user memberships:', error);
    return [];
  }
}
