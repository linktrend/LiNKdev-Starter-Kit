import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { fromSupabase, notFoundError } from '../lib/errors';
import { createAuditMiddleware } from '../middleware/audit';

const updateProfileInput = z
  .object({
    full_name: z.string().min(1).max(120).optional(),
    display_name: z.string().min(1).max(120).optional(),
    avatar_url: z.string().url().optional(),
    bio: z.string().max(500).optional(),
    first_name: z.string().min(1).max(120).optional(),
    last_name: z.string().min(1).max(120).optional(),
    onboarding_completed: z.boolean().optional(),
    profile_completed: z.boolean().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: 'At least one field must be provided',
  });

export const userRouter = createTRPCRouter({
  /**
   * Fetch the authenticated user's profile.
   */
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const { data, error } = await ctx.supabase
      .from('users')
      .select('*')
      .eq('id', ctx.user.id)
      .single();

    if (error || !data) {
      throw notFoundError('User not found');
    }

    return data;
  }),

  /**
   * Update the authenticated user's profile fields.
   *
   * NOTE: User profile updates are audited only when the user is in an
   * organization context (orgId available). For user-level audit logs
   * (not org-scoped), consider implementing a separate user_audit_logs
   * table in the future.
   *
   * TODO: Implement user-level audit logs for profile changes outside
   * of organization context. See docs/AUDIT_OPERATIONS.md for details.
   */
  updateProfile: protectedProcedure
    .input(updateProfileInput)
    .use(createAuditMiddleware({
      action: 'updated',
      entityType: 'user',
      entityIdFromResult: (result) => result.id,
      captureMetadata: (input) => ({ fields_updated: Object.keys(input) }),
    }))
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from('users')
        // cast to any to avoid friction if generated types lag DB schema
        .update(input as Record<string, unknown>)
        .eq('id', ctx.user.id)
        .select()
        .single();

      if (error) {
        throw fromSupabase(error, 'Failed to update profile');
      }

      return data;
    }),

  /**
   * Delete the authenticated user's account.
   */
  deleteAccount: protectedProcedure
    .use(createAuditMiddleware({
      action: 'deleted',
      entityType: 'user',
      entityIdFromResult: (result) => result.userId,
    }))
    .mutation(async ({ ctx }) => {
      const userId = ctx.user.id;
      const { error } = await ctx.supabase.from('users').delete().eq('id', userId);

      if (error) {
        throw fromSupabase(error, 'Failed to delete account');
      }

      return { success: true, userId };
    }),
});
