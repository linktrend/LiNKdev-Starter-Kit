# Environment Setup Guide

**Complete guide to configuring all environment variables for the LTM Starter Kit**

---

## Quick Start

1. Copy the template:

```bash
cp apps/web/.env.example apps/web/.env.local
```

2. Fill in required values (see sections below)

3. Start the app:

```bash
pnpm --filter ./apps/web dev
```

The app validates environment variables on startup and will fail fast if required values are missing.

---

## Required Variables

### Supabase (Required)

| Variable | Description | Where to Find |
|----------|-------------|---------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL | Project Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anonymous/public key | Project Settings → API → Project API keys |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (server-side only) | Project Settings → API → Service role key |
| `SUPABASE_URL` | Same as project URL (for MCP/tooling) | Same as above |

**Example:**
```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_URL=https://xxxxx.supabase.co
```

**Security Note:** Never expose `SUPABASE_SERVICE_ROLE_KEY` to the browser. Keep it server-side only.

---

### Stripe (Required for Billing)

| Variable | Description | Where to Find |
|----------|-------------|---------------|
| `STRIPE_SECRET_KEY` | Secret API key | Developers → API keys → Secret key (sk_test_...) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Publishable key | Developers → API keys → Publishable key (pk_test_...) |
| `STRIPE_WEBHOOK_SECRET` | Webhook signing secret | Developers → Webhooks → Select endpoint → Signing secret |
| `STRIPE_PRICE_PRO_MONTHLY` | Pro monthly price ID | Products → Pro plan → Monthly price → Copy ID |
| `STRIPE_PRICE_PRO_ANNUAL` | Pro annual price ID | Products → Pro plan → Annual price → Copy ID |
| `STRIPE_PRICE_BUSINESS_MONTHLY` | Business monthly price ID | Products → Business plan → Monthly price → Copy ID |
| `STRIPE_PRICE_BUSINESS_ANNUAL` | Business annual price ID | Products → Business plan → Annual price → Copy ID |
| `STRIPE_PRICE_ENTERPRISE` | Enterprise price ID | Products → Enterprise plan → Price → Copy ID |

**Example:**
```bash
STRIPE_SECRET_KEY=sk_test_51Abc...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51Abc...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_PRO_MONTHLY=price_1Abc...
STRIPE_PRICE_PRO_ANNUAL=price_1Def...
STRIPE_PRICE_BUSINESS_MONTHLY=price_1Ghi...
STRIPE_PRICE_BUSINESS_ANNUAL=price_1Jkl...
STRIPE_PRICE_ENTERPRISE=price_1Mno...
```

**Test Mode:** Use test mode keys (sk_test_, pk_test_) for development. Switch to live keys for production.

---

### Application

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_SITE_URL` | Public site URL | `http://localhost:3000` |
| `NEXT_PUBLIC_APP_URL` | Canonical app URL | Same as SITE_URL |
| `PORT` | Development server port | `3000` |

**Example:**
```bash
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Optional Variables

### Supabase OAuth Providers

Only needed if you enable OAuth in Supabase (Project Settings → Authentication → Providers):

```bash
# GitHub OAuth
SUPABASE_AUTH_EXTERNAL_GITHUB_CLIENT_ID=your-client-id
SUPABASE_AUTH_EXTERNAL_GITHUB_SECRET=your-client-secret
SUPABASE_AUTH_EXTERNAL_GITHUB_REDIRECT_URI=http://127.0.0.1:54321/auth/v1/callback

# Google OAuth
SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID=your-client-id
SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET=your-client-secret
SUPABASE_AUTH_EXTERNAL_GOOGLE_REDIRECT_URI=http://127.0.0.1:54321/auth/v1/callback
```

### Supabase SMS (Twilio)

```bash
SUPABASE_AUTH_SMS_TWILIO_AUTH_TOKEN=your-twilio-token
```

### Email (Resend)

Required in production for transactional emails:

```bash
RESEND_API_KEY=re_...
```

Get from: https://resend.com/api-keys

### Analytics & Observability

```bash
# PostHog
NEXT_PUBLIC_POSTHOG_KEY=phc_...
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# Sentry
NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...
SENTRY_DSN=https://...@sentry.io/...
SENTRY_ENVIRONMENT=development

# Cloudflare Turnstile
TURNSTILE_SITE_KEY=0x...
TURNSTILE_SECRET_KEY=0x...
```

### Automation & Webhooks

```bash
# n8n Integration
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/...
N8N_WEBHOOK_SECRET=your-secret-key
WEBHOOK_TOLERANCE_SEC=300

# Cron Jobs
CRON_SECRET=your-cron-secret
```

### Storage

```bash
FILES_BUCKET=files
STORAGE_SIGNED_URL_TTL=3600
STORAGE_MAX_FILE_SIZE_MB=10
STORAGE_ALLOWED_TYPES=image/jpeg,image/png,application/pdf
```

### Feature Flags

```bash
# Enable/disable features
NEXT_PUBLIC_ENABLE_LABS=true
NEXT_PUBLIC_SUPPORT_ENABLED=true
NEXT_PUBLIC_DEFAULT_ORG_ID=your-org-id

