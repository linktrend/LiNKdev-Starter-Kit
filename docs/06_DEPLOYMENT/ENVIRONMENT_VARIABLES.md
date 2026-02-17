# Environment Variables Reference

> Current default billing tiers are `Free`, `Pro`, and `Business`.  
> If this document mentions `Enterprise`, treat it as historical context and follow `docs/00_OPERATOR_LIBRARY/README.md`.

**Complete reference for all environment variables in the LiNKdev Starter Kit**

---

## Table of Contents

1. [Overview](#overview)
2. [Required Variables](#required-variables)
3. [Optional Variables](#optional-variables)
4. [Service-Specific Variables](#service-specific-variables)
5. [Validation](#validation)
6. [Environment-Specific Configuration](#environment-specific-configuration)
7. [Security Best Practices](#security-best-practices)
8. [Troubleshooting](#troubleshooting)

---

## Overview

The LiNKdev Starter Kit uses environment variables for configuration. All variables are validated on application startup using Zod schemas. Missing required variables will cause the application to fail fast with clear error messages.

### Variable Naming Convention

- **`NEXT_PUBLIC_*`** - Exposed to browser/client-side code
- **`*_KEY`** - API keys and secrets
- **`*_URL`** - Service URLs
- **`*_SECRET`** - Webhook secrets and tokens

### Validation

Environment variables are validated in `apps/web/src/lib/env/validation.ts`:

- **Required variables** - Application exits if missing
- **Optional variables** - Warning logged, app continues
- **Invalid values** - Error message with expected format

---

## Required Variables

### Supabase (Required)

| Variable | Description | Example | Where to Find |
|----------|-------------|---------|---------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | `https://xxxxx.supabase.co` | Project Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anonymous/public API key | `your-anon-key` | Project Settings → API → Project API keys → anon public |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (server-only) | `your-service-role-key` | Project Settings → API → Service role key |

**Security Note:** `SUPABASE_SERVICE_ROLE_KEY` bypasses RLS and should **never** be exposed to the browser.

**Example:**
```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

---

### Stripe (Required for Billing)

| Variable | Description | Example | Where to Find |
|----------|-------------|---------|---------------|
| `STRIPE_SECRET_KEY` | Stripe secret API key | `sk_test_...` or `sk_live_...` | Developers → API keys → Secret key |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | `pk_test_...` or `pk_live_...` | Developers → API keys → Publishable key |
| `STRIPE_WEBHOOK_SECRET` | Webhook signing secret | `whsec_...` | Developers → Webhooks → Select endpoint → Signing secret |
| `STRIPE_PRICE_PRO_MONTHLY` | Pro monthly price ID | `price_...` | Products → Pro plan → Monthly price → Copy ID |
| `STRIPE_PRICE_PRO_ANNUAL` | Pro annual price ID | `price_...` | Products → Pro plan → Annual price → Copy ID |
| `STRIPE_PRICE_BUSINESS_MONTHLY` | Business monthly price ID | `price_...` | Products → Business plan → Monthly price → Copy ID |
| `STRIPE_PRICE_BUSINESS_ANNUAL` | Business annual price ID | `price_...` | Products → Business plan → Annual price → Copy ID |
| `STRIPE_PRICE_ENTERPRISE` | Enterprise price ID | `price_...` | Products → Enterprise plan → Copy ID |

**Example:**
```bash
STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
STRIPE_PRICE_PRO_MONTHLY=price_1AbCdEf...
STRIPE_PRICE_PRO_ANNUAL=price_1AbCdEf...
STRIPE_PRICE_BUSINESS_MONTHLY=price_1AbCdEf...
STRIPE_PRICE_BUSINESS_ANNUAL=price_1AbCdEf...
STRIPE_PRICE_ENTERPRISE=price_1AbCdEf...
```

---

## Optional Variables

### Application URLs

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `NEXT_PUBLIC_SITE_URL` | Public site URL (for redirects, emails) | `http://localhost:3000` | `https://yourdomain.com` |
| `NEXT_PUBLIC_APP_URL` | Alternative app URL | Same as `NEXT_PUBLIC_SITE_URL` | `https://app.yourdomain.com` |
| `NEXT_PUBLIC_VERCEL_URL` | Vercel deployment URL (auto-set) | Auto-detected | `https://your-app.vercel.app` |

---

### Supabase (Optional)

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `SUPABASE_URL` | Supabase URL for tooling/MCP | Same as `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxxx.supabase.co` |
| `DATABASE_URL` | Direct PostgreSQL connection string | Not set | `postgresql://postgres:[password]@db.xxxxx.supabase.co:5432/postgres` |

---

### Stripe (Optional)

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `STRIPE_SECRET_KEY_LIVE` | Live mode secret key (alternative) | Not set | `sk_live_...` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_LIVE` | Live mode publishable key (alternative) | Not set | `pk_live_...` |
| `STRIPE_PRICE_FREE` | Free plan price ID | `price_free` | `price_...` |
| `STRIPE_FREE_PRICE_ID` | Alternative free plan price ID | Same as `STRIPE_PRICE_FREE` | `price_...` |
| `BILLING_OFFLINE` | Skip Stripe validation (dev only) | `0` | `1` to enable |

---

## Service-Specific Variables

### Email (Resend)

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `RESEND_API_KEY` | Resend API key | Yes (production) | `re_AbCdEf123456...` |

**Setup:**
1. Go to [resend.com/api-keys](https://resend.com/api-keys)
2. Create new API key
3. Copy key → `RESEND_API_KEY`

---

### Analytics (PostHog)

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `NEXT_PUBLIC_POSTHOG_KEY` | PostHog project API key | No | `phc_AbCdEf123456...` |
| `NEXT_PUBLIC_POSTHOG_HOST` | PostHog host URL | No | `https://app.posthog.com` or `https://us.i.posthog.com` |

**Setup:**
1. Go to [posthog.com](https://posthog.com)
2. Create project
3. Copy Project API Key → `NEXT_PUBLIC_POSTHOG_KEY`
4. Copy Host → `NEXT_PUBLIC_POSTHOG_HOST`

**Default:** PostHog only initializes in production or when explicitly configured.

---

### Error Tracking (Sentry)

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry DSN (client-side) | No | `https://...@sentry.io/...` |
| `SENTRY_DSN` | Sentry DSN (server-side) | No | `https://...@sentry.io/...` |
| `SENTRY_ENVIRONMENT` | Environment tag | No | `production`, `staging`, `development` |

**Setup:**
1. Go to [sentry.io](https://sentry.io)
2. Create project (Next.js)
3. Copy DSN → `NEXT_PUBLIC_SENTRY_DSN` and `SENTRY_DSN`
4. Set environment → `SENTRY_ENVIRONMENT=production`

**Default:** Sentry only initializes in production or when explicitly configured.

---

### Storage (Supabase Storage)

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `FILES_BUCKET` | Storage bucket name | `files` | `user-uploads` |
| `STORAGE_SIGNED_URL_TTL` | Signed URL TTL (seconds) | `3600` | `7200` |
| `STORAGE_OFFLINE` | Skip storage calls | `false` | `true` |
| `STORAGE_MAX_FILE_SIZE_MB` | Max upload size (MB) | `10` | `50` |
| `STORAGE_ALLOWED_TYPES` | Allowed MIME types (comma-separated) | Not set | `image/jpeg,image/png,application/pdf` |

---

### Automation & Webhooks

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `N8N_WEBHOOK_URL` | n8n webhook target URL | Not set | `https://n8n.example.com/webhook/...` |
| `N8N_WEBHOOK_SECRET` | n8n webhook signing secret | Not set | `your-secret-key` |
| `WEBHOOK_TOLERANCE_SEC` | Webhook signature tolerance (seconds) | `300` | `600` |
| `CRON_SECRET` | Cron endpoint bearer token | Not set | `your-cron-secret` |

---

### Rate Limiting

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `RATE_LIMIT_DEFAULT_PER_MIN` | Default rate limit (requests/minute) | `60` | `100` |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window (milliseconds) | `60000` | `30000` |

---

### Feature Flags

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `NEXT_PUBLIC_ENABLE_LABS` | Enable Labs UI experiments | `false` | `true` |
| `NEXT_PUBLIC_DEFAULT_ORG_ID` | Default org ID for console dev | Not set | `00000000-0000-0000-0000-000000000001` |
| `NEXT_PUBLIC_SUPPORT_ENABLED` | Enable support widget | `false` | `true` |
| `TEMPLATE_OFFLINE` | Bypass external services (dev only) | `0` | `1` |

---

### OAuth Providers (Optional)

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Google OAuth client ID | No | `123456789-abc...` |
| `NEXT_PUBLIC_GITHUB_CLIENT_ID` | GitHub OAuth client ID | No | `Iv1.abc123...` |
| `SUPABASE_AUTH_EXTERNAL_GITHUB_CLIENT_ID` | Supabase GitHub client ID | No | `Iv1.abc123...` |
| `SUPABASE_AUTH_EXTERNAL_GITHUB_SECRET` | Supabase GitHub secret | No | `abc123...` |
| `SUPABASE_AUTH_EXTERNAL_GITHUB_REDIRECT_URI` | GitHub redirect URI | No | `https://xxxxx.supabase.co/auth/v1/callback` |
| `SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID` | Supabase Google client ID | No | `123456789-abc...` |
| `SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET` | Supabase Google secret | No | `abc123...` |
| `SUPABASE_AUTH_EXTERNAL_GOOGLE_REDIRECT_URI` | Google redirect URI | No | `https://xxxxx.supabase.co/auth/v1/callback` |

---

### Cloudflare Turnstile (Optional)

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `TURNSTILE_SITE_KEY` | Turnstile site key | No | `0x4AAAAAA...` |
| `TURNSTILE_SECRET_KEY` | Turnstile secret key | No | `0x4AAAAAA...` |

---

## Validation

### Validation Process

Environment variables are validated on application startup in `apps/web/src/lib/env/validation.ts`:

```typescript
// Validation runs automatically on import
import { validateEnvironment } from '@/lib/env/validation';

// Called during app initialization
validateEnvironment();
```

### Validation Output

**Success:**
```bash
✅ Environment variables validated successfully
```

**Missing Required Variable:**
```bash
❌ Environment Variable Validation Failed:

  Missing required environment variable: NEXT_PUBLIC_SUPABASE_URL
  Description: Supabase project URL (e.g., https://xxxxx.supabase.co)

Please check your .env.local file and ensure all required variables are set.
See .env.example for reference.
```

**Missing Optional Variable:**
```bash
⚠️  Environment Variable Warnings:

  Missing optional environment variable: RESEND_API_KEY
  Description: Resend API key for email delivery
```

### Skipping Validation

**For Testing:**
```bash
# Skip validation in test environment
NODE_ENV=test
```

**For Offline Development:**
```bash
# Skip Stripe validation
BILLING_OFFLINE=1

# Skip template validation
TEMPLATE_OFFLINE=1

# Skip storage validation
STORAGE_OFFLINE=true
```

---

## Environment-Specific Configuration

### Development

**Local `.env.local` file:**
```bash
# Supabase (test project)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Stripe (test mode)
STRIPE_SECRET_KEY=your_stripe_secret_key_test
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key_test
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Application
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Optional (for testing)
RESEND_API_KEY=re_test_...
NEXT_PUBLIC_POSTHOG_KEY=phc_test_...
NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...
SENTRY_ENVIRONMENT=development
```

### Preview (Vercel)

**Vercel Environment Variables → Preview:**
```bash
# Use test Stripe keys
STRIPE_SECRET_KEY=your_stripe_secret_key_test
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key_test

# Use preview URL
NEXT_PUBLIC_SITE_URL=https://your-app-git-branch.vercel.app

# Use preview environment tags
SENTRY_ENVIRONMENT=preview
```

### Production (Vercel)

**Vercel Environment Variables → Production:**
```bash
# Use live Stripe keys
STRIPE_SECRET_KEY=your_stripe_secret_key_live
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key_live

# Use production URL
NEXT_PUBLIC_SITE_URL=https://yourdomain.com

# Use production environment tags
SENTRY_ENVIRONMENT=production
```

---

## Security Best Practices

### 1. Never Commit Secrets

**❌ Don't:**
```bash
# Never commit .env files
git add .env.local
git commit -m "Add env vars"
```

**✅ Do:**
```bash
# Add to .gitignore
echo ".env.local" >> .gitignore
echo ".env.*.local" >> .gitignore
```

### 2. Use Environment-Specific Keys

- **Development:** Use test Stripe keys
- **Preview:** Use test Stripe keys
- **Production:** Use live Stripe keys

### 3. Rotate Keys Regularly

- Rotate service role keys quarterly
- Rotate API keys after security incidents
- Rotate webhook secrets when compromised

### 4. Limit Access

- Only grant access to production variables to trusted team members
- Use Vercel's team access controls
- Audit who has access to sensitive variables

### 5. Use Vercel's Encryption

- Vercel automatically encrypts environment variables
- Never store secrets in code or config files
- Use Vercel's environment variable UI

### 6. Monitor for Leaks

- Regularly audit environment variable usage
- Check logs for exposed secrets
- Use secret scanning tools

---

## Troubleshooting

### Issue: "Missing required environment variable"

**Symptoms:**
- Application fails to start
- Error message lists missing variables

**Solutions:**
1. Check `.env.local` file exists in `apps/web/` directory
2. Verify variable names match exactly (case-sensitive)
3. Remove extra whitespace around values
4. Restart dev server after changes
5. Check Vercel environment variables are set (for deployments)

### Issue: "Environment variable not loading"

**Symptoms:**
- Variables set but not accessible
- `undefined` values in code

**Solutions:**
1. Ensure `.env.local` is in correct directory (`apps/web/`)
2. Restart dev server after adding variables
3. Check for typos in variable names
4. Verify `NEXT_PUBLIC_*` prefix for client-side variables
5. Check Vercel environment variable scope (Production/Preview/Development)

### Issue: "Stripe keys not working"

**Symptoms:**
- Stripe API calls fail
- Authentication errors

**Solutions:**
1. Verify using correct key type (test vs live)
2. Check key format (`sk_test_...` or `sk_live_...`)
3. Ensure keys match Stripe dashboard
4. Verify webhook secret matches endpoint

### Issue: "Supabase connection fails"

**Symptoms:**
- Database queries fail
- Authentication errors

**Solutions:**
1. Verify `NEXT_PUBLIC_SUPABASE_URL` is correct
2. Check `SUPABASE_SERVICE_ROLE_KEY` is service role (not anon key)
3. Ensure Supabase project is active
4. Check network connectivity
5. Verify RLS policies allow access

### Issue: "PostHog/Sentry not initializing"

**Symptoms:**
- No analytics events
- No error tracking

**Solutions:**
1. Check API keys are set correctly
2. Verify keys are valid (not placeholders)
3. Check environment (only initializes in production by default)
4. Review browser console for initialization warnings
5. Verify `NEXT_PUBLIC_*` prefix for client-side keys

---

## Quick Reference

### Minimum Required Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_PRO_MONTHLY=
STRIPE_PRICE_PRO_ANNUAL=
STRIPE_PRICE_BUSINESS_MONTHLY=
STRIPE_PRICE_BUSINESS_ANNUAL=
STRIPE_PRICE_ENTERPRISE=
```

### Complete Example

See `apps/web/.env.example` for a complete example with all variables.

---

## Next Steps

- **Deployment Guide:** [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
- **Monitoring:** [MONITORING.md](./MONITORING.md)
- **Environment Setup:** [../01_GETTING_STARTED/ENVIRONMENT_SETUP.md](../01_GETTING_STARTED/ENVIRONMENT_SETUP.md)
- **Development Guide:** [../03_DEVELOPMENT/DEVELOPMENT_GUIDE.md](../03_DEVELOPMENT/DEVELOPMENT_GUIDE.md)

---

**Last Updated:** 2025-01-27
