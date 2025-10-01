import { z } from "zod";

/** Template-friendly env: all optional with sensible dev fallbacks */
const ClientEnv = z.object({
  NEXT_PUBLIC_APP_URL: z.string().optional(),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
  NEXT_PUBLIC_POSTHOG_KEY: z.string().optional(),
  NEXT_PUBLIC_POSTHOG_HOST: z.string().optional(),
  NEXT_PUBLIC_SENTRY_DSN: z.string().optional(),
  // Support Widget Configuration
  NEXT_PUBLIC_SUPPORT_ENABLED: z.string().optional(),
  // OAuth Provider Configuration
  NEXT_PUBLIC_GOOGLE_CLIENT_ID: z.string().optional(),
  NEXT_PUBLIC_GITHUB_CLIENT_ID: z.string().optional(),
});
const ServerEnv = z.object({
  VERCEL_URL: z.string().optional(),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  STRIPE_PRO_MONTHLY_PLAN_ID: z.string().optional(),
  SENTRY_DSN: z.string().optional(),
  SENTRY_ENVIRONMENT: z.string().optional(),
  TURNSTILE_SITE_KEY: z.string().optional(),
  TURNSTILE_SECRET_KEY: z.string().optional(),
  NODE_ENV: z.string().optional(),
  // Storage configuration
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  STORAGE_MAX_FILE_SIZE_MB: z.string().optional().default("10"),
  STORAGE_ALLOWED_TYPES: z.string().optional().default("image/jpeg,image/png,image/webp,image/gif,application/pdf,text/plain"),
  // Webhook configuration
  WEBHOOK_TOLERANCE_SEC: z.string().optional().default("300"),
  N8N_WEBHOOK_SECRET: z.string().optional(),
  // Email service configuration
  RESEND_API_KEY: z.string().optional(),
});

export const env = {
  ...ClientEnv.parse(process.env),
  ...ServerEnv.parse(process.env),
};