# Offline mode (for development without external services)
TEMPLATE_OFFLINE=1
BILLING_OFFLINE=1
STORAGE_OFFLINE=true
```

### Rate Limiting

```bash
RATE_LIMIT_DEFAULT_PER_MIN=60
RATE_LIMIT_WINDOW_MS=60000
```

### MCP Tooling (Development)

```bash
# Figma MCP Server
FIGMA_ACCESS_TOKEN=figd_...
```

**Note:** MCP servers read environment variables from your shell, not `.env.local`. See [MCP Integration](../03_DEVELOPMENT/MCP_INTEGRATION.md) for setup.

---

## Service-by-Service Setup

### 1. Supabase Setup

#### Step 1: Create Project
1. Go to https://supabase.com/dashboard
2. Create a new project
3. Wait for project to finish provisioning

#### Step 2: Get API Credentials
1. Go to **Project Settings → API**
2. Copy **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
3. Copy **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Copy **service_role** key → `SUPABASE_SERVICE_ROLE_KEY`

#### Step 3: Configure Authentication
1. Go to **Authentication → Providers**
2. Enable desired providers (Email, Phone, OAuth)
3. For OAuth providers, add client IDs and secrets

#### Step 4: Apply Migrations
Use MCP tools in Cursor:
```
call SupabaseMCP.executeSQL
```

Or use Supabase Dashboard SQL Editor to run migrations from `apps/web/supabase/migrations/`.

#### Step 5: Generate Types
```bash
pnpm --filter ./apps/web supabase:types
```

---

### 2. Stripe Setup

#### Step 1: Create Account
1. Go to https://stripe.com/
2. Create account or log in
3. Enable **Test Mode** (toggle in top right)

#### Step 2: Get API Keys
1. Go to **Developers → API keys**
2. Copy **Secret key** (sk_test_...) → `STRIPE_SECRET_KEY`
3. Copy **Publishable key** (pk_test_...) → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

#### Step 3: Create Products & Prices
1. Go to **Products**
2. Create products for each plan:
   - **Pro Plan**
     - Monthly price ($29/month) → Copy ID to `STRIPE_PRICE_PRO_MONTHLY`
     - Annual price ($290/year) → Copy ID to `STRIPE_PRICE_PRO_ANNUAL`
   - **Business Plan**
     - Monthly price ($99/month) → Copy ID to `STRIPE_PRICE_BUSINESS_MONTHLY`
     - Annual price ($990/year) → Copy ID to `STRIPE_PRICE_BUSINESS_ANNUAL`
   - **Enterprise Plan**
     - Custom price → Copy ID to `STRIPE_PRICE_ENTERPRISE`

#### Step 4: Set Up Webhooks

**For Local Development:**
```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Copy the webhook signing secret (whsec_...) to .env.local
```

**For Production:**
1. Go to **Developers → Webhooks**
2. Click **Add endpoint**
3. Enter URL: `https://yourdomain.com/api/webhooks/stripe`
4. Select events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copy **Signing secret** → `STRIPE_WEBHOOK_SECRET`

---

### 3. Resend Setup (Email)

#### Step 1: Create Account
1. Go to https://resend.com/
2. Sign up or log in

#### Step 2: Verify Domain
1. Go to **Domains**
2. Add your domain
3. Add DNS records (TXT, MX, CNAME)
4. Wait for verification

#### Step 3: Get API Key
1. Go to **API Keys**
2. Create new API key
3. Copy key → `RESEND_API_KEY`

---

### 4. PostHog Setup (Analytics)

#### Step 1: Create Account
1. Go to https://posthog.com/
2. Sign up or log in

#### Step 2: Create Project
1. Create new project
2. Copy **Project API Key** → `NEXT_PUBLIC_POSTHOG_KEY`
3. Copy **Host** → `NEXT_PUBLIC_POSTHOG_HOST` (usually `https://app.posthog.com`)

---

### 5. Sentry Setup (Error Tracking)

#### Step 1: Create Account
1. Go to https://sentry.io/
2. Sign up or log in

#### Step 2: Create Project
1. Create new project (Next.js)
2. Copy **DSN** → `NEXT_PUBLIC_SENTRY_DSN` and `SENTRY_DSN`
3. Set environment → `SENTRY_ENVIRONMENT=development`

---

## Environment Variable Validation

The app validates environment variables on startup using Zod schemas in `apps/web/src/lib/env/validation.ts`.

### Validation Behavior

- **Missing required variable** → Process exits with clear error message
- **Missing optional variable** → Warning logged, app continues
- **All variables present** → Success message logged

