'use server';

import { createClient as createServiceRoleClient, type SupabaseClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth/server';
import { env } from '@/env';
import type { Database } from '@/types/database.types';
import type { OrgRole } from '@starter/types';

type ServiceRoleClient = SupabaseClient<Database>;

let serviceRoleClient: ServiceRoleClient | null = null;

function getServiceRoleClient(): ServiceRoleClient {
  if (serviceRoleClient) return serviceRoleClient;

  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || env.SUPABASE_URL;
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    throw new Error('Supabase service role environment variables are not set');
  }

  serviceRoleClient = createServiceRoleClient<Database>(supabaseUrl, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return serviceRoleClient;
}

// Validation schemas
const orgIdSchema = z.object({
  orgId: z.string().uuid(),
});

const updateMemberRoleSchema = z.object({
  orgId: z.string().uuid(),
  userId: z.string().uuid(),
  newRole: z.enum(['owner', 'admin', 'editor', 'viewer']),
});

const removeMemberSchema = z.object({
  orgId: z.string().uuid(),
  userId: z.string().uuid(),
});

const inviteMemberSchema = z.object({
  orgId: z.string().uuid(),
  email: z.string().email(),
  role: z.enum(['admin', 'editor', 'viewer']),
});

const revokeSessionSchema = z.object({
  sessionId: z.string().uuid(),
  userId: z.string().uuid(),
});

const securityEventsSchema = z.object({
  orgId: z.string().uuid(),
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0),
  eventType: z.string().optional(),
  userId: z.string().uuid().optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
});

const enforce2FASchema = z.object({
  orgId: z.string().uuid(),
  enabled: z.boolean(),
});

const passwordPolicySchema = z.object({
  orgId: z.string().uuid(),
  policy: z.object({
    minLength: z.number().min(8).max(128),
    requireUppercase: z.boolean(),
    requireLowercase: z.boolean(),
    requireNumbers: z.boolean(),
    requireSpecialChars: z.boolean(),
    expirationDays: z.number().min(0).max(365).nullable(),
    preventReuse: z.number().min(0).max(24),
  }),
});

// Helper function to get user's role in organization
async function getUserOrgRole(orgId: string, userId: string): Promise<OrgRole | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('organization_members')
    .select('role')
    .eq('org_id', orgId)
    .eq('user_id', userId)
    .single();

  type RoleResult = { role: string };
  const typedData = data as RoleResult | null;
  if (error || !typedData) return null;
  return typedData.role as OrgRole;
}

// Helper function to log audit event
async function logAuditEvent(
  orgId: string,
  actorId: string,
  action: string,
  entityType: string,
  entityId: string,
  metadata: Record<string, any> = {}
) {
  const supabase = getServiceRoleClient();
  await supabase.from('audit_logs').insert({
    org_id: orgId,
    actor_id: actorId,
    action,
    entity_type: entityType,
    entity_id: entityId,
    metadata,
  });
}

/**
 * Get all organization members with user details
 */
export async function getOrgMembers(input: z.input<typeof orgIdSchema>) {
  const user = await requireAuth();
  const parsed = orgIdSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.message };
  }

  const { orgId } = parsed.data;
  const userRole = await getUserOrgRole(orgId, user.id);
  if (!userRole) {
    return { success: false, error: 'Not a member of this organization' };
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from('organization_members')
    .select(`
      user_id,
      role,
      created_at,
      user:user_id (
        id,
        email,
        full_name,
        avatar_url,
        created_at,
        account_type
      )
    `)
    .eq('org_id', orgId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching org members:', error);
    return { success: false, error: 'Failed to fetch organization members' };
  }

  type MemberWithUserResult = {
    user_id: string;
    role: string;
    created_at: string;
    user?: {
      id: string;
      email: string | null;
      full_name: string | null;
      avatar_url: string | null;
      created_at: string | null;
      account_type: string | null;
    };
  };
  const typedMembers = (data as MemberWithUserResult[]) || [];

  // Get session info for each user
  const serviceRole = getServiceRoleClient();
  const membersWithSessions = await Promise.all(
    typedMembers.map(async (member) => {
      const { data: sessions } =
        (await (serviceRole.auth.admin as any).listUserSessions?.(member.user_id)) ?? { data: [] };
      const lastSession = sessions?.[0];
      
      return {
        ...member,
        lastLogin: lastSession?.created_at || null,
        isActive: sessions && sessions.length > 0,
      };
    })
  );

  return { success: true, members: membersWithSessions };
}

