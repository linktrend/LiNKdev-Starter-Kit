import type { Tables } from './db';

/**
 * Theme preference options
 */
export type ThemePreference = 'light' | 'dark' | 'system';

/**
 * User settings record from `public.user_settings`
 */
export type UserSettings = Tables<'user_settings'>;

/**
 * Organization settings record from `public.org_settings`
 */
export type OrgSettings = Tables<'org_settings'>;

/**
 * Email notification preferences by category
 */
export interface EmailNotificationPreferences {
  marketing: boolean;
  features: boolean;
  security: boolean;
  updates: boolean;
}

/**
 * Push notification preferences
 */
export interface PushNotificationPreferences {
  enabled: boolean;
  browser: boolean;
  mobile: boolean;
}

/**
 * Default user settings values
 */
export const DEFAULT_USER_SETTINGS: Omit<UserSettings, 'user_id' | 'created_at' | 'updated_at'> = {
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

/**
 * Default organization settings values
 */
export const DEFAULT_ORG_SETTINGS = {
  features: {},
  limits: {},
  integrations: {},
};

/**
 * Input for updating user settings
 */
export interface UpdateUserSettingsInput {
  userId?: string; // Optional, defaults to current user
  theme?: ThemePreference;
  language?: string;
  timezone?: string;
  emailNotifications?: Partial<EmailNotificationPreferences>;
  pushNotifications?: Partial<PushNotificationPreferences>;
}

/**
 * Input for getting user settings
 */
export interface GetUserSettingsInput {
  userId?: string; // Optional, defaults to current user
}

/**
 * Input for getting org settings
 */
export interface GetOrgSettingsInput {
  orgId: string;
}

/**
 * Input for updating org settings
 */
export interface UpdateOrgSettingsInput {
  orgId: string;
  settings: Record<string, any>;
}

/**
 * Settings scope for reset operation
 */
export type SettingsScope = 'user' | 'org';

/**
 * Input for resetting settings to defaults
 */
export interface ResetSettingsInput {
  scope: SettingsScope;
  orgId?: string; // Required for org scope
}

/**
 * Reset settings response
 */
export interface ResetSettingsResponse {
  success: boolean;
}