### Validation Output

```bash
# Success
✓ Environment variables validated successfully

# Error
✗ Missing required environment variables:
  - NEXT_PUBLIC_SUPABASE_URL: Supabase project URL (e.g., https://xxxxx.supabase.co)
  - STRIPE_SECRET_KEY: Stripe secret key (e.g., sk_test_...)
```

### Offline Mode

Skip validation for specific services:

```bash
# Skip Supabase validation
TEMPLATE_OFFLINE=1

# Skip Stripe validation
BILLING_OFFLINE=1

# Skip storage validation
STORAGE_OFFLINE=true
```

---

## Troubleshooting

### Issue: Environment Variables Not Loading

**Symptoms:**
- App fails to start
- "Environment variable not defined" errors

**Solutions:**
1. Ensure `.env.local` is in `apps/web/` directory (not root)
2. Check for typos in variable names (case-sensitive)
3. Remove extra whitespace around values
4. Restart dev server after changes
5. Check `.env.local` is not in `.gitignore` locally

### Issue: Supabase Connection Failed

**Symptoms:**
- "Failed to connect to Supabase" error
- 401 Unauthorized errors

**Solutions:**
1. Verify `NEXT_PUBLIC_SUPABASE_URL` is correct
2. Check you're using **service role key** for `SUPABASE_SERVICE_ROLE_KEY` (not anon key)
3. Ensure Supabase project is running (check dashboard)
4. Check for expired keys (regenerate if needed)
5. Verify no extra characters or whitespace in keys

### Issue: Stripe Webhooks Not Working

**Symptoms:**
- Subscription updates not reflected in app
- "Invalid signature" errors in logs

**Solutions:**
1. Ensure Stripe CLI is running: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
2. Copy the webhook secret from CLI output to `.env.local`
3. Restart dev server after updating webhook secret
4. Check webhook endpoint is accessible
5. Verify webhook events are selected in Stripe dashboard

### Issue: MCP Servers Not Connecting

**Symptoms:**
- "MCP server not found" errors
- Tools not available in Cursor

**Solutions:**
1. Export environment variables in shell before launching Cursor
2. Add variables to `~/.zshrc` or `~/.bashrc`
3. Restart Cursor completely (Cmd+Q, then relaunch)
4. Verify MCP configuration in `.cursor/mcp.json`
5. Check MCP server logs in Cursor Developer Tools

### Issue: Type Errors After Database Changes

**Symptoms:**
- TypeScript errors for database types
- "Property does not exist" errors

**Solutions:**
1. Regenerate types: `pnpm --filter ./apps/web supabase:types`
2. Restart TypeScript server in editor
3. Clear Next.js cache: `rm -rf apps/web/.next`
4. Restart dev server

---

## Security Best Practices

1. **Never commit secrets** - `.env.local` is gitignored
2. **Use different keys for dev/prod** - Test keys for development, live keys for production
3. **Rotate keys regularly** - Especially after team member changes
4. **Limit key permissions** - Use read-only keys when possible
5. **Monitor API usage** - Watch for unexpected activity
6. **Use service role key server-side only** - Never expose to browser
7. **Validate webhook signatures** - Always verify Stripe webhook signatures

---

## Production Deployment

For production deployment:

1. Set all required environment variables in your hosting provider (Vercel, etc.)
2. Use **live** Stripe keys (not test keys)
3. Set `NEXT_PUBLIC_SITE_URL` to your production domain
4. Set `SENTRY_ENVIRONMENT=production`
5. Ensure `RESEND_API_KEY` is set (required in production)
6. Configure production webhook endpoints in Stripe
7. Verify all services are accessible from production environment

See [Deployment Guide](../06_DEPLOYMENT/DEPLOYMENT_GUIDE.md) for detailed instructions.

---

## Verification Checklist

Before starting development:

- [ ] `.env.local` file created in `apps/web/`
- [ ] All required Supabase variables set
- [ ] All required Stripe variables set
- [ ] Dev server starts without errors
- [ ] Supabase connection works (MCP ping)
- [ ] Stripe connection works (MCP ping)
- [ ] Database types generated
- [ ] Tests pass
- [ ] No TypeScript errors
- [ ] No linting errors

---

## Next Steps

- **Quick Start:** [QUICKSTART.md](./QUICKSTART.md)
- **Agent Onboarding:** [AGENT_ONBOARDING.md](./AGENT_ONBOARDING.md)
- **Development Guide:** [../03_DEVELOPMENT/DEVELOPMENT_GUIDE.md](../03_DEVELOPMENT/DEVELOPMENT_GUIDE.md)
- **MCP Integration:** [../03_DEVELOPMENT/MCP_INTEGRATION.md](../03_DEVELOPMENT/MCP_INTEGRATION.md)

---

**Need help?** See [Troubleshooting Guide](../03_DEVELOPMENT/TROUBLESHOOTING.md)