/**
 * Update member role (owner only)
 */
export async function updateMemberRole(input: z.input<typeof updateMemberRoleSchema>) {
  const user = await requireAuth();
  const parsed = updateMemberRoleSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.message };
  }

  const { orgId, userId, newRole } = parsed.data;
  const actorRole = await getUserOrgRole(orgId, user.id);
  
  if (actorRole !== 'owner') {
    return { success: false, error: 'Only owners can change member roles' };
  }

  // Prevent changing own role
  if (user.id === userId) {
    return { success: false, error: 'Cannot change your own role' };
  }

  // Get target member's current role
  const supabase = createClient();
  const { data: targetMember, error: fetchError } = await supabase
    .from('organization_members')
    .select('role')
    .eq('org_id', orgId)
    .eq('user_id', userId)
    .single();

  type MemberRoleResult = { role: string };
  const typedTargetMember = targetMember as MemberRoleResult | null;

  if (fetchError || !typedTargetMember) {
    return { success: false, error: 'Member not found' };
  }

  // Prevent demoting the last owner
  if (typedTargetMember.role === 'owner' && newRole !== 'owner') {
    const { data: owners } = await supabase
      .from('organization_members')
      .select('user_id')
      .eq('org_id', orgId)
      .eq('role', 'owner');

    if (owners && owners.length <= 1) {
      return { success: false, error: 'Cannot demote the last owner' };
    }
  }

  // Update role
  const updateResult = await supabase
    .from('organization_members')
    // @ts-ignore - Supabase type inference issue with update
    .update({ role: newRole })
    .eq('org_id', orgId)
    .eq('user_id', userId);
  const { error: updateError } = updateResult;

  if (updateError) {
    console.error('Error updating member role:', updateError);
    return { success: false, error: 'Failed to update member role' };
  }

  // Log audit event
  await logAuditEvent(
    orgId,
    user.id,
    'member.role_changed',
    'organization_member',
    userId,
    { oldRole: typedTargetMember.role, newRole }
  );

  return { success: true };
}

/**
 * Remove member from organization (owner/admin)
 */
export async function removeMember(input: z.input<typeof removeMemberSchema>) {
  const user = await requireAuth();
  const parsed = removeMemberSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.message };
  }

  const { orgId, userId } = parsed.data;
  const actorRole = await getUserOrgRole(orgId, user.id);
  
  if (actorRole !== 'owner' && actorRole !== 'admin') {
    return { success: false, error: 'Only owners and admins can remove members' };
  }

  // Prevent removing self
  if (user.id === userId) {
    return { success: false, error: 'Cannot remove yourself' };
  }

  const supabase = createClient();
  const { data: targetMember, error: fetchError } = await supabase
    .from('organization_members')
    .select('role')
    .eq('org_id', orgId)
    .eq('user_id', userId)
    .single();

  type MemberRoleResult = { role: string };
  const typedRemoveMember = targetMember as MemberRoleResult | null;

  if (fetchError || !typedRemoveMember) {
    return { success: false, error: 'Member not found' };
  }

  // Only owners can remove other owners
  if (typedRemoveMember.role === 'owner' && actorRole !== 'owner') {
    return { success: false, error: 'Only owners can remove other owners' };
  }

  // Prevent removing the last owner
  if (typedRemoveMember.role === 'owner') {
    const { data: owners } = await supabase
      .from('organization_members')
      .select('user_id')
      .eq('org_id', orgId)
      .eq('role', 'owner');

    if (owners && owners.length <= 1) {
      return { success: false, error: 'Cannot remove the last owner' };
    }
  }

  // Remove member
  const { error: deleteError } = await supabase
    .from('organization_members')
    .delete()
    .eq('org_id', orgId)
    .eq('user_id', userId);

  if (deleteError) {
    console.error('Error removing member:', deleteError);
    return { success: false, error: 'Failed to remove member' };
  }

  // Log audit event
  await logAuditEvent(
    orgId,
    user.id,
    'member.removed',
    'organization_member',
    userId,
    { role: typedRemoveMember.role }
  );

  return { success: true };
}

/**
 * Invite new member to organization
 */
