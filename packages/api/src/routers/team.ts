import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { requireAdmin, requireOwner, requireMember } from '../middleware/accessGuard';
import { ROLE_PERMISSIONS, canChangeRole } from '../rbac';
import type {
  TeamInvite,
  SafeTeamInvite,
  AcceptTeamInviteResponse,
  RoleDefinition,
  AvailableRolesResponse,
  TeamSuccessResponse,
} from '@starter/types';

// Mock store for offline mode
declare const teamStore: {
  inviteMember: (orgId: string, email: string, role: string, invitedBy: string) => SafeTeamInvite;
  listInvites: (orgId: string) => SafeTeamInvite[];
  acceptInvite: (token: string, userId: string, userEmail: string) => { success: boolean; orgId: string; role: string };
  revokeInvite: (inviteId: string, orgId: string) => boolean;
  isUserMember: (orgId: string, userId: string) => boolean;
  getUserRole: (orgId: string, userId: string) => string | null;
};

declare const generateInviteToken: () => string;
declare const isInviteExpired: (expiresAt: string) => boolean;

const isOfflineMode = process.env.TEMPLATE_OFFLINE === '1' || !process.env.NEXT_PUBLIC_SUPABASE_URL;

export const teamRouter = createTRPCRouter({
  /**
   * Invite a member to the organization
   * @param orgId - Organization ID
   * @param email - Email address of the invitee
   * @param role - Role to assign (member or viewer)
   * @returns Team invite (without token for security)
   * @throws {TRPCError} FORBIDDEN if user is not admin/owner
   * @throws {TRPCError} BAD_REQUEST if email already invited or is member
   * @permission Requires admin (member) role or higher
   * @example
   * await trpc.team.inviteMember.mutate({ 
   *   orgId: '...', 
   *   email: 'user@example.com', 
   *   role: 'viewer' 
   * })
   */
  inviteMember: protectedProcedure
    .use(requireAdmin({ orgIdSource: 'input', orgIdField: 'orgId' }))
    .input(
      z.object({
        orgId: z.string().uuid('Invalid organization ID'),
        email: z.string().email('Invalid email address'),
        role: z.enum(['member', 'viewer']),
      })
    )
    .mutation(async ({ ctx, input }): Promise<SafeTeamInvite> => {
      if (isOfflineMode) {
        const invite = teamStore.inviteMember(input.orgId, input.email, input.role, ctx.user.id);
        return invite;
      }

      // Check if user is already a member
      const { data: existingMember } = await ctx.supabase
        .from('organization_members')
        .select('user_id')
        .eq('org_id', input.orgId)
        .eq('user_id', ctx.supabase.auth.user()?.id)
        .single();

      if (existingMember) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'User is already a member of this organization',
        });
      }

      // Check for existing pending invite
      const { data: existingInvite } = await ctx.supabase
        .from('team_invites')
        .select('id')
        .eq('org_id', input.orgId)
        .eq('email', input.email)
        .eq('status', 'pending')
        .single();

      if (existingInvite) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'An invitation has already been sent to this email',
        });
      }

      // Generate secure token
      const token = generateInviteToken ? generateInviteToken() : crypto.randomUUID();

      // Create invite
      const { data: invite, error } = await ctx.supabase
        .from('team_invites')
        .insert({
          org_id: input.orgId,
          email: input.email,
          role: input.role,
          token,
          invited_by: ctx.user.id,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'pending',
        })
        .select()
        .single();

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create invitation',
        });
      }

      // Return invite without token
      const { token: _, ...safeInvite } = invite;
      return safeInvite as SafeTeamInvite;
    }),

  /**
   * List pending invitations for an organization
   * @param orgId - Organization ID
   * @returns List of pending team invites
   * @throws {TRPCError} FORBIDDEN if user is not a member
   * @permission Requires member role or higher
   * @example
   * const invites = await trpc.team.listInvites.query({ orgId: '...' })
   */
  listInvites: protectedProcedure
    .use(requireMember({ orgIdSource: 'input', orgIdField: 'orgId' }))
    .input(
      z.object({
        orgId: z.string().uuid('Invalid organization ID'),
      })
    )
    .query(async ({ ctx, input }): Promise<SafeTeamInvite[]> => {
      if (isOfflineMode) {
        return teamStore.listInvites(input.orgId);
      }

      // Fetch pending invites
      const { data: invites, error } = await ctx.supabase
        .from('team_invites')
        .select('id, org_id, email, role, invited_by, expires_at, status, created_at')
        .eq('org_id', input.orgId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch invitations',
        });
      }

      return invites || [];
    }),

  /**
   * Accept a team invitation
   * @param token - Invitation token
   * @returns Success status with org and role info
   * @throws {TRPCError} NOT_FOUND if invite not found or expired
   * @throws {TRPCError} BAD_REQUEST if email doesn't match or already member
   * @permission Requires authentication
   * @example
   * const result = await trpc.team.acceptInvite.mutate({ token: '...' })
   */
  acceptInvite: protectedProcedure
    .input(
      z.object({
        token: z.string().min(1, 'Token is required'),
      })
    )
    .mutation(async ({ ctx, input }): Promise<AcceptTeamInviteResponse> => {
      const userEmail = ctx.user.email;

      if (!userEmail) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'User email is required to accept invitation',
        });
      }

      if (isOfflineMode) {
        const result = teamStore.acceptInvite(input.token, ctx.user.id, userEmail);
        
        if (!result.success) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Invalid or expired invitation',
          });
        }

        return result;
      }

      // Fetch invite
      const { data: invite, error: fetchError } = await ctx.supabase
        .from('team_invites')
        .select('*')
        .eq('token', input.token)
        .eq('status', 'pending')
        .single();

      if (fetchError || !invite) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Invalid or expired invitation',
        });
      }

      // Check if expired
      if (isInviteExpired && isInviteExpired(invite.expires_at)) {
        // Update status to expired
        await ctx.supabase
          .from('team_invites')
          .update({ status: 'expired' })
          .eq('id', invite.id);

        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'This invitation has expired',
        });
      }

      // Check if email matches
      if (invite.email.toLowerCase() !== userEmail.toLowerCase()) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'This invitation was sent to a different email address',
        });
      }

      // Check if already a member
      const { data: existingMember } = await ctx.supabase
        .from('organization_members')
        .select('user_id')
        .eq('org_id', invite.org_id)
        .eq('user_id', ctx.user.id)
        .single();

      if (existingMember) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'You are already a member of this organization',
        });
      }

      // Add user as member
      const { error: memberError } = await ctx.supabase
        .from('organization_members')
        .insert({
          org_id: invite.org_id,
          user_id: ctx.user.id,
          role: invite.role,
        });

      if (memberError) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to join organization',
        });
      }

      // Update invite status
      await ctx.supabase
        .from('team_invites')
        .update({ status: 'accepted' })
        .eq('id', invite.id);

      return {
        success: true,
        orgId: invite.org_id,
        role: invite.role,
      };
    }),

  /**
   * Revoke a team invitation
   * @param inviteId - Invitation ID
   * @param orgId - Organization ID
   * @returns Success status
   * @throws {TRPCError} FORBIDDEN if user is not admin/owner
   * @throws {TRPCError} NOT_FOUND if invite doesn't exist
   * @permission Requires admin (member) role or higher
   * @example
   * await trpc.team.revokeInvite.mutate({ inviteId: '...', orgId: '...' })
   */
  revokeInvite: protectedProcedure
    .use(requireAdmin({ orgIdSource: 'input', orgIdField: 'orgId' }))
    .input(
      z.object({
        inviteId: z.string().uuid('Invalid invitation ID'),
        orgId: z.string().uuid('Invalid organization ID'),
      })
    )
    .mutation(async ({ ctx, input }): Promise<TeamSuccessResponse> => {
      if (isOfflineMode) {
        const success = teamStore.revokeInvite(input.inviteId, input.orgId);
        
        if (!success) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Invitation not found',
          });
        }

        return { success: true };
      }

      // Update invite status to revoked
      const { error } = await ctx.supabase
        .from('team_invites')
        .update({ status: 'revoked' })
        .eq('id', input.inviteId)
        .eq('org_id', input.orgId);

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to revoke invitation',
        });
      }

      return { success: true };
    }),

  /**
   * Update a member's role in the organization
   * @param orgId - Organization ID
   * @param userId - User ID of the member
   * @param role - New role to assign
   * @returns Success status
   * @throws {TRPCError} FORBIDDEN if user is not owner or trying invalid role change
   * @throws {TRPCError} BAD_REQUEST if trying to change own role or demote owner
   * @permission Requires owner role
   * @example
   * await trpc.team.updateMemberRole.mutate({ 
   *   orgId: '...', 
   *   userId: '...', 
   *   role: 'member' 
   * })
   */
  updateMemberRole: protectedProcedure
    .use(requireOwner({ orgIdSource: 'input', orgIdField: 'orgId' }))
    .input(
      z.object({
        orgId: z.string().uuid('Invalid organization ID'),
        userId: z.string().uuid('Invalid user ID'),
        role: z.enum(['owner', 'member', 'viewer']),
      })
    )
    .mutation(async ({ ctx, input }): Promise<TeamSuccessResponse> => {
      // Cannot change own role
      if (input.userId === ctx.user.id) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'You cannot change your own role',
        });
      }

      if (isOfflineMode) {
        const targetRole = teamStore.getUserRole(input.orgId, input.userId);
        const actorRole = teamStore.getUserRole(input.orgId, ctx.user.id);
        
        if (!targetRole || !actorRole) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'User not found in organization',
          });
        }

        if (!canChangeRole(targetRole as any, input.role as any, actorRole as any)) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Cannot change this role',
          });
        }

        return { success: true };
      }

      // Get target user's current role
      const { data: targetMember, error: fetchError } = await ctx.supabase
        .from('organization_members')
        .select('role')
        .eq('org_id', input.orgId)
        .eq('user_id', input.userId)
        .single();

      if (fetchError || !targetMember) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found in organization',
        });
      }

      // Cannot demote an owner
      if (targetMember.role === 'owner' && input.role !== 'owner') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Cannot demote an owner. Transfer ownership first.',
        });
      }

      // Update role
      const { error } = await ctx.supabase
        .from('organization_members')
        .update({ role: input.role })
        .eq('org_id', input.orgId)
        .eq('user_id', input.userId);

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update member role',
        });
      }

      return { success: true };
    }),

  /**
   * Transfer organization ownership to another member
   * @param orgId - Organization ID
   * @param newOwnerId - User ID of the new owner
   * @returns Success status
   * @throws {TRPCError} FORBIDDEN if user is not current owner
   * @throws {TRPCError} BAD_REQUEST if target is not a member or is already owner
   * @permission Requires owner role
   * @example
   * await trpc.team.transferOwnership.mutate({ 
   *   orgId: '...', 
   *   newOwnerId: '...' 
   * })
   */
  transferOwnership: protectedProcedure
    .use(requireOwner({ orgIdSource: 'input', orgIdField: 'orgId' }))
    .input(
      z.object({
        orgId: z.string().uuid('Invalid organization ID'),
        newOwnerId: z.string().uuid('Invalid user ID'),
      })
    )
    .mutation(async ({ ctx, input }): Promise<TeamSuccessResponse> => {
      // Cannot transfer to self
      if (input.newOwnerId === ctx.user.id) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'You are already the owner',
        });
      }

      if (isOfflineMode) {
        const isTargetMember = teamStore.isUserMember(input.orgId, input.newOwnerId);
        
        if (!isTargetMember) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Target user is not a member of this organization',
          });
        }

        return { success: true };
      }

      // Verify target user is a member
      const { data: targetMember, error: fetchError } = await ctx.supabase
        .from('organization_members')
        .select('role')
        .eq('org_id', input.orgId)
        .eq('user_id', input.newOwnerId)
        .single();

      if (fetchError || !targetMember) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Target user is not a member of this organization',
        });
      }

      if (targetMember.role === 'owner') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Target user is already an owner',
        });
      }

      // Update organization owner_id
      const { error: orgError } = await ctx.supabase
        .from('organizations')
        .update({ owner_id: input.newOwnerId })
        .eq('id', input.orgId);

      if (orgError) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to transfer ownership',
        });
      }

      // Update new owner's role
      const { error: newOwnerError } = await ctx.supabase
        .from('organization_members')
        .update({ role: 'owner' })
        .eq('org_id', input.orgId)
        .eq('user_id', input.newOwnerId);

      if (newOwnerError) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update new owner role',
        });
      }

      // Demote current owner to member
      const { error: oldOwnerError } = await ctx.supabase
        .from('organization_members')
        .update({ role: 'member' })
        .eq('org_id', input.orgId)
        .eq('user_id', ctx.user.id);

      if (oldOwnerError) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update previous owner role',
        });
      }

      return { success: true };
    }),

  /**
   * Get list of available roles with their permissions
   * @returns List of role definitions
   * @permission Requires authentication
   * @example
   * const { roles } = await trpc.team.listAvailableRoles.query()
   */
  listAvailableRoles: protectedProcedure
    .query(async (): Promise<AvailableRolesResponse> => {
      const roles: RoleDefinition[] = [
        {
          id: 'owner',
          name: 'Owner',
          description: 'Full access to organization settings, billing, and members',
          permissions: ROLE_PERMISSIONS.owner,
        },
        {
          id: 'member',
          name: 'Member',
          description: 'Can manage members, invites, and edit content',
          permissions: ROLE_PERMISSIONS.member,
        },
        {
          id: 'viewer',
          name: 'Viewer',
          description: 'Read-only access to organization content',
          permissions: ROLE_PERMISSIONS.viewer,
        },
      ];

      return { roles };
    }),
});
