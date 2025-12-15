# Environment Setup

This guide explains how to configure all environment variables for the LTM Starter Kit, where to get each credential, and how validation works.

## Quick start

1) Copy the template and work from it:

```bash
cp .env.example .env
```

2) Fill the required values (see the sections below for sources and example values).

3) Start the app (`pnpm dev:web`). The Zod validator in `apps/web/src/lib/env.ts` runs on startup and will fail fast if required values are missing.

## Core variables by service

### Supabase (required)
- `NEXT_PUBLIC_SUPABASE_URL`: Project URL (Project Settings → API → Project URL).
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: anon/public API key (Project Settings → API → Project API keys).
- `SUPABASE_SERVICE_ROLE_KEY`: service role key (same page, never expose publicly).
- `SUPABASE_URL`: same as project URL, used by tooling/MCP.
- `DATABASE_URL` (optional): local Postgres URL for CLI/migrations.

### Supabase auth providers (optional)
Used only if you enable OAuth in Supabase auth settings (Project Settings → Authentication → Providers):
- `SUPABASE_AUTH_EXTERNAL_GITHUB_CLIENT_ID`
- `SUPABASE_AUTH_EXTERNAL_GITHUB_SECRET`
- `SUPABASE_AUTH_EXTERNAL_GITHUB_REDIRECT_URI`
- `SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID`
- `SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET`
- `SUPABASE_AUTH_EXTERNAL_GOOGLE_REDIRECT_URI`
- `SUPABASE_AUTH_SMS_TWILIO_AUTH_TOKEN` (if enabling Twilio SMS)

### Supabase S3 / experimental storage (optional)
Only needed if you enable the experimental Oriole/S3 storage in `apps/web/supabase/config.toml`:
- `S3_HOST`
- `S3_REGION`
- `S3_ACCESS_KEY`
- `S3_SECRET_KEY`

### Stripe (required for billing)
- `STRIPE_SECRET_KEY` / `STRIPE_SECRET_KEY_LIVE`: API secret keys (Stripe Dashboard → Developers → API keys).
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` / `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_LIVE`: publishable keys for the client.
- `STRIPE_WEBHOOK_SECRET`: signing secret from your webhook endpoint (Developers → Webhooks).
- Price IDs used by the app:
  - `STRIPE_PRO_MONTHLY_PRICE_ID`, `STRIPE_PRO_YEARLY_PRICE_ID`
  - `STRIPE_ENTERPRISE_MONTHLY_PRICE_ID`, `STRIPE_ENTERPRISE_YEARLY_PRICE_ID`
  - `STRIPE_PRO_MONTHLY_PLAN_ID` (legacy helper in `config/subscriptions.ts`)
  - Optional helpers: `STRIPE_PRICE_FREE`, `STRIPE_FREE_PRICE_ID`, `STRIPE_PRICE_PRO_MONTHLY`, `STRIPE_PRICE_PRO_ANNUAL`, `STRIPE_PRICE_BUSINESS_MONTHLY`, `STRIPE_PRICE_BUSINESS_ANNUAL`, `STRIPE_PRICE_ENTERPRISE`
- `BILLING_OFFLINE`: set to `1` to skip Stripe in template/offline mode.

### Email (Resend)
- `RESEND_API_KEY`: from https://resend.com/api-keys. Required in production.

### Automation / Webhooks / Cron
- `N8N_WEBHOOK_URL`: target URL for automation deliveries.
- `N8N_WEBHOOK_SECRET`: shared secret for signing/validating automation webhooks.
- `WEBHOOK_TOLERANCE_SEC`: signature tolerance in seconds (default `300`).
- `CRON_SECRET`: bearer token expected by cron endpoints (optional for local dev).

### Analytics / Observability
- `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST`: PostHog public client keys/host.
- `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_DSN`: Sentry DSNs (client/server).
- `SENTRY_ENVIRONMENT`: environment tag for Sentry events.
- `TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`: Cloudflare Turnstile keys (optional).

### Feature flags / modes
- `TEMPLATE_OFFLINE`: set `1` to bypass external services for local/offline development.
- `NEXT_PUBLIC_ENABLE_LABS`: enable Labs UI experiments (`true`/`false`).
- `NEXT_PUBLIC_DEFAULT_ORG_ID`: optional default org id for console dev tasks.
- `NEXT_PUBLIC_SUPPORT_ENABLED`: toggle the support widget (`true`/`false`).

### Storage & rate limiting
- `FILES_BUCKET`: storage bucket name (default `files`).
- `STORAGE_SIGNED_URL_TTL`: signed URL TTL in seconds (default `3600`).
- `STORAGE_OFFLINE`: skip storage calls when `true`.
- `STORAGE_MAX_FILE_SIZE_MB`: max upload size in MB (default `10`).
- `STORAGE_ALLOWED_TYPES`: comma-separated MIME types allowed for uploads.
- `RATE_LIMIT_DEFAULT_PER_MIN`, `RATE_LIMIT_WINDOW_MS`: default rate limit values.

### MCP tooling (development helpers)
- `FIGMA_ACCESS_TOKEN`: token for the Figma MCP server.
- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`: also read by the Supabase/Stripe MCP servers when you run them locally.

### App URLs
- `NEXT_PUBLIC_APP_URL`: canonical public URL used in links/emails.
- `NEXT_PUBLIC_SITE_URL`: server-side callback base URL override.
- `NEXT_PUBLIC_VERCEL_URL`: Vercel-provided hostname (no protocol) used as fallback.
- `PORT`: optional port override for local dev.

## Getting the credentials
- **Supabase**: `Project Settings → API` for URL and keys; `Authentication → Providers` for OAuth credentials. Update `apps/web/supabase/config.toml` env placeholders if you enable SMS or OAuth providers.
- **Stripe**: `Developers → API keys` for secret/publishable keys, `Developers → Products` for price IDs, and `Developers → Webhooks` for the webhook signing secret.
- **Resend**: `https://resend.com/api-keys` for the API key; configure a verified domain for your sender.
- **n8n**: Use the URL of your n8n webhook and generate a long secret for `N8N_WEBHOOK_SECRET`.

## Validation behavior
- Validation lives in `apps/web/src/lib/env.ts` and runs on module import. Missing required vars throw before the app starts.
- Offline switches:
  - `TEMPLATE_OFFLINE=1` relaxes Supabase requirements.
  - `BILLING_OFFLINE=1` relaxes Stripe requirements.
- In production, `RESEND_API_KEY` is enforced.

## Verification checklist
- Copy `.env.example` → `.env` and fill the values above.
- Start the app: `pnpm dev:web` (fails fast if required env is missing).
- Test webhook endpoints with the shared secrets you configured.
