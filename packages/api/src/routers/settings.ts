import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { requireMember, requireOwner } from '../middleware/accessGuard';
import type {
  UserSettings,
  OrgSettings,
  DEFAULT_USER_SETTINGS,
  DEFAULT_ORG_SETTINGS,
  ThemePreference,
} from '@starter/types';

// Mock store for offline mode
declare const settingsStore: {
  getUserSettings: (userId: string) => UserSettings | null;
  updateUserSettings: (userId: string, settings: Partial<UserSettings>) => UserSettings;
  getOrgSettings: (orgId: string) => OrgSettings | null;
  updateOrgSettings: (orgId: string, settings: Record<string, any>) => OrgSettings;
  resetUserSettings: (userId: string) => UserSettings;
  resetOrgSettings: (orgId: string) => OrgSettings;
};

const isOfflineMode = process.env.TEMPLATE_OFFLINE === '1' || !process.env.NEXT_PUBLIC_SUPABASE_URL;

// Default settings constants
const defaultUserSettings: Omit<UserSettings, 'user_id' | 'created_at' | 'updated_at'> = {
  theme: 'system',
  language: 'en',
  timezone: 'UTC',
  email_notifications: {
    marketing: true,
    features: true,
    security: true,
    updates: true,
  },
  push_notifications: {
    enabled: false,
    browser: false,
    mobile: false,
  },
};

const defaultOrgSettings = {
  features: {},
  limits: {},
  integrations: {},
};

