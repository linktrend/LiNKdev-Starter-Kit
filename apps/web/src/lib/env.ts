import { z } from "zod";

/**
 * Centralized environment validation for the web app.
 * Uses Zod to validate at module load so failures happen fast during startup.
 */
const clientSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
  NEXT_PUBLIC_VERCEL_URL: z.string().optional(),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string(),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_LIVE: z.string().optional(),
  NEXT_PUBLIC_POSTHOG_KEY: z.string().optional(),
  NEXT_PUBLIC_POSTHOG_HOST: z.string().optional(),
  NEXT_PUBLIC_SENTRY_DSN: z.string().optional(),
  NEXT_PUBLIC_ENABLE_LABS: z.enum(["true", "false"]).optional(),
  NEXT_PUBLIC_DEFAULT_ORG_ID: z.string().optional(),
  NEXT_PUBLIC_SUPPORT_ENABLED: z.enum(["true", "false"]).optional(),
  NEXT_PUBLIC_GOOGLE_CLIENT_ID: z.string().optional(),
  NEXT_PUBLIC_GITHUB_CLIENT_ID: z.string().optional(),
});

const serverSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).optional(),
  PORT: z.string().optional(),
  VERCEL_URL: z.string().optional(),

  // Supabase
  SUPABASE_SERVICE_ROLE_KEY: z.string(),
  SUPABASE_URL: z.string().url().optional(), // tooling / MCP
  DATABASE_URL: z.string().optional(),

  // Storage
  FILES_BUCKET: z.string().default("files"),
  STORAGE_SIGNED_URL_TTL: z.string().default("3600"),
  STORAGE_OFFLINE: z.enum(["true", "false", "1", "0"]).optional(),
  STORAGE_MAX_FILE_SIZE_MB: z.string().default("10"),
  STORAGE_ALLOWED_TYPES: z
    .string()
    .default(
      "image/jpeg,image/png,image/webp,image/gif,application/pdf,text/plain"
    ),

  // Stripe
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_SECRET_KEY_LIVE: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  STRIPE_PRO_MONTHLY_PLAN_ID: z.string().optional(),
  STRIPE_PRO_MONTHLY_PRICE_ID: z.string().optional(),
  STRIPE_PRO_YEARLY_PRICE_ID: z.string().optional(),
  STRIPE_ENTERPRISE_MONTHLY_PRICE_ID: z.string().optional(),
  STRIPE_ENTERPRISE_YEARLY_PRICE_ID: z.string().optional(),
  STRIPE_PRICE_FREE: z.string().optional(),
  STRIPE_FREE_PRICE_ID: z.string().optional(),
  STRIPE_PRICE_PRO_MONTHLY: z.string().optional(),
  STRIPE_PRICE_PRO_ANNUAL: z.string().optional(),
  STRIPE_PRICE_BUSINESS_MONTHLY: z.string().optional(),
  STRIPE_PRICE_BUSINESS_ANNUAL: z.string().optional(),
  STRIPE_PRICE_ENTERPRISE: z.string().optional(),
  BILLING_OFFLINE: z.enum(["1", "0"]).optional(),

  // Automation / webhooks / cron
  TEMPLATE_OFFLINE: z.enum(["1", "0"]).optional(),
  N8N_WEBHOOK_URL: z.string().url().optional(),
  N8N_WEBHOOK_SECRET: z.string().optional(),
  WEBHOOK_TOLERANCE_SEC: z.string().default("300"),
  CRON_SECRET: z.string().optional(),

  // Email (Resend)
  RESEND_API_KEY: z.string().optional(),

  // Observability
  SENTRY_DSN: z.string().optional(),
  SENTRY_ENVIRONMENT: z.string().optional(),
  TURNSTILE_SITE_KEY: z.string().optional(),
  TURNSTILE_SECRET_KEY: z.string().optional(),

  // Feature flags / rate limiting
  RATE_LIMIT_DEFAULT_PER_MIN: z.string().optional(),
  RATE_LIMIT_WINDOW_MS: z.string().optional(),

  // Supabase auth providers / SMS
  SUPABASE_AUTH_SMS_TWILIO_AUTH_TOKEN: z.string().optional(),
  SUPABASE_AUTH_EXTERNAL_GITHUB_CLIENT_ID: z.string().optional(),
  SUPABASE_AUTH_EXTERNAL_GITHUB_SECRET: z.string().optional(),
  SUPABASE_AUTH_EXTERNAL_GITHUB_REDIRECT_URI: z.string().optional(),
  SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID: z.string().optional(),
  SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET: z.string().optional(),
  SUPABASE_AUTH_EXTERNAL_GOOGLE_REDIRECT_URI: z.string().optional(),

  // S3 (Supabase experimental)
  S3_HOST: z.string().optional(),
  S3_REGION: z.string().optional(),
  S3_ACCESS_KEY: z.string().optional(),
  S3_SECRET_KEY: z.string().optional(),

  // MCP tooling
  FIGMA_ACCESS_TOKEN: z.string().optional(),
});

