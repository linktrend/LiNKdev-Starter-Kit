# Environment Setup

This guide explains how to configure required environment variables for Supabase and Stripe. The application validates these variables at startup (skipped when `NODE_ENV === "test"`). Validation fails fast on missing required variables and logs warnings for optional ones.

## Required Variables

### Supabase
- `NEXT_PUBLIC_SUPABASE_URL` — project URL (e.g., https://xxxxx.supabase.co)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — anonymous/public key
- `SUPABASE_SERVICE_ROLE_KEY` — service role key (webhooks and admin operations)

### Stripe
- `STRIPE_SECRET_KEY` — secret key (test or live)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` — publishable key (test or live)
- `STRIPE_WEBHOOK_SECRET` — webhook signing secret
- `STRIPE_PRICE_PRO_MONTHLY` — price ID for Pro monthly
- `STRIPE_PRICE_PRO_ANNUAL` — price ID for Pro annual
- `STRIPE_PRICE_BUSINESS_MONTHLY` — price ID for Business monthly
- `STRIPE_PRICE_BUSINESS_ANNUAL` — price ID for Business annual
- `STRIPE_PRICE_ENTERPRISE` — price ID for Enterprise

### Application
- `NEXT_PUBLIC_SITE_URL` — optional; used for redirects and emails (defaults to http://localhost:3000)

### Optional
- `STRIPE_PRICE_FREE` — price ID for Free plan (defaults to `price_free` if absent)
- `NEXT_PUBLIC_SITE_URL` — optional override for public URL in non-local setups

## Where to Find Each Value

### Supabase
1) Create or open your project in Supabase.  
2) Go to Settings → API to copy `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.  
3) In the same page, copy `SUPABASE_SERVICE_ROLE_KEY`. Store securely.  
4) (Optional) For GitHub OAuth in local dev, use the local redirect: `http://127.0.0.1:54321/auth/v1/callback` and set client ID/secret under Settings → Authentication → Providers.

### Stripe
1) In Stripe Dashboard, use the test mode toggle for development.  
2) Developers → API keys: copy `STRIPE_SECRET_KEY` (sk_test_...) and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (pk_test_...).  
3) Developers → Webhooks: create or select your webhook endpoint and copy `STRIPE_WEBHOOK_SECRET` (whsec_...).  
4) Products: create products/prices for Pro, Business, and Enterprise plans; copy each price ID into the corresponding `STRIPE_PRICE_*` variable.

## Stripe Test Mode Setup
- Keep the test mode toggle enabled while developing.  
- Create price IDs in test mode; they start with `price_`.  
- Use the CLI or Dashboard to view webhook signing secrets for local tunnels (e.g., `stripe listen --forward-to localhost:3000/api/webhooks/stripe`).  
- Switch to live keys and live price IDs only for production deployments.

## Supabase Setup Notes
- Ensure Row Level Security (RLS) policies match your schema for auth-related tables.  
- Service role key must not be exposed to the browser; keep it server-side only.  
- For local dev, `NEXT_PUBLIC_SITE_URL` should match your running frontend origin (default: http://localhost:3000).

## Running Validation
- Validation runs automatically on startup (except in tests) from `apps/web/src/lib/stripe/server.ts`.  
- To check manually, run the web app:  
  - `pnpm --filter ./apps/web dev`  
- Expected outcomes:  
  - Missing required var → process exits with a clear error listing each missing variable, description, and example when provided.  
  - Missing optional var → startup logs warnings but continues.  
  - All vars present → logs “Environment variables validated successfully”.

## Troubleshooting
- Verify `.env.local` is loaded (Next.js loads it automatically).  
- Check for typos and stray whitespace; keys are case-sensitive.  
- Ensure the webhook secret matches the environment (test vs live).  
- If running in CI, inject required vars via the provider’s secret store.  
- When adding new Stripe prices, update `.env.example` and your local `.env.local` to keep validation passing.