export const settingsRouter = createTRPCRouter({
  /**
   * Get user settings with defaults if not exists
   * @param userId - User ID (optional, defaults to current user)
   * @returns User settings with defaults applied
   * @throws {TRPCError} FORBIDDEN if trying to access another user's settings
   * @permission User can only access their own settings
   * @example
   * const settings = await trpc.settings.getUserSettings.query()
   * const otherSettings = await trpc.settings.getUserSettings.query({ userId: '...' })
   */
  getUserSettings: protectedProcedure
    .input(
      z.object({
        userId: z.string().uuid('Invalid user ID').optional(),
      }).optional()
    )
    .query(async ({ ctx, input }): Promise<UserSettings> => {
      const targetUserId = input?.userId || ctx.user.id;

      // Users can only access their own settings
      if (targetUserId !== ctx.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You can only access your own settings',
        });
      }

      if (isOfflineMode) {
        const settings = settingsStore.getUserSettings(targetUserId);
        
        if (!settings) {
          // Return defaults if not found
          return {
            user_id: targetUserId,
            ...defaultUserSettings,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          } as UserSettings;
        }
        
        return settings;
      }

      // Fetch user settings
      const { data: settings, error } = await ctx.supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', targetUserId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch user settings',
        });
      }

      // Return settings or defaults if not found
      if (!settings) {
        return {
          user_id: targetUserId,
          ...defaultUserSettings,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as UserSettings;
      }

      return settings;
    }),

  /**
   * Update user settings (upsert pattern - creates if not exists)
   * @param theme - Theme preference (light, dark, system)
   * @param language - Language code
   * @param timezone - Timezone string
   * @param emailNotifications - Email notification preferences
   * @param pushNotifications - Push notification preferences
   * @returns Updated user settings
   * @permission User can only update their own settings
   * @example
   * await trpc.settings.updateUserSettings.mutate({ theme: 'dark', language: 'es' })
   */
  updateUserSettings: protectedProcedure
    .input(
      z.object({
        theme: z.enum(['light', 'dark', 'system']).optional(),
        language: z.string().optional(),
        timezone: z.string().optional(),
        emailNotifications: z.object({
          marketing: z.boolean().optional(),
          features: z.boolean().optional(),
          security: z.boolean().optional(),
          updates: z.boolean().optional(),
        }).optional(),
        pushNotifications: z.object({
          enabled: z.boolean().optional(),
          browser: z.boolean().optional(),
          mobile: z.boolean().optional(),
        }).optional(),
      })
    )
    .mutation(async ({ ctx, input }): Promise<UserSettings> => {
      if (isOfflineMode) {
        return settingsStore.updateUserSettings(ctx.user.id, input);
      }

      // Prepare update data
      const updateData: any = {};
      
      if (input.theme !== undefined) updateData.theme = input.theme;
      if (input.language !== undefined) updateData.language = input.language;
      if (input.timezone !== undefined) updateData.timezone = input.timezone;
      
      // Handle JSONB fields - merge with existing
      if (input.emailNotifications !== undefined) {
        // Fetch current settings to merge
        const { data: current } = await ctx.supabase
          .from('user_settings')
          .select('email_notifications')
          .eq('user_id', ctx.user.id)
          .single();
        
        updateData.email_notifications = {
          ...(current?.email_notifications || defaultUserSettings.email_notifications),
          ...input.emailNotifications,
        };
      }
      
      if (input.pushNotifications !== undefined) {
        // Fetch current settings to merge
        const { data: current } = await ctx.supabase
          .from('user_settings')
          .select('push_notifications')
          .eq('user_id', ctx.user.id)
          .single();
        
        updateData.push_notifications = {
          ...(current?.push_notifications || defaultUserSettings.push_notifications),
          ...input.pushNotifications,
        };
      }

      // Upsert user settings
      const { data: settings, error } = await ctx.supabase
        .from('user_settings')
        .upsert(
          {
            user_id: ctx.user.id,
            ...updateData,
          },
          {
            onConflict: 'user_id',
          }
        )
        .select()
        .single();

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update user settings',
        });
      }

      return settings;
    }),

  /**
   * Get organization settings
   * @param orgId - Organization ID
   * @returns Organization settings with defaults if not exists
   * @throws {TRPCError} FORBIDDEN if user is not a member of the organization
   * @permission Requires member role or higher
   * @example
   * const orgSettings = await trpc.settings.getOrgSettings.query({ orgId: '...' })
   */
  getOrgSettings: protectedProcedure
    .use(requireMember({ orgIdSource: 'input', orgIdField: 'orgId' }))
    .input(
      z.object({
        orgId: z.string().uuid('Invalid organization ID'),
      })
    )
    .query(async ({ ctx, input }): Promise<OrgSettings> => {
      if (isOfflineMode) {
        const settings = settingsStore.getOrgSettings(input.orgId);
        
        if (!settings) {
          return {
            org_id: input.orgId,
            settings: defaultOrgSettings,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          } as OrgSettings;
        }
        
        return settings;
      }

      // Fetch org settings
      const { data: settings, error } = await ctx.supabase
        .from('org_settings')
        .select('*')
        .eq('org_id', input.orgId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch organization settings',
        });
      }

      // Return settings or defaults if not found
      if (!settings) {
        return {
          org_id: input.orgId,
          settings: defaultOrgSettings,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as OrgSettings;
      }

      return settings;
    }),

  /**
   * Update organization settings (owner only, merges with existing)
   * @param orgId - Organization ID
   * @param settings - Settings object to merge
   * @returns Updated organization settings
   * @throws {TRPCError} FORBIDDEN if user is not the owner
   * @permission Requires owner role
   * @example
   * await trpc.settings.updateOrgSettings.mutate({ 
   *   orgId: '...', 
   *   settings: { features: { newFeature: true } } 
   * })
   */
  updateOrgSettings: protectedProcedure
    .use(requireOwner({ orgIdSource: 'input', orgIdField: 'orgId' }))
    .input(
      z.object({
        orgId: z.string().uuid('Invalid organization ID'),
        settings: z.record(z.any()),
      })
    )
    .mutation(async ({ ctx, input }): Promise<OrgSettings> => {
      if (isOfflineMode) {
        return settingsStore.updateOrgSettings(input.orgId, input.settings);
      }

      // Fetch current settings to merge
      const { data: current } = await ctx.supabase
        .from('org_settings')
        .select('settings')
        .eq('org_id', input.orgId)
        .single();

      // Deep merge settings
      const mergedSettings = {
        ...(current?.settings || defaultOrgSettings),
        ...input.settings,
      };

      // Upsert org settings
      const { data: settings, error } = await ctx.supabase
        .from('org_settings')
        .upsert(
          {
            org_id: input.orgId,
            settings: mergedSettings,
          },
          {
            onConflict: 'org_id',
          }
        )
        .select()
        .single();

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update organization settings',
        });
      }

      return settings;
    }),

  /**
   * Reset settings to defaults
   * @param scope - Settings scope (user or org)
   * @param orgId - Organization ID (required for org scope)
   * @returns Success status
   * @throws {TRPCError} FORBIDDEN if user lacks permission
   * @throws {TRPCError} BAD_REQUEST if orgId missing for org scope
   * @permission User scope: user only, Org scope: owner only
   * @example
   * await trpc.settings.resetToDefaults.mutate({ scope: 'user' })
   * await trpc.settings.resetToDefaults.mutate({ scope: 'org', orgId: '...' })
   */
  resetToDefaults: protectedProcedure
    .input(
      z.object({
        scope: z.enum(['user', 'org']),
        orgId: z.string().uuid('Invalid organization ID').optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (input.scope === 'org') {
        if (!input.orgId) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Organization ID is required for org scope',
          });
        }

        // Check owner permission
        const { data: membership } = await ctx.supabase
          .from('organization_members')
          .select('role')
          .eq('org_id', input.orgId)
          .eq('user_id', ctx.user.id)
          .single();

        if (!membership || membership.role !== 'owner') {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Only owners can reset organization settings',
          });
        }

        if (isOfflineMode) {
          settingsStore.resetOrgSettings(input.orgId);
          return { success: true };
        }

        // Reset org settings
        const { error } = await ctx.supabase
          .from('org_settings')
          .upsert(
            {
              org_id: input.orgId,
              settings: defaultOrgSettings,
            },
            {
              onConflict: 'org_id',
            }
          );

        if (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to reset organization settings',
          });
        }

        return { success: true };
      }

      // User scope - reset user settings
      if (isOfflineMode) {
        settingsStore.resetUserSettings(ctx.user.id);
        return { success: true };
      }

      const { error } = await ctx.supabase
        .from('user_settings')
        .upsert(
          {
            user_id: ctx.user.id,
            ...defaultUserSettings,
          },
          {
            onConflict: 'user_id',
          }
        );

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to reset user settings',
        });
      }

      return { success: true };
    }),
});
