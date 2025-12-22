import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { fromSupabase, notFoundError } from '../lib/errors';

const preferencesSchema = z.record(z.string(), z.any()).refine(
  () => true,
  { message: 'Preferences must be an object' },
);

export const profileRouter = createTRPCRouter({
  /**
   * Return onboarding/progress flags for the authenticated user.
   */
  getOnboardingStatus: protectedProcedure.query(async ({ ctx }) => {
    const { data, error } = await ctx.supabase
      .from('users')
      .select('id, onboarding_completed, profile_completed, preferences')
      .eq('id', ctx.user.id)
      .single();

    if (error || !data) {
      throw notFoundError('User not found');
    }

    return {
      onboardingCompleted: data.onboarding_completed ?? false,
      profileCompleted: data.profile_completed ?? false,
      preferences: (data as Record<string, unknown>).preferences ?? null,
    };
  }),

  /**
   * Mark onboarding/profile steps as completed.
   */
  completeProfile: protectedProcedure.mutation(async ({ ctx }) => {
    const { data, error } = await ctx.supabase
      .from('users')
      .update({
        onboarding_completed: true,
        profile_completed: true,
      })
      .eq('id', ctx.user.id)
      .select('onboarding_completed, profile_completed')
      .single();

    if (error || !data) {
      throw fromSupabase(error, 'Failed to complete profile');
    }

    return {
      onboardingCompleted: data.onboarding_completed ?? true,
      profileCompleted: data.profile_completed ?? true,
    };
  }),

  /**
   * Update user preferences JSON blob.
   */
  updatePreferences: protectedProcedure
    .input(
      z.object({
        preferences: preferencesSchema,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from('users')
        .update({ preferences: input.preferences } as Record<string, unknown>)
        .eq('id', ctx.user.id)
        .select('id, preferences')
        .single();

      if (error) {
        throw fromSupabase(error, 'Failed to update preferences');
      }

      return data;
    }),
});
