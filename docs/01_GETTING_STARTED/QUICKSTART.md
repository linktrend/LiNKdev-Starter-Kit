# Quick Start Guide

**Time to Complete:** 5 minutes  
**Prerequisites:** Node.js 18+, pnpm, Git

---

## 1. Clone & Install

```bash
# Clone the repository
git clone <repository-url>
cd ltm-starter-kit

# Install dependencies
pnpm install
```

---

## 2. Set Up Environment Variables

Create `.env.local` in `apps/web/`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Stripe
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_PRO_MONTHLY=price_...
STRIPE_PRICE_PRO_ANNUAL=price_...
STRIPE_PRICE_BUSINESS_MONTHLY=price_...
STRIPE_PRICE_BUSINESS_ANNUAL=price_...
STRIPE_PRICE_ENTERPRISE=price_...

# Application
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

**Need help?** See [ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md) for detailed instructions.

---

## 3. Set Up Database

The project uses **cloud-only** Supabase. No local database setup required.

### Apply Migrations

Use MCP tools in Cursor:

```
call SupabaseMCP.executeSQL
```

Or use the Supabase Dashboard to run migrations from `apps/web/supabase/migrations/`.

### Generate TypeScript Types

```bash
pnpm --filter ./apps/web supabase:types
```

---

## 4. Start Development Server

```bash
pnpm --filter ./apps/web dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 5. Verify Installation

### Check Health

- [ ] Home page loads at `http://localhost:3000`
- [ ] Sign up page loads at `http://localhost:3000/signup`
- [ ] No console errors in browser DevTools
- [ ] No errors in terminal

### Test Authentication

1. Go to `http://localhost:3000/signup`
2. Create an account with email
3. Check email for verification link
4. Verify account
5. Log in

### Test Database Connection

```bash
# In Cursor, use MCP
call SupabaseMCP.ping
```

Expected response: `{"status": "ok", "supabaseUrl": "..."}`

---

## 6. Run Tests

```bash
# Unit tests
pnpm test

# Integration tests
pnpm test:integration

# E2E tests (requires dev server running)
pnpm --filter ./apps/web test:e2e
```

---

## Essential Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start all apps in development mode |
| `pnpm --filter ./apps/web dev` | Start web app only |
| `pnpm build` | Build all apps for production |
| `pnpm test` | Run all unit tests |
| `pnpm test:watch` | Run tests in watch mode |
| `pnpm lint` | Run ESLint |
| `pnpm typecheck` | Run TypeScript type checking |
| `pnpm --filter ./apps/web supabase:types` | Generate database types |

---

## Quick Verification Steps

### 1. Environment Variables

```bash
# Check if variables are loaded
pnpm --filter ./apps/web dev

# Look for: "Environment variables validated successfully"
```

### 2. Database Connection

```bash
# Use MCP in Cursor
call SupabaseMCP.listTables
```

### 3. Stripe Connection

```bash
# Use MCP in Cursor
call StripeMCP.ping
```

### 4. Build Success

```bash
pnpm build
```

Should complete without errors.

---

## Common Issues

### Port Already in Use

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
PORT=3001 pnpm --filter ./apps/web dev
```

### Environment Variables Not Loading

1. Ensure `.env.local` is in `apps/web/` directory
2. Restart dev server
3. Check for typos in variable names

### Database Connection Failed

1. Verify `NEXT_PUBLIC_SUPABASE_URL` is correct
2. Check `SUPABASE_SERVICE_ROLE_KEY` is the service role key (not anon key)
3. Ensure Supabase project is running (check dashboard)

### Stripe Webhooks Not Working

1. Install Stripe CLI: `brew install stripe/stripe-cli/stripe`
2. Login: `stripe login`
3. Forward webhooks: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
4. Copy webhook secret to `.env.local`

---

## Next Steps

- **Read:** [AGENT_ONBOARDING.md](./AGENT_ONBOARDING.md) - Fast codebase overview
- **Read:** [ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md) - Detailed setup guide
- **Explore:** [../02_ARCHITECTURE/ARCHITECTURE.md](../02_ARCHITECTURE/ARCHITECTURE.md) - System architecture
- **Learn:** [../03_DEVELOPMENT/DEVELOPMENT_GUIDE.md](../03_DEVELOPMENT/DEVELOPMENT_GUIDE.md) - Development workflow

---

**Ready to build! 🚀**
