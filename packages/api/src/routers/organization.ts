import { z } from 'zod';
import type { Database, OrgRole } from '@starter/types';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { fromSupabase, forbiddenError, notFoundError } from '../lib/errors';
import {
  ensureCanChangeRole,
  ensureCanManageMembers,
  requireOrgMember,
  requireOrgRole,
} from '../lib/permissions';
import { isRoleHigher } from '../rbac';
import { auditCreate, auditUpdate, auditDelete, auditRoleChange } from '../middleware/audit';

const orgTypeSchema = z.enum(['personal', 'business', 'family', 'education', 'other']).optional();

const createOrgInput = z.object({
  name: z.string().min(1).max(100),
  orgType: orgTypeSchema,
  description: z.string().max(500).nullable().optional(),
});

const updateOrgInput = z.object({
  orgId: z.string().min(1),
  name: z.string().min(1).max(100),
  orgType: orgTypeSchema,
  description: z.string().max(500).nullable().optional(),
});

const memberRoleSchema = z.enum(['admin', 'editor', 'viewer']);

const memberInput = z.object({
  orgId: z.string().min(1),
  userId: z.string().min(1),
});

const addMemberInput = memberInput.extend({
  role: memberRoleSchema,
});

const updateMemberRoleInput = addMemberInput;

