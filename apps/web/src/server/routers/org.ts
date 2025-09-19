import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { createTRPCRouter, protectedProcedure } from '@/server/api/root';
import { 
  CreateOrgInput, 
  InviteUserInput, 
  UpdateMemberRoleInput, 
  RemoveMemberInput, 
  AcceptInviteInput, 
  SetCurrentOrgInput,
  Organization,
  OrganizationMember,
  Invite,
  OrgRole
} from '@/types/org';
import { 
  generateInviteToken, 
  getInviteExpiryDate, 
  isInviteExpired,
  canManageMembers,
  canManageInvites,
  canChangeRole
} from '@/utils/org';
import { orgStore } from '../mocks/org.store';

const isOfflineMode = process.env.TEMPLATE_OFFLINE === '1' || !process.env.NEXT_PUBLIC_SUPABASE_URL;

export const orgRouter = createTRPCRouter({
  // Organization Management
  createOrg: protectedProcedure
    .input(z.object({
      name: z.string().min(1, 'Organization name is required').max(100, 'Name too long'),
    }))
    .mutation(async ({ ctx, input }) => {
      if (isOfflineMode) {
        const org: Organization = {
          id: `org-${Date.now()}`,
          name: input.name,
          owner_id: ctx.user.id,
          created_at: new Date().toISOString(),
        };
        
        const createdOrg = orgStore.createOrg(org, ctx.user.id);
        
        // Audit logging
        console.log('AUDIT: Organization created', {
          orgId: createdOrg.id,
          actorId: ctx.user.id,
          action: 'created',
          entityType: 'org',
          entityId: createdOrg.id,
          metadata: { name: createdOrg.name },
        });
        
        // Analytics
        ctx.posthog?.capture({
          distinctId: ctx.user.id,
          event: 'org_created',
          properties: {
            org_id: createdOrg.id,
            org_name: createdOrg.name,
          },
        });
        
        return createdOrg;
      }

      // Supabase implementation
      const { data: org, error } = await ctx.supabase
        .from('organizations')
        .insert({
          name: input.name,
          owner_id: ctx.user.id,
        })
        .select()
        .single();

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create organization',
        });
      }

      // Add owner as member
      const { error: memberError } = await ctx.supabase
        .from('organization_members')
        .insert({
          org_id: org.id,
          user_id: ctx.user.id,
          role: 'owner',
        });

      if (memberError) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to add owner membership',
        });
      }

      // Analytics
      ctx.posthog?.capture({
        distinctId: ctx.user.id,
        event: 'org_created',
        properties: {
          org_id: org.id,
          org_name: org.name,
        },
      });

      return org;
    }),

  listOrgs: protectedProcedure
    .query(async ({ ctx }) => {
      if (isOfflineMode) {
        const orgs = orgStore.listUserOrgs(ctx.user.id);
        return orgs;
      }

      // Supabase implementation
      const { data: memberships, error } = await ctx.supabase
        .from('organization_members')
        .select(`
          role,
          organizations (
            id,
            name,
            owner_id,
            created_at
          )
        `)
        .eq('user_id', ctx.user.id);

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch organizations',
        });
      }

      return memberships?.map(membership => ({
        ...membership.organizations,
        role: membership.role,
      })) || [];
    }),

  getCurrent: protectedProcedure
    .query(async ({ ctx }) => {
      if (isOfflineMode) {
        return orgStore.getCurrentOrg();
      }

      // Get from user context or session
      // This would typically be stored in user session/context
      return null; // Placeholder - implement based on your session management
    }),

  setCurrent: protectedProcedure
    .input(z.object({
      orgId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (isOfflineMode) {
        // Verify user is member of org
        if (!orgStore.isUserMember(input.orgId, ctx.user.id)) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Not a member of this organization',
          });
        }

        orgStore.setCurrentOrg(input.orgId);
        
        // Analytics
        ctx.posthog?.capture({
          distinctId: ctx.user.id,
          event: 'org_switched',
          properties: {
            org_id: input.orgId,
          },
        });

        return { success: true };
      }

      // Supabase implementation
      const { data: membership, error } = await ctx.supabase
        .from('organization_members')
        .select('org_id')
        .eq('org_id', input.orgId)
        .eq('user_id', ctx.user.id)
        .single();

      if (error || !membership) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Not a member of this organization',
        });
      }

      // Store in session/context
      // This would typically update user session
      
      // Analytics
      ctx.posthog?.capture({
        distinctId: ctx.user.id,
        event: 'org_switched',
        properties: {
          org_id: input.orgId,
        },
      });

      return { success: true };
    }),

  // Member Management
  listMembers: protectedProcedure
    .input(z.object({
      orgId: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      if (isOfflineMode) {
        return orgStore.listOrgMembers(input.orgId);
      }

      // Supabase implementation
      const { data: members, error } = await ctx.supabase
        .from('organization_members')
        .select(`
          user_id,
          role,
          created_at,
          user:user_id (
            id,
            email,
            user_metadata
          )
        `)
        .eq('org_id', input.orgId);

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch members',
        });
      }

      return members || [];
    }),

  updateMemberRole: protectedProcedure
    .input(z.object({
      orgId: z.string(),
      userId: z.string(),
      role: z.enum(['owner', 'admin', 'editor', 'viewer']),
    }))
    .mutation(async ({ ctx, input }) => {
      if (isOfflineMode) {
        const userRole = orgStore.getUserRole(input.orgId, ctx.user.id);
        if (!userRole || !canManageMembers(userRole)) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Insufficient permissions',
          });
        }

        const targetRole = orgStore.getUserRole(input.orgId, input.userId);
        if (!targetRole || !canChangeRole(targetRole, input.role, userRole)) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Cannot change role',
          });
        }

        const updatedMember = orgStore.updateMemberRole(input.orgId, input.userId, input.role);
        
        // Analytics
        ctx.posthog?.capture({
          distinctId: ctx.user.id,
          event: 'member_role_updated',
          properties: {
            org_id: input.orgId,
            target_user_id: input.userId,
            old_role: targetRole,
            new_role: input.role,
          },
        });

        return updatedMember;
      }

      // Supabase implementation
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

      // Analytics
      ctx.posthog?.capture({
        distinctId: ctx.user.id,
        event: 'member_role_updated',
        properties: {
          org_id: input.orgId,
          target_user_id: input.userId,
          new_role: input.role,
        },
      });

      return { success: true };
    }),

  removeMember: protectedProcedure
    .input(z.object({
      orgId: z.string(),
      userId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (isOfflineMode) {
        const userRole = orgStore.getUserRole(input.orgId, ctx.user.id);
        if (!userRole || !canManageMembers(userRole)) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Insufficient permissions',
          });
        }

        const removed = orgStore.removeMember(input.orgId, input.userId);
        
        // Analytics
        ctx.posthog?.capture({
          distinctId: ctx.user.id,
          event: 'member_removed',
          properties: {
            org_id: input.orgId,
            target_user_id: input.userId,
          },
        });

        return { success: removed };
      }

      // Supabase implementation
      const { error } = await ctx.supabase
        .from('organization_members')
        .delete()
        .eq('org_id', input.orgId)
        .eq('user_id', input.userId);

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to remove member',
        });
      }

      // Analytics
      ctx.posthog?.capture({
        distinctId: ctx.user.id,
        event: 'member_removed',
        properties: {
          org_id: input.orgId,
          target_user_id: input.userId,
        },
      });

      return { success: true };
    }),

  // Invitation System
  invite: protectedProcedure
    .input(z.object({
      orgId: z.string(),
      email: z.string().email('Invalid email address'),
      role: z.enum(['admin', 'editor', 'viewer']),
    }))
    .mutation(async ({ ctx, input }) => {
      if (isOfflineMode) {
        const userRole = orgStore.getUserRole(input.orgId, ctx.user.id);
        if (!userRole || !canManageInvites(userRole)) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Insufficient permissions',
          });
        }

        const token = generateInviteToken();
        const invite: Invite = {
          id: `invite-${Date.now()}`,
          org_id: input.orgId,
          email: input.email,
          role: input.role,
          token,
          status: 'pending',
          created_by: ctx.user.id,
          created_at: new Date().toISOString(),
          expires_at: getInviteExpiryDate(),
        };

        const createdInvite = orgStore.createInvite(invite);
        
        // Analytics
        ctx.posthog?.capture({
          distinctId: ctx.user.id,
          event: 'member_invited',
          properties: {
            org_id: input.orgId,
            invitee_email: input.email,
            role: input.role,
          },
        });

        return createdInvite;
      }

      // Supabase implementation
      const token = generateInviteToken();
      const { data: invite, error } = await ctx.supabase
        .from('invites')
        .insert({
          org_id: input.orgId,
          email: input.email,
          role: input.role,
          token,
          created_by: ctx.user.id,
          expires_at: getInviteExpiryDate(),
        })
        .select()
        .single();

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create invite',
        });
      }

      // Analytics
      ctx.posthog?.capture({
        distinctId: ctx.user.id,
        event: 'member_invited',
        properties: {
          org_id: input.orgId,
          invitee_email: input.email,
          role: input.role,
        },
      });

      return invite;
    }),

  acceptInvite: protectedProcedure
    .input(z.object({
      token: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (isOfflineMode) {
        const result = orgStore.acceptInvite(input.token, ctx.user.id);
        
        if (!result.success) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Invalid or expired invite',
          });
        }

        // Analytics
        ctx.posthog?.capture({
          distinctId: ctx.user.id,
          event: 'member_accepted',
          properties: {
            org_id: result.orgId,
            role: result.role,
          },
        });

        return { success: true, orgId: result.orgId, role: result.role };
      }

      // Supabase implementation
      const { data: invite, error } = await ctx.supabase
        .from('invites')
        .select('*')
        .eq('token', input.token)
        .eq('status', 'pending')
        .single();

      if (error || !invite) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Invalid or expired invite',
        });
      }

      if (isInviteExpired(invite.expires_at)) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Invite has expired',
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

      // Mark invite as accepted
      await ctx.supabase
        .from('invites')
        .update({ status: 'accepted' })
        .eq('id', invite.id);

      // Analytics
      ctx.posthog?.capture({
        distinctId: ctx.user.id,
        event: 'member_accepted',
        properties: {
          org_id: invite.org_id,
          role: invite.role,
        },
      });

      return { success: true, orgId: invite.org_id, role: invite.role };
    }),

  listInvites: protectedProcedure
    .input(z.object({
      orgId: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      if (isOfflineMode) {
        return orgStore.listOrgInvites(input.orgId);
      }

      // Supabase implementation
      const { data: invites, error } = await ctx.supabase
        .from('invites')
        .select('*')
        .eq('org_id', input.orgId)
        .eq('status', 'pending');

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch invites',
        });
      }

      return invites || [];
    }),

  revokeInvite: protectedProcedure
    .input(z.object({
      inviteId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (isOfflineMode) {
        const revoked = orgStore.revokeInvite(input.inviteId);
        return { success: revoked };
      }

      // Supabase implementation
      const { error } = await ctx.supabase
        .from('invites')
        .delete()
        .eq('id', input.inviteId);

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to revoke invite',
        });
      }

      return { success: true };
    }),
});