export async function inviteMember(input: z.input<typeof inviteMemberSchema>) {
  const user = await requireAuth();
  const parsed = inviteMemberSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.message };
  }

  const { orgId, email, role } = parsed.data;
  const actorRole = await getUserOrgRole(orgId, user.id);
  
  if (actorRole !== 'owner' && actorRole !== 'admin') {
    return { success: false, error: 'Only owners and admins can invite members' };
  }

  const supabase = createClient();
  
  // Check if user already exists
  const { data: existingUser } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .single();

  type UserIdResult = { id: string };
  const typedExistingUser = existingUser as UserIdResult | null;

  if (typedExistingUser) {
    // Check if already a member
    const { data: existingMember } = await supabase
      .from('organization_members')
      .select('user_id')
      .eq('org_id', orgId)
      .eq('user_id', typedExistingUser.id)
      .single();

    type MemberIdResult = { user_id: string };
    const typedExisting = existingMember as MemberIdResult | null;

    if (typedExisting) {
      return { success: false, error: 'User is already a member of this organization' };
    }
  }

  // Create invite
  const { data: invite, error: inviteError } = await supabase
    .from('invites')
    .insert({
      org_id: orgId,
      email,
      role,
      invited_by: user.id,
    } as any)
    .select()
    .single();

  type InviteResult = { id: string };
  const typedInvite = invite as InviteResult | null;

  if (inviteError || !typedInvite) {
    console.error('Error creating invite:', inviteError);
    return { success: false, error: 'Failed to create invite' };
  }

  // Log audit event
  await logAuditEvent(
    orgId,
    user.id,
    'member.invited',
    'invite',
    typedInvite.id,
    { email, role }
  );

  return { success: true, invite };
}

/**
 * Get active sessions for organization members
 */
export async function getActiveSessions(input: z.input<typeof orgIdSchema>) {
  const user = await requireAuth();
  const parsed = orgIdSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.message };
  }

  const { orgId } = parsed.data;
  const userRole = await getUserOrgRole(orgId, user.id);
  if (!userRole) {
    return { success: false, error: 'Not a member of this organization' };
  }

  // Get all org members
  const supabase = createClient();
  const { data: members, error: membersError } = await supabase
    .from('organization_members')
    .select(`
      user_id,
      user:user_id (
        id,
        email,
        full_name
      )
    `)
    .eq('org_id', orgId);

  if (membersError || !members) {
    return { success: false, error: 'Failed to fetch organization members' };
  }

  type SessionMemberResult = {
    user_id: string;
    user?: { id: string; email: string | null; full_name: string | null };
  };
  const typedSessionMembers = (members as SessionMemberResult[]) || [];

  // Get sessions for each member
  const serviceRole = getServiceRoleClient();
  const allSessions = [];

  for (const member of typedSessionMembers) {
    try {
  const { data: sessions } =
    (await (serviceRole.auth.admin as any).listUserSessions?.(member.user_id)) ?? { data: [] };
      if (sessions) {
        for (const session of sessions) {
          allSessions.push({
            id: session.id,
            userId: member.user_id,
            userEmail: member.user?.email || 'Unknown',
            userName: member.user?.full_name || 'Unknown',
            createdAt: session.created_at,
            updatedAt: session.updated_at,
            factorId: session.factor_id,
            aal: session.aal,
            isActive: true,
          });
        }
      }
    } catch (error) {
      console.error(`Error fetching sessions for user ${member.user_id}:`, error);
    }
  }

  return { success: true, sessions: allSessions };
}

/**
 * Revoke a specific session
 */
export async function revokeSession(input: z.input<typeof revokeSessionSchema>) {
  const user = await requireAuth();
  const parsed = revokeSessionSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.message };
  }

  const { sessionId, userId } = parsed.data;

  // Users can revoke their own sessions, owners/admins can revoke any session
  if (user.id !== userId) {
    // Need to check if user is owner/admin in any org where target user is a member
    const supabase = createClient();
    const { data: userOrgs } = await supabase
      .from('organization_members')
      .select('org_id, role')
      .eq('user_id', user.id);

    const { data: targetOrgs } = await supabase
      .from('organization_members')
      .select('org_id')
      .eq('user_id', userId);

    type OrgMemberResult = { org_id: string; role?: string };
    const typedUserOrgs = (userOrgs as OrgMemberResult[]) || [];
    const typedTargetOrgs = (targetOrgs as OrgMemberResult[]) || [];

    const sharedOrgs = typedUserOrgs.filter(uo =>
      typedTargetOrgs.some(to => to.org_id === uo.org_id) &&
      (uo.role === 'owner' || uo.role === 'admin')
    );

    if (!sharedOrgs || sharedOrgs.length === 0) {
      return { success: false, error: 'Insufficient permissions to revoke this session' };
    }
  }

  // Revoke session
  const serviceRole = getServiceRoleClient();
  const { error } = (await (serviceRole.auth.admin as any).deleteSession?.(sessionId)) ?? { error: null };

  if (error) {
    console.error('Error revoking session:', error);
    return { success: false, error: 'Failed to revoke session' };
  }

  // Log audit event (to all shared orgs)
  const supabase = createClient();
  const { data: targetOrgs } = await supabase
    .from('organization_members')
    .select('org_id')
    .eq('user_id', userId);

  type OrgIdResult = { org_id: string };
  const typedOrgs = (targetOrgs as OrgIdResult[]) || [];

  for (const org of typedOrgs) {
    await logAuditEvent(
      org.org_id,
      user.id,
      'session.revoked',
      'session',
      sessionId,
      { targetUserId: userId }
    );
  }

  return { success: true };
}

