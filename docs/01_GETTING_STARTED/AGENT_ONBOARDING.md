# Agent Onboarding Guide

**Purpose:** Fast onboarding for AI developer agents (Callisto, Europa, Titan, Enceladus)  
**Time to Read:** 5 minutes  
**Last Updated:** 2025-12-22

---

## 🎯 Quick Overview

The **LiNKdev Starter Kit** is a production-ready SaaS starter template built with:
- **Frontend:** Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **Backend:** tRPC, Next.js Server Actions
- **Database:** Supabase (PostgreSQL with RLS)
- **Payments:** Stripe (subscriptions, invoices, webhooks)
- **Auth:** Supabase Auth (OAuth, magic links, phone OTP)
- **Monorepo:** Turborepo with pnpm workspaces

### Key Characteristics
- **Organization-based billing** - All subscriptions at org level
- **Multi-tenant** - Users can belong to multiple organizations
- **Feature-gated** - Plans control access to features and limits
- **Cloud-only database** - No local Supabase instances
- **MCP-integrated** - Model Context Protocol for external services

---

## 📁 Where to Find Things

### Critical Files Map

| What You Need | Where to Look |
|--------------|---------------|
| **Environment setup** | `docs/01_GETTING_STARTED/ENVIRONMENT_SETUP.md` |
| **Architecture overview** | `docs/02_ARCHITECTURE/ARCHITECTURE.md` |
| **Project structure** | `docs/02_ARCHITECTURE/PROJECT_STRUCTURE.md` |
| **Database schema** | `docs/02_ARCHITECTURE/DATABASE_SCHEMA.md` |
| **Development guide** | `docs/03_DEVELOPMENT/DEVELOPMENT_GUIDE.md` |
| **Testing guide** | `docs/03_DEVELOPMENT/TESTING_GUIDE.md` |
| **Troubleshooting** | `docs/03_DEVELOPMENT/TROUBLESHOOTING.md` |
| **API documentation** | `docs/05_API_REFERENCE/` |
| **Feature docs** | `docs/04_FEATURES/` |

### Code Locations

| Component | Location |
|-----------|----------|
| **Web app** | `apps/web/` |
| **API (tRPC)** | `packages/api/src/` |
| **UI components** | `packages/ui/` |
| **Shared config** | `packages/config/` |
| **Database migrations** | `apps/web/supabase/migrations/` |
| **MCP servers** | `mcp/` |
| **Tests** | `apps/web/src/__tests__/`, `packages/api/src/__tests__/` |
| **E2E tests** | `apps/web/tests/e2e/` |

### Route Groups (Next.js App Router)

```
apps/web/src/app/[locale]/
├── (marketing)/          # Landing, pricing, blog
├── (auth_forms)/         # Signup, signin, password reset
├── (dashboard)/          # Main dashboard
├── (app)/                # App features, settings
├── (console)/            # Developer console (separate shell)
└── org/[orgId]/          # Organization management
```

---

## 🚀 Common Tasks Quick Reference

### 1. Running the Development Server

```bash
# Install dependencies (first time)
pnpm install

# Run web app
pnpm --filter ./apps/web dev

# Run with turbo (all packages)
pnpm dev
```

### 2. Database Operations

```bash
# Apply migration (via MCP - preferred)
# Use Supabase MCP tools in Cursor

# Create new migration
# Create SQL file in apps/web/supabase/migrations/
# Format: YYYYMMDDHHMMSS_description.sql

# Generate types from database
pnpm --filter ./apps/web supabase:types
```

### 3. Running Tests

```bash
# Unit tests (Vitest)
pnpm test

# Integration tests
pnpm test:integration

# E2E tests (Playwright)
pnpm --filter ./apps/web test:e2e

# Watch mode
pnpm test:watch
```

### 4. Adding a New Feature

1. Check feature flags: `docs/04_FEATURES/FEATURE_FLAGS.md`
2. Add database tables/columns if needed (migration)
3. Create tRPC router in `packages/api/src/routers/`
4. Add UI components in `apps/web/src/components/`
5. Create page in appropriate route group
6. Add tests (unit + integration + E2E)
7. Update documentation