function slugify(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

export const organizationRouter = createTRPCRouter({
  /**
   * List organizations the authenticated user belongs to.
   */
  list: protectedProcedure.query(async ({ ctx }) => {
    const { data, error } = await ctx.supabase
      .from('organization_members')
      .select(
        `
        role,
        org_id,
        organizations (
          id,
          name,
          slug,
          org_type,
          is_personal,
          description,
          avatar_url,
          owner_id,
          settings,
          created_at,
          updated_at
        )
      `,
      )
      .eq('user_id', ctx.user.id);

    if (error) {
      throw fromSupabase(error, 'Failed to fetch organizations');
    }

    const memberships =
      (data ?? []) as Array<{
        role: OrgRole | null;
        organizations: Database['public']['Tables']['organizations']['Row'] | null;
      }>;

    return memberships.map((membership) => ({
      ...(membership.organizations ?? {}),
      role: membership.role as OrgRole,
    }));
  }),

  /**
   * Get organization details by ID for the authenticated user.
   */
  getById: protectedProcedure
    .input(z.object({ orgId: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from('organization_members')
        .select(
          `
          role,
          organizations (
            id,
            name,
            slug,
            org_type,
            is_personal,
            description,
            avatar_url,
            owner_id,
            settings,
            created_at,
            updated_at
          )
        `,
        )
        .eq('org_id', input.orgId)
        .eq('user_id', ctx.user.id)
        .single();

      if (error || !data) {
        throw notFoundError('Organization not found or inaccessible');
      }

      const orgData = data as {
        role: OrgRole | null;
        organizations: Database['public']['Tables']['organizations']['Row'] | null;
      };

      return {
        ...(orgData.organizations ?? {}),
        role: orgData.role as OrgRole,
      };
    }),

  /**
   * Create a new organization and assign the current user as owner.
   */
  create: protectedProcedure
    .input(createOrgInput)
    .use(auditCreate('org', (result) => result.id))
    .mutation(async ({ ctx, input }) => {
      const slug = slugify(input.name);

      const { data: org, error: orgError } = await ctx.supabase
        .from('organizations')
        .insert({
          name: input.name,
          slug,
          org_type: input.orgType ?? 'business',
          is_personal: input.orgType === 'personal' ? true : false,
          owner_id: ctx.user.id,
          description: input.description ?? null,
          settings: {},
        })
        .select()
        .single();

      if (orgError || !org) {
        throw fromSupabase(orgError, 'Failed to create organization');
      }

      const { error: memberError } = await ctx.supabase
        .from('organization_members')
        .upsert({
          org_id: org.id,
          user_id: ctx.user.id,
          role: 'owner',
        })
        .select()
        .single();

      if (memberError) {
        // attempt cleanup to avoid orphaned org
        await ctx.supabase.from('organizations').delete().eq('id', org.id);
        throw fromSupabase(memberError, 'Failed to add owner membership');
      }

      return org;
    }),

  /**
   * Update organization metadata (owner/admin only).
   */
  update: protectedProcedure
    .input(updateOrgInput)
    .use(auditUpdate('org', 'orgId'))
    .mutation(async ({ ctx, input }) => {
      await requireOrgRole(ctx.supabase, input.orgId, ctx.user.id, 'admin');

      const updatePayload: Record<string, unknown> = {
        name: input.name,
      };

      if (input.orgType) {
        updatePayload.org_type = input.orgType;
        updatePayload.is_personal = input.orgType === 'personal';
      }

      if (input.description !== undefined) {
        updatePayload.description = input.description;
      }

      const { data, error } = await ctx.supabase
        .from('organizations')
        .update(updatePayload)
        .eq('id', input.orgId)
        .select()
        .single();

      if (error || !data) {
        throw fromSupabase(error, 'Failed to update organization');
      }

      return data;
    }),

  /**
   * Delete an organization (owner only).
   */
  delete: protectedProcedure
    .input(z.object({ orgId: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      await requireOrgRole(ctx.supabase, input.orgId, ctx.user.id, 'owner');

      const { error } = await ctx.supabase
        .from('organizations')
        .delete()
        .eq('id', input.orgId)
        .eq('owner_id', ctx.user.id);

      if (error) {
        throw fromSupabase(error, 'Failed to delete organization');
      }

      return { success: true };
    }),

  /**
   * List members of an organization the user belongs to.
   */
  listMembers: protectedProcedure
    .input(z.object({ orgId: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      await requireOrgMember(ctx.supabase, input.orgId, ctx.user.id);

      const { data, error } = await ctx.supabase
        .from('organization_members')
        .select(
          `
          user_id,
          role,
          created_at,
          user:user_id (
            id,
            email,
            full_name,
            avatar_url
          )
        `,
        )
        .eq('org_id', input.orgId);

      if (error) {
        throw fromSupabase(error, 'Failed to fetch members');
      }

      return data ?? [];
    }),

  /**
   * Add a member to an organization (owner/admin).
   */
  addMember: protectedProcedure
    .input(addMemberInput)
    .use(auditCreate('member', (result) => result.user_id, { orgIdField: 'orgId' }))
    .mutation(async ({ ctx, input }) => {
      await ensureCanManageMembers(ctx.supabase, input.orgId, ctx.user.id);

      const { data, error } = await ctx.supabase
        .from('organization_members')
        .upsert(
          {
            org_id: input.orgId,
            user_id: input.userId,
            role: input.role,
          },
          { onConflict: 'org_id,user_id' },
        )
        .select()
        .single();

      if (error) {
        throw fromSupabase(error, 'Failed to add member');
      }

      return data;
    }),

  /**
   * Remove a member (owner/admin) from the organization.
   */
  removeMember: protectedProcedure
    .input(memberInput)
    .use(auditDelete('member', 'userId', { orgIdField: 'orgId' }))
    .mutation(async ({ ctx, input }) => {
      const actorRole = await ensureCanManageMembers(ctx.supabase, input.orgId, ctx.user.id);

      const { data: target, error: targetError } = await ctx.supabase
        .from('organization_members')
        .select('role')
        .eq('org_id', input.orgId)
        .eq('user_id', input.userId)
        .single();

      if (targetError || !target) {
        throw notFoundError('Member not found');
      }

      if (target.role === 'owner') {
        throw forbiddenError('Cannot remove organization owner');
      }

      if (!isRoleHigher(actorRole, target.role as OrgRole)) {
        throw forbiddenError('Insufficient permissions to remove this member');
      }

      const { error } = await ctx.supabase
        .from('organization_members')
        .delete()
        .eq('org_id', input.orgId)
        .eq('user_id', input.userId);

      if (error) {
        throw fromSupabase(error, 'Failed to remove member');
      }

      return { success: true };
    }),

  /**
   * Update a member's role (owner only).
   */
  updateMemberRole: protectedProcedure
    .input(updateMemberRoleInput)
    .use(auditRoleChange('member', 'userId', { orgIdField: 'orgId' }))
    .mutation(async ({ ctx, input }) => {
      const { data: target, error: targetError } = await ctx.supabase
        .from('organization_members')
        .select('role')
        .eq('org_id', input.orgId)
        .eq('user_id', input.userId)
        .single();

      if (targetError || !target) {
        throw notFoundError('Member not found');
      }

      await ensureCanChangeRole(
        ctx.supabase,
        input.orgId,
        ctx.user.id,
        target.role as OrgRole,
        input.role,
      );

      const { data, error } = await ctx.supabase
        .from('organization_members')
        .update({ role: input.role })
        .eq('org_id', input.orgId)
        .eq('user_id', input.userId)
        .select()
        .single();

      if (error) {
        throw fromSupabase(error, 'Failed to update member role');
      }

      return data;
    }),
});