/**
 * Revoke all sessions for a user (owner only)
 */
export async function revokeAllUserSessions(orgId: string, userId: string) {
  const user = await requireAuth();
  const actorRole = await getUserOrgRole(orgId, user.id);
  
  if (actorRole !== 'owner') {
    return { success: false, error: 'Only owners can revoke all user sessions' };
  }

  const serviceRole = getServiceRoleClient();
  const { data: sessions } =
    (await (serviceRole.auth.admin as any).listUserSessions?.(userId)) ?? { data: [] };

  if (!sessions || sessions.length === 0) {
    return { success: true, count: 0 };
  }

  let revokedCount = 0;
  for (const session of sessions) {
    const { error } = (await (serviceRole.auth.admin as any).deleteSession?.(session.id)) ?? { error: null };
    if (!error) revokedCount++;
  }

  // Log audit event
  await logAuditEvent(
    orgId,
    user.id,
    'session.revoked_all',
    'user',
    userId,
    { count: revokedCount }
  );

  return { success: true, count: revokedCount };
}

/**
 * Get security events from audit logs
 */
export async function getSecurityEvents(input: z.input<typeof securityEventsSchema>) {
  const user = await requireAuth();
  const parsed = securityEventsSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.message };
  }

  const { orgId, limit, offset, eventType, userId, from, to } = parsed.data;
  const userRole = await getUserOrgRole(orgId, user.id);
  if (!userRole) {
    return { success: false, error: 'Not a member of this organization' };
  }

  const supabase = createClient();
  let query = supabase
    .from('audit_logs')
    .select('*', { count: 'exact' })
    .eq('org_id', orgId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  // Filter by security-related actions
  const securityActions = [
    'member.role_changed',
    'member.removed',
    'member.invited',
    'session.revoked',
    'session.revoked_all',
    'security.2fa_enforced',
    'security.password_policy_updated',
  ];

  if (eventType) {
    query = query.eq('action', eventType);
  } else {
    query = query.in('action', securityActions);
  }

  if (userId) {
    query = query.eq('actor_id', userId);
  }

  if (from) {
    query = query.gte('created_at', from);
  }

  if (to) {
    query = query.lte('created_at', to);
  }

  const { data, error, count } = await query;

  if (error) {
    console.error('Error fetching security events:', error);
    return { success: false, error: 'Failed to fetch security events' };
  }

  return {
    success: true,
    events: data || [],
    total: count || 0,
    hasMore: count ? offset + limit < count : false,
  };
}

/**
 * Get security statistics
 */
export async function getSecurityStats(input: z.input<typeof orgIdSchema>) {
  const user = await requireAuth();
  const parsed = orgIdSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.message };
  }

  const { orgId } = parsed.data;
  const userRole = await getUserOrgRole(orgId, user.id);
  if (!userRole) {
    return { success: false, error: 'Not a member of this organization' };
  }

  const supabase = createClient();
  
  // Get counts for last 24h, 7d, 30d
  const now = new Date();
  const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
  const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const last30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const securityActions = [
    'member.role_changed',
    'member.removed',
    'session.revoked',
    'session.revoked_all',
  ];

  const [events24h, events7d, events30d] = await Promise.all([
    supabase.from('audit_logs')
      .select('id', { count: 'exact', head: true })
      .eq('org_id', orgId)
      .in('action', securityActions)
      .gte('created_at', last24h),
    supabase.from('audit_logs')
      .select('id', { count: 'exact', head: true })
      .eq('org_id', orgId)
      .in('action', securityActions)
      .gte('created_at', last7d),
    supabase.from('audit_logs')
      .select('id', { count: 'exact', head: true })
      .eq('org_id', orgId)
      .in('action', securityActions)
      .gte('created_at', last30d),
  ]);

  return {
    success: true,
    stats: {
      last24h: events24h.count || 0,
      last7d: events7d.count || 0,
      last30d: events30d.count || 0,
    },
  };
}