const envSchema = clientSchema.merge(serverSchema).superRefine((env, ctx) => {
  const isTemplateOffline = env.TEMPLATE_OFFLINE === "1";
  const isBillingOffline = env.BILLING_OFFLINE === "1" || isTemplateOffline;

  if (!isTemplateOffline) {
    if (!env.NEXT_PUBLIC_SUPABASE_URL) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["NEXT_PUBLIC_SUPABASE_URL"],
        message: "NEXT_PUBLIC_SUPABASE_URL is required unless TEMPLATE_OFFLINE=1",
      });
    }
    if (!env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["NEXT_PUBLIC_SUPABASE_ANON_KEY"],
        message:
          "NEXT_PUBLIC_SUPABASE_ANON_KEY is required unless TEMPLATE_OFFLINE=1",
      });
    }
    if (!env.SUPABASE_SERVICE_ROLE_KEY) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["SUPABASE_SERVICE_ROLE_KEY"],
        message:
          "SUPABASE_SERVICE_ROLE_KEY is required unless TEMPLATE_OFFLINE=1",
      });
    }
  }

  if (!isBillingOffline) {
    if (!env.STRIPE_SECRET_KEY && !env.STRIPE_SECRET_KEY_LIVE) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["STRIPE_SECRET_KEY"],
        message:
          "Provide STRIPE_SECRET_KEY or STRIPE_SECRET_KEY_LIVE unless BILLING_OFFLINE=1",
      });
    }
    if (
      !env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY &&
      !env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_LIVE
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"],
        message:
          "Provide NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY or NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_LIVE unless BILLING_OFFLINE=1",
      });
    }
    if (!env.STRIPE_WEBHOOK_SECRET) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["STRIPE_WEBHOOK_SECRET"],
        message: "STRIPE_WEBHOOK_SECRET is required unless BILLING_OFFLINE=1",
      });
    }
    if (!env.STRIPE_PRO_MONTHLY_PRICE_ID || !env.STRIPE_PRO_YEARLY_PRICE_ID) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["STRIPE_PRO_MONTHLY_PRICE_ID"],
        message:
          "Stripe Pro price IDs are required (STRIPE_PRO_MONTHLY_PRICE_ID, STRIPE_PRO_YEARLY_PRICE_ID) unless BILLING_OFFLINE=1",
      });
    }
    if (
      !env.STRIPE_ENTERPRISE_MONTHLY_PRICE_ID ||
      !env.STRIPE_ENTERPRISE_YEARLY_PRICE_ID
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["STRIPE_ENTERPRISE_MONTHLY_PRICE_ID"],
        message:
          "Stripe Enterprise price IDs are required (STRIPE_ENTERPRISE_MONTHLY_PRICE_ID, STRIPE_ENTERPRISE_YEARLY_PRICE_ID) unless BILLING_OFFLINE=1",
      });
    }
  }

  if (
    env.NODE_ENV === "production" &&
    !isTemplateOffline &&
    !env.RESEND_API_KEY
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["RESEND_API_KEY"],
      message: "RESEND_API_KEY is required in production",
    });
  }
});

export const env = envSchema.parse(process.env);
export type Env = z.infer<typeof envSchema>;