### 5. Working with Billing

```bash
# Test Stripe webhooks locally
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Check billing docs
# See: docs/04_FEATURES/BILLING.md
# See: docs/02_ARCHITECTURE/BILLING_ARCHITECTURE.md
```

### 6. Checking Linter Errors

```bash
# Run ESLint
pnpm lint

# Fix auto-fixable issues
pnpm lint:fix

# Type check
pnpm typecheck
```

---

## 🎨 Critical Patterns & Conventions

### 1. Design System

**RULE:** Always use design tokens, never raw hex colors

```typescript
// ❌ BAD
<div className="bg-[#3b82f6]">

// ✅ GOOD
<div className="bg-primary">
```

**RULE:** Use `@starter/ui` primitives, not direct imports from `@radix-ui`

```typescript
// ❌ BAD
import { Button } from '@radix-ui/react-button';

// ✅ GOOD
import { Button } from '@starter/ui';
```

### 2. Authentication

**RULE:** Always check user session server-side

```typescript
import { createServerClient } from '@/lib/supabase/server';

export default async function Page() {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/signin');
  }
  
  // ... rest of page
}
```

### 3. Organization Context

**RULE:** All features operate within an organization context

```typescript
// Get current organization from context
const { currentOrg } = useOrganization();

// Check subscription/limits
const { data: subscription } = await supabase
  .from('org_subscriptions')
  .select('*')
  .eq('org_id', currentOrg.id)
  .single();
```

### 4. Database Queries

**RULE:** Use RLS policies, not manual user_id filtering

```sql
-- ✅ GOOD: RLS policy handles access control
SELECT * FROM records WHERE org_id = 'current-org';

-- ❌ BAD: Manual filtering (RLS should handle this)
SELECT * FROM records WHERE org_id = 'current-org' AND user_id = auth.uid();
```

### 5. Error Handling

**RULE:** Use error tracking and proper error boundaries

```typescript
import { logError } from '@/lib/errors/logger';

try {
  // ... operation
} catch (error) {
  logError(error, {
    context: 'feature-name',
    userId: user.id,
    orgId: currentOrg.id,
  });
  throw error; // Re-throw for error boundary
}
```

### 6. Server Actions

**RULE:** Validate inputs and handle errors properly

```typescript
'use server';

import { z } from 'zod';

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
});

export async function createUser(formData: FormData) {
  // Validate
  const data = schema.parse({
    name: formData.get('name'),
    email: formData.get('email'),
  });
  
  // Check auth
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Unauthorized');
  }
  
  // Perform operation
  // ...
}
```

---

## ⚠️ Known Gotchas & Workarounds

### 1. Database: Cloud-Only Policy

**Problem:** No local Supabase instances allowed  
**Solution:** Use MCP tools for all database operations

```bash
# ❌ NEVER RUN
supabase start
supabase db reset

# ✅ USE INSTEAD
# MCP tools via Cursor
call SupabaseMCP.executeSQL
```

### 2. Environment Variables: Must Restart After Changes

**Problem:** Next.js caches env vars  
**Solution:** Restart dev server after changing `.env.local`

```bash
# Kill dev server (Ctrl+C)
pnpm --filter ./apps/web dev
```

### 3. Stripe Webhooks: Need Forwarding for Local Dev

**Problem:** Stripe can't reach localhost  
**Solution:** Use Stripe CLI to forward webhooks

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
# Copy webhook secret to .env.local as STRIPE_WEBHOOK_SECRET
```

### 4. tRPC Type Errors: Regenerate After Schema Changes

**Problem:** Types out of sync after database changes  
**Solution:** Regenerate types

```bash
pnpm --filter ./apps/web supabase:types
pnpm typecheck
```

### 5. MCP Servers: Need Environment Variables in Shell

**Problem:** MCP servers can't access `.env.local`  
**Solution:** Export vars in shell before launching Cursor

```bash
# Add to ~/.zshrc
export SUPABASE_URL="https://your-project.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="your-key"
export STRIPE_SECRET_KEY="sk_test_..."

# Reload shell
source ~/.zshrc