/**
 * Get permissions matrix for the organization
 */
export async function getPermissionsMatrix(input: z.input<typeof orgIdSchema>) {
  const user = await requireAuth();
  const parsed = orgIdSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.message };
  }

  const { orgId } = parsed.data;
  const userRole = await getUserOrgRole(orgId, user.id);
  if (!userRole) {
    return { success: false, error: 'Not a member of this organization' };
  }

  // Return the standard RBAC permissions matrix
  const matrix = {
    owner: ['manage_org', 'manage_members', 'manage_roles', 'manage_security', 'view_audit', 'manage_sessions', 'view_content', 'edit_content'],
    admin: ['manage_members', 'view_audit', 'manage_sessions', 'view_content', 'edit_content'],
    editor: ['view_content', 'edit_content'],
    viewer: ['view_content'],
  };

  return { success: true, matrix };
}

/**
 * Enforce 2FA requirement for organization (owner only)
 */
export async function enforce2FA(input: z.input<typeof enforce2FASchema>) {
  const user = await requireAuth();
  const parsed = enforce2FASchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.message };
  }

  const { orgId, enabled } = parsed.data;
  const actorRole = await getUserOrgRole(orgId, user.id);
  
  if (actorRole !== 'owner') {
    return { success: false, error: 'Only owners can enforce 2FA requirements' };
  }

  const supabase = createClient();
  const { data: org, error: fetchError } = await supabase
    .from('organizations')
    .select('settings')
    .eq('id', orgId)
    .single();

  type OrgSettingsResult = { settings: Record<string, any> };
  const typedOrg = org as OrgSettingsResult | null;

  if (fetchError || !typedOrg) {
    return { success: false, error: 'Organization not found' };
  }

  const settings = (typedOrg.settings as Record<string, any>) || {};
  settings.require2FA = enabled;

  const updateResult3 = await supabase
    .from('organizations')
    // @ts-ignore - Supabase type inference issue with update
    .update({ settings })
    .eq('id', orgId);
  const { error: updateError } = updateResult3;

  if (updateError) {
    console.error('Error updating 2FA requirement:', updateError);
    return { success: false, error: 'Failed to update 2FA requirement' };
  }

  // Log audit event
  await logAuditEvent(
    orgId,
    user.id,
    'security.2fa_enforced',
    'organization',
    orgId,
    { enabled }
  );

  return { success: true };
}

/**
 * Update password policy for organization (owner only)
 */
export async function updatePasswordPolicy(input: z.input<typeof passwordPolicySchema>) {
  const user = await requireAuth();
  const parsed = passwordPolicySchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.message };
  }

  const { orgId, policy } = parsed.data;
  const actorRole = await getUserOrgRole(orgId, user.id);
  
  if (actorRole !== 'owner') {
    return { success: false, error: 'Only owners can update password policy' };
  }

  const supabase = createClient();
  const { data: org, error: fetchError } = await supabase
    .from('organizations')
    .select('settings')
    .eq('id', orgId)
    .single();

  type OrgSettingsResult = { settings: Record<string, any> };
  const typedOrg = org as OrgSettingsResult | null;

  if (fetchError || !typedOrg) {
    return { success: false, error: 'Organization not found' };
  }

  const settings = (typedOrg.settings as Record<string, any>) || {};
  settings.passwordPolicy = policy;

  const updateResult2 = await supabase
    .from('organizations')
    // @ts-ignore - Supabase type inference issue with update
    .update({ settings })
    .eq('id', orgId);
  const { error: updateError } = updateResult2;

  if (updateError) {
    console.error('Error updating password policy:', updateError);
    return { success: false, error: 'Failed to update password policy' };
  }

  // Log audit event
  await logAuditEvent(
    orgId,
    user.id,
    'security.password_policy_updated',
    'organization',
    orgId,
    { policy }
  );

  return { success: true };
}
