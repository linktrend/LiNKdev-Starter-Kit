import type { OrgRole } from '@starter/types';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@starter/types';
import { canChangeRole, canManageMembers, roleIsSufficient } from '../rbac';
import { forbiddenError, notFoundError } from './errors';

type TypedSupabase = SupabaseClient<Database>;

export async function fetchMembershipRole(
  supabase: TypedSupabase,
  orgId: string,
  userId: string,
): Promise<OrgRole | null> {
  const { data, error } = await supabase
    .from('organization_members')
    .select('role')
    .eq('org_id', orgId)
    .eq('user_id', userId)
    .single();

  if (error) {
    return null;
  }

  return (data?.role as OrgRole) ?? null;
}

export async function requireOrgMember(
  supabase: TypedSupabase,
  orgId: string,
  userId: string,
): Promise<OrgRole> {
  const role = await fetchMembershipRole(supabase, orgId, userId);
  if (!role) {
    throw forbiddenError('Not a member of this organization');
  }
  return role;
}

export async function requireOrgRole(
  supabase: TypedSupabase,
  orgId: string,
  userId: string,
  requiredRole: OrgRole,
): Promise<OrgRole> {
  const role = await requireOrgMember(supabase, orgId, userId);
  if (!roleIsSufficient(requiredRole, role)) {
    throw forbiddenError(`Requires ${requiredRole} role`);
  }
  return role;
}

export async function ensureCanManageMembers(
  supabase: TypedSupabase,
  orgId: string,
  userId: string,
): Promise<OrgRole> {
  const role = await requireOrgMember(supabase, orgId, userId);
  if (!canManageMembers(role)) {
    throw forbiddenError('Insufficient permissions to manage members');
  }
  return role;
}

export async function ensureCanChangeRole(
  supabase: TypedSupabase,
  orgId: string,
  actorId: string,
  targetRole: OrgRole,
  nextRole: OrgRole,
): Promise<void> {
  const actorRole = await requireOrgMember(supabase, orgId, actorId);
  if (!canChangeRole(targetRole, nextRole, actorRole)) {
    throw forbiddenError('Cannot change role');
  }
}

export async function assertOrganizationExists(
  supabase: TypedSupabase,
  orgId: string,
): Promise<void> {
  const { data, error } = await supabase
    .from('organizations')
    .select('id')
    .eq('id', orgId)
    .single();

  if (error || !data) {
    throw notFoundError('Organization not found');
  }
}