# Launch Cursor from terminal
open -a Cursor
```

### 6. Organization Creation: Auto-created on Signup

**Problem:** Users expect to manually create orgs  
**Solution:** Personal org is auto-created, team orgs are manual

```typescript
// Personal org created by handle_new_user() trigger
// Team orgs created via "Create Organization" UI
```

### 7. Billing: Subscriptions are Org-Scoped

**Problem:** Looking for user-level subscriptions  
**Solution:** All subscriptions are in `org_subscriptions` table

```typescript
// ❌ WRONG
const sub = await supabase
  .from('subscriptions')
  .eq('user_id', user.id);

// ✅ CORRECT
const sub = await supabase
  .from('org_subscriptions')
  .eq('org_id', currentOrg.id);
```

### 8. Route Verification: Must Pass Before Deploy

**Problem:** Missing required routes break navigation  
**Solution:** Run verification script

```bash
pnpm run verify:routes
```

---

## 🏗️ Architecture Decision Records

### ADR-001: Organization-Based Billing
**Decision:** All billing at organization level, not user level  
**Rationale:** Supports both individual and team use cases  
**Impact:** Users can have multiple subscriptions (personal + team orgs)

### ADR-002: Cloud-Only Database
**Decision:** No local Supabase instances  
**Rationale:** Prevents data inconsistencies, enforces cloud-first  
**Impact:** All database operations via MCP or cloud CLI

### ADR-003: tRPC + Server Actions
**Decision:** Use both tRPC (API) and Server Actions (forms/mutations)  
**Rationale:** tRPC for type-safe APIs, Server Actions for progressive enhancement  
**Impact:** Two patterns for backend operations

### ADR-004: Monorepo with Turborepo
**Decision:** Monorepo with shared packages  
**Rationale:** Code reuse, consistent tooling, faster builds  
**Impact:** Changes in shared packages affect multiple apps

### ADR-005: Design Token System
**Decision:** Centralized design tokens, no raw colors  
**Rationale:** Consistent theming, easy brand updates  
**Impact:** Must use design tokens, enforced by ESLint

### ADR-006: Feature Flags via Database
**Decision:** Feature flags stored in database, not config files  
**Rationale:** Runtime control, per-org customization  
**Impact:** Can't change flags without database access

### ADR-007: Separate Developer Console
**Decision:** Console has separate auth and shell  
**Rationale:** Security, different UX needs  
**Impact:** Separate login flow for console access

---

## 🔍 Quick Debugging Checklist

When something goes wrong:

- [ ] Check environment variables are set (`.env.local`)
- [ ] Restart dev server if env vars changed
- [ ] Check Supabase connection (MCP ping)
- [ ] Verify user is authenticated (`auth.getUser()`)
- [ ] Check organization context is set
- [ ] Verify RLS policies allow operation
- [ ] Check subscription status and limits
- [ ] Look for errors in browser console
- [ ] Check server logs (terminal running dev server)
- [ ] Check Supabase logs (dashboard)
- [ ] Check Stripe logs (dashboard)
- [ ] Run type check (`pnpm typecheck`)
- [ ] Run linter (`pnpm lint`)
- [ ] Check test failures (`pnpm test`)

---

## 📚 Next Steps

After reading this guide:

1. **Set up environment:** `docs/01_GETTING_STARTED/ENVIRONMENT_SETUP.md`
2. **Understand architecture:** `docs/02_ARCHITECTURE/ARCHITECTURE.md`
3. **Review development guide:** `docs/03_DEVELOPMENT/DEVELOPMENT_GUIDE.md`
4. **Explore features:** `docs/04_FEATURES/`
5. **Check API docs:** `docs/05_API_REFERENCE/`

---

## 🆘 Getting Help

- **Troubleshooting:** `docs/03_DEVELOPMENT/TROUBLESHOOTING.md`
- **Testing issues:** `docs/03_DEVELOPMENT/TESTING_GUIDE.md`
- **Database issues:** `docs/03_DEVELOPMENT/DATABASE.md`
- **MCP issues:** `docs/03_DEVELOPMENT/MCP_INTEGRATION.md`
- **Billing issues:** `docs/04_FEATURES/BILLING.md`

---

**Welcome to the team! 🚀**
