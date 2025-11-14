# Phase 2.1: Auth & Account Setup

## 📋 Project Rules & Guardrails

**Before starting implementation, review these project rule files:**

1. **`.cursor/01-foundation.mdc`** - Monorepo structure, TypeScript config, package management, commit hygiene
2. **`.cursor/02-web-nextjs.mdc`** - Next.js App Router conventions, styling, data fetching, auth integration
3. **`.cursor/04-supabase.mdc`** - Database migrations, RLS policies, auth, edge functions, typed queries
4. **`.cursor/06-quality.mdc`** - Type-checking, linting, formatting, build verification requirements
5. **`.cursor/07-testing.mdc`** - Testing workflow, unit/integration/E2E test requirements
6. **`.cursor/12-mcp-rules.mdc`** - MCP server usage for database inspection and verification

---

## 🔒 Critical Guardrails for This Implementation

**From 01-foundation.mdc:**
- ✅ Use `pnpm` for package management
- ✅ Add any new npm scripts to `package.json` and document them
- ✅ Run `pnpm typecheck && pnpm lint && pnpm build` before marking complete
- ✅ Follow conventional commits: `type(scope): description`
- ✅ Never commit secrets - use `.env.example` for documentation only

**From 02-web-nextjs.mdc:**
- ✅ Use **Server Components by default** - client components only when needed (use client directive)
- ✅ Use **Server Actions** for mutations when appropriate
- ✅ Validate all inputs with **Zod** schemas
- ✅ Use **TanStack Query** for client-side data fetching
- ✅ Style with **Tailwind CSS** exclusively (avoid inline styles)
- ✅ Use **shadcn/ui** components (consult `call ShadcnMCP.getComponent` before implementing)
- ✅ Accessibility: semantic HTML, ARIA labels, keyboard navigation, focus states

**From 04-supabase.mdc:**
- ✅ **NO direct schema changes** - all changes via migration files in `apps/web/supabase/migrations/`
- ✅ Migration naming: `YYYYMMDDHHMM__description.sql`
- ✅ **RLS enabled on all tables** with explicit policies
- ✅ Use service role key only in server actions/API routes, never client-side
- ✅ Generate/update TypeScript types from database schema
- ✅ Document new env vars in `.env.example`

**From 06-quality.mdc:**
- ✅ Pass all quality gates: `pnpm typecheck`, `pnpm lint`, `pnpm format --check`, `pnpm test`, `pnpm build`
- ✅ Zero TypeScript errors required
- ✅ All linting/formatting rules enforced

**From 07-testing.mdc:**
- ✅ **Unit tests** for utilities/hooks/components (Vitest)
- ✅ **Integration tests** for server actions/API routes
- ✅ **E2E tests** for user flows (Playwright for web)
- ✅ Write regression tests for bug fixes
- ✅ Include test verification in DoD checklist

**From 12-mcp-rules.mdc:**
- ✅ Use `call SupabaseMCP.select`, `call SupabaseMCP.executeSQL` for database inspection
- ✅ Use `call ShadcnMCP.getComponent` before implementing UI components
- ✅ Restart Cursor after MCP configuration changes

---

## 📁 File Path Conventions

**Respect the established directory structure:**

```
apps/web/
├── app/
│   ├── (marketing)/          # Public pages
│   ├── (app)/                # Authenticated pages
│   │   ├── [locale]/
│   │   │   ├── console/      # Admin console (super_admin, admin only)
│   │   │   ├── dashboard/    # User dashboard
│   │   │   └── profile/      # Profile management
│   ├── api/                  # API route handlers
│   └── actions/              # Server actions
├── components/               # Web-specific components
├── lib/                      # Web utilities
│   ├── db/                   # Database utilities
│   ├── auth/                 # Auth helpers
│   └── validation/           # Zod schemas
├── supabase/
│   ├── migrations/           # SQL migration files
│   └── seed.sql              # Seed data
└── types/                    # TypeScript type definitions
```

---

## ⚠️ Common Pitfalls to Avoid

1. **❌ DO NOT** modify the database schema directly in Supabase Dashboard
2. **❌ DO NOT** create client components when server components suffice
3. **❌ DO NOT** expose service role keys or secrets to the client
4. **❌ DO NOT** skip validation - always use Zod schemas for inputs
5. **❌ DO NOT** disable RLS policies or create public tables without explicit justification
6. **❌ DO NOT** commit code that fails type-checking or linting
7. **❌ DO NOT** skip writing tests for new code paths
8. **❌ DO NOT** use `any` type in TypeScript - prefer `unknown` and type guards

---

## 🎯 Phase Overview

**Goal:** Establish a fully functional authentication system with proper role-based access control for platform admins (super_admin, admin) and regular users.

**Scope:**
1. Create a developer admin account with full platform access
2. Implement auth helpers and middleware
3. Wire up login, signup, password reset flows
4. Implement role-based access control for `/console` area
5. Create admin account management utilities
6. Test auth flows end-to-end

**Dependencies:**
- Migration `20251113000000__users_billing_usage_expansion.sql` must be applied
- Database must have `account_type` field in `users` table
- Supabase Auth must be configured

---

## 📝 Implementation Steps

### Step 1: Generate TypeScript Types from Database Schema

**Why:** Ensure type safety between database and application code.

**Actions:**
1. Install Supabase CLI if not already installed
2. Generate types from the updated schema
3. Export types for use across the application

**Commands:**
```bash
cd apps/web
pnpm supabase gen types typescript --project-id YOUR_PROJECT_REF > types/database.types.ts
```

**Files to create/modify:**
- `apps/web/types/database.types.ts` (generated)

**Verification:**
- File contains `users` table with all 41 fields
- File contains `organizations`, `organization_members`, `plan_features`, etc.

---

### Step 2: Create Auth Helper Functions

**Purpose:** Centralize auth logic for checking user sessions, roles, and permissions.

**Files to create:**

#### `apps/web/lib/auth/server.ts`
```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { cache } from 'react'
import type { Database } from '@/types/database.types'

export const createClient = cache(() => {
  const cookieStore = cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )
})

export async function getSession() {
  const supabase = createClient()
  const { data: { session }, error } = await supabase.auth.getSession()
  
  if (error) {
    console.error('Error fetching session:', error)
    return null
  }
  
  return session
}

export async function getUser() {
  const session = await getSession()
  if (!session) return null

  const supabase = createClient()
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', session.user.id)
    .single()

  if (error) {
    console.error('Error fetching user:', error)
    return null
  }

  return user
}

export async function requireAuth() {
  const user = await getUser()
  if (!user) {
    throw new Error('Unauthorized')
  }
  return user
}

export async function requireAdmin() {
  const user = await requireAuth()
  
  if (!['super_admin', 'admin'].includes(user.account_type)) {
    throw new Error('Forbidden: Admin access required')
  }
  
  return user
}

export async function requireSuperAdmin() {
  const user = await requireAuth()
  
  if (user.account_type !== 'super_admin') {
    throw new Error('Forbidden: Super admin access required')
  }
  
  return user
}

export async function checkRole(requiredRole: 'super_admin' | 'admin' | 'user') {
  const user = await getUser()
  if (!user) return false
  
  if (requiredRole === 'super_admin') {
    return user.account_type === 'super_admin'
  }
  
  if (requiredRole === 'admin') {
    return ['super_admin', 'admin'].includes(user.account_type)
  }
  
  return true // All authenticated users have 'user' role
}
```

#### `apps/web/lib/auth/client.ts`
```typescript
'use client'

import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database.types'

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

**Verification:**
- All functions properly typed with Database types
- No TypeScript errors
- Server functions use `cache()` for request deduplication

---

### Step 3: Create Middleware for Route Protection

**Purpose:** Protect `/console` routes and redirect unauthenticated users.

**File to create:**

#### `apps/web/middleware.ts`
```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: any) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()

  // Check if accessing console area
  if (request.nextUrl.pathname.includes('/console')) {
    if (!session) {
      // Redirect to login
      const redirectUrl = new URL('/login', request.url)
      redirectUrl.searchParams.set('redirect', request.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // Fetch user to check account_type
    const { data: user } = await supabase
      .from('users')
      .select('account_type')
      .eq('id', session.user.id)
      .single()

    if (!user || !['super_admin', 'admin'].includes(user.account_type)) {
      // Redirect to dashboard - insufficient permissions
      return NextResponse.redirect(new URL('/en/dashboard', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

**Verification:**
- Middleware protects `/console` routes
- Unauthenticated users redirected to login
- Non-admin users redirected to dashboard
- Session cookies properly refreshed

---

### Step 4: Create Server Actions for Auth Flows

**Purpose:** Implement signup, login, logout, and password reset actions.

**File to create:**

#### `apps/web/app/actions/auth.ts`
```typescript
'use server'

import { createClient } from '@/lib/auth/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

// Validation schemas
const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  fullName: z.string().min(2, 'Full name is required'),
})

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

const resetPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
})

const updatePasswordSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export async function signup(formData: FormData) {
  const supabase = createClient()

  // Validate input
  const validatedFields = signupSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
    fullName: formData.get('fullName'),
  })

  if (!validatedFields.success) {
    return {
      error: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { email, password, fullName } = validatedFields.data

  // Create user
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  })

  if (error) {
    return {
      error: { form: [error.message] },
    }
  }

  // Success - redirect to onboarding
  revalidatePath('/', 'layout')
  redirect('/onboarding')
}

export async function login(formData: FormData) {
  const supabase = createClient()

  // Validate input
  const validatedFields = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!validatedFields.success) {
    return {
      error: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { email, password } = validatedFields.data

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return {
      error: { form: [error.message] },
    }
  }

  revalidatePath('/', 'layout')
  redirect('/en/dashboard')
}

export async function logout() {
  const supabase = createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}

export async function requestPasswordReset(formData: FormData) {
  const supabase = createClient()

  const validatedFields = resetPasswordSchema.safeParse({
    email: formData.get('email'),
  })

  if (!validatedFields.success) {
    return {
      error: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { email } = validatedFields.data

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset-password`,
  })

  if (error) {
    return {
      error: { form: [error.message] },
    }
  }

  return {
    success: true,
    message: 'Password reset email sent. Please check your inbox.',
  }
}

export async function updatePassword(formData: FormData) {
  const supabase = createClient()

  const validatedFields = updatePasswordSchema.safeParse({
    password: formData.get('password'),
  })

  if (!validatedFields.success) {
    return {
      error: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { password } = validatedFields.data

  const { error } = await supabase.auth.updateUser({
    password,
  })

  if (error) {
    return {
      error: { form: [error.message] },
    }
  }

  return {
    success: true,
    message: 'Password updated successfully.',
  }
}
```

**Verification:**
- All inputs validated with Zod
- Errors returned in user-friendly format
- Successful actions trigger revalidation and redirect
- No secrets exposed to client

---

### Step 5: Create Developer Admin Account

**Purpose:** Create the first super_admin account for platform access.

**Actions:**

1. Sign up a user via Supabase Dashboard or auth UI
2. Run SQL to upgrade account to super_admin:

```sql
-- Replace with actual developer email
UPDATE users 
SET account_type = 'super_admin'
WHERE email = 'developer@example.com';
```

**Alternative: Create via SQL directly:**

```sql
-- Insert into auth.users (requires service role)
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  confirmation_token
)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@example.com',
  crypt('YourSecurePassword123!', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Platform Admin"}',
  false,
  ''
);

-- The trigger will create the users record automatically
-- Then update to super_admin
UPDATE users 
SET account_type = 'super_admin'
WHERE email = 'admin@example.com';
```

**Verification:**
```sql
SELECT id, email, account_type, created_at 
FROM users 
WHERE account_type = 'super_admin';
```

**Expected result:** One row with super_admin account

---

### Step 6: Wire Up Auth UI Pages

**Purpose:** Create login, signup, and password reset pages.

**Note:** Use existing auth pages if they exist, otherwise create minimal functional pages.

**Files to verify/create:**
- `apps/web/app/(marketing)/login/page.tsx`
- `apps/web/app/(marketing)/signup/page.tsx`
- `apps/web/app/(marketing)/forgot-password/page.tsx`
- `apps/web/app/auth/callback/route.ts` (OAuth callback handler)
- `apps/web/app/auth/reset-password/page.tsx`

**Example Login Page Structure:**
```typescript
// apps/web/app/(marketing)/login/page.tsx
import { login } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-8 px-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Sign In</h1>
          <p className="mt-2 text-muted-foreground">
            Welcome back! Please sign in to continue.
          </p>
        </div>

        <form action={login} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="you@example.com"
              />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                placeholder="••••••••"
              />
            </div>
          </div>

          <Button type="submit" className="w-full">
            Sign In
          </Button>

          <div className="text-center text-sm">
            <a
              href="/forgot-password"
              className="text-primary hover:underline"
            >
              Forgot password?
            </a>
          </div>

          <div className="text-center text-sm">
            Don't have an account?{' '}
            <a href="/signup" className="text-primary hover:underline">
              Sign up
            </a>
          </div>
        </form>
      </div>
    </div>
  )
}
```

**Verification:**
- Forms submit to server actions
- Validation errors displayed inline
- Success redirects work correctly
- Accessibility: labels, ARIA attributes, keyboard navigation

---

### Step 7: Create Admin Console Layout

**Purpose:** Set up the `/console` area layout with navigation for admins.

**File to create:**

#### `apps/web/app/[locale]/console/layout.tsx`
```typescript
import { requireAdmin } from '@/lib/auth/server'
import { redirect } from 'next/navigation'

export default async function ConsoleLayout({
  children,
}: {
  children: React.ReactNode
}) {
  try {
    await requireAdmin()
  } catch {
    redirect('/en/dashboard')
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar navigation */}
      <aside className="w-64 border-r bg-muted/40">
        <div className="flex h-full flex-col">
          <div className="border-b p-6">
            <h2 className="text-lg font-semibold">Admin Console</h2>
          </div>
          <nav className="flex-1 space-y-1 p-4">
            <a
              href="/en/console"
              className="block rounded-md px-3 py-2 text-sm hover:bg-muted"
            >
              Dashboard
            </a>
            <a
              href="/en/console/users"
              className="block rounded-md px-3 py-2 text-sm hover:bg-muted"
            >
              Users
            </a>
            <a
              href="/en/console/organizations"
              className="block rounded-md px-3 py-2 text-sm hover:bg-muted"
            >
              Organizations
            </a>
            <a
              href="/en/console/billing"
              className="block rounded-md px-3 py-2 text-sm hover:bg-muted"
            >
              Billing
            </a>
            <a
              href="/en/console/settings"
              className="block rounded-md px-3 py-2 text-sm hover:bg-muted"
            >
              Settings
            </a>
          </nav>
          <div className="border-t p-4">
            <a
              href="/en/dashboard"
              className="block rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted"
            >
              ← Back to App
            </a>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto py-8">{children}</div>
      </main>
    </div>
  )
}
```

**Verification:**
- Layout only accessible to super_admin and admin users
- Navigation links work
- Responsive design
- Clear visual hierarchy

---

### Step 8: Add Admin Link to Main Navigation

**Purpose:** Show "Admin Console" link in navbar when user has admin access.

**File to modify:**
- `apps/web/components/navbar.tsx` (or equivalent navigation component)

**Code to add:**
```typescript
import { checkRole } from '@/lib/auth/server'

export async function Navbar() {
  const isAdmin = await checkRole('admin')
  
  return (
    <nav>
      {/* Existing navigation items */}
      
      {isAdmin && (
        <a 
          href="/en/console"
          className="text-sm font-medium hover:underline"
        >
          Admin Console
        </a>
      )}
    </nav>
  )
}
```

**Verification:**
- Link only visible to admin/super_admin users
- Link correctly navigates to console
- No errors for non-admin users

---

### Step 9: Create Test User Account

**Purpose:** Create a regular user account for testing non-admin flows.

**Actions:**
1. Use signup form to create test user
2. Verify account created with `account_type = 'user'`
3. Verify user cannot access `/console`
4. Verify user can access `/dashboard`

**SQL verification:**
```sql
SELECT id, email, account_type, onboarding_completed, profile_completed
FROM users
WHERE email = 'testuser@example.com';
```

---

### Step 10: Integration Tests

**Purpose:** Test auth flows programmatically.

**File to create:**

#### `apps/web/__tests__/auth.test.ts`
```typescript
import { describe, it, expect } from 'vitest'
import { signup, login, logout } from '@/app/actions/auth'

describe('Auth Actions', () => {
  it('should validate signup inputs', async () => {
    const formData = new FormData()
    formData.append('email', 'invalid-email')
    formData.append('password', 'short')
    formData.append('fullName', 'T')

    const result = await signup(formData)

    expect(result.error).toBeDefined()
    expect(result.error?.email).toBeDefined()
    expect(result.error?.password).toBeDefined()
    expect(result.error?.fullName).toBeDefined()
  })

  it('should validate login inputs', async () => {
    const formData = new FormData()
    formData.append('email', 'invalid-email')
    formData.append('password', '')

    const result = await login(formData)

    expect(result.error).toBeDefined()
  })

  // Add more tests for successful flows with test database
})
```

**Run tests:**
```bash
cd apps/web
pnpm test
```

---

### Step 11: E2E Tests with Playwright

**Purpose:** Test complete auth flows from UI perspective.

**File to create:**

#### `apps/web/e2e/auth.spec.ts`
```typescript
import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test('admin can access console', async ({ page }) => {
    // Login as admin
    await page.goto('/login')
    await page.fill('input[name="email"]', 'admin@example.com')
    await page.fill('input[name="password"]', 'YourSecurePassword123!')
    await page.click('button[type="submit"]')

    // Should redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard/)

    // Should see admin console link
    const consoleLink = page.locator('text=Admin Console')
    await expect(consoleLink).toBeVisible()

    // Navigate to console
    await consoleLink.click()
    await expect(page).toHaveURL(/\/console/)
  })

  test('regular user cannot access console', async ({ page }) => {
    // Login as regular user
    await page.goto('/login')
    await page.fill('input[name="email"]', 'testuser@example.com')
    await page.fill('input[name="password"]', 'TestPassword123!')
    await page.click('button[type="submit"]')

    // Try to access console directly
    await page.goto('/en/console')

    // Should redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard/)
  })

  test('signup flow creates user account', async ({ page }) => {
    await page.goto('/signup')

    await page.fill('input[name="email"]', `test-${Date.now()}@example.com`)
    await page.fill('input[name="password"]', 'SecurePassword123!')
    await page.fill('input[name="fullName"]', 'Test User')

    await page.click('button[type="submit"]')

    // Should redirect to onboarding
    await expect(page).toHaveURL(/\/onboarding/)
  })
})
```

**Run E2E tests:**
```bash
cd apps/web
pnpm e2e
```

---

## ✅ Acceptance Criteria

- [ ] TypeScript types generated from database schema
- [ ] Auth helper functions created and working
- [ ] Middleware protects `/console` routes
- [ ] Server actions for signup, login, logout, password reset implemented
- [ ] Developer super_admin account created and verified
- [ ] Test user account created and verified
- [ ] Auth UI pages functional (login, signup, password reset)
- [ ] Admin console layout created with navigation
- [ ] Admin link visible only to admin users in main nav
- [ ] Integration tests pass
- [ ] E2E tests pass
- [ ] Admin can access console
- [ ] Regular user cannot access console
- [ ] All auth flows work end-to-end

---

## ✅ Definition of Done Checklist

Before marking this phase complete, verify:

- [ ] All acceptance criteria met
- [ ] Code follows file path conventions above
- [ ] TypeScript strict mode - zero errors (`pnpm typecheck`)
- [ ] ESLint + Prettier pass (`pnpm lint && pnpm format --check`)
- [ ] All tests pass (`pnpm test`, `pnpm e2e:web`)
- [ ] Build succeeds (`pnpm build`)
- [ ] New/updated tests written for changed code
- [ ] Zod schemas validate all inputs
- [ ] RLS policies enforce security
- [ ] Environment variables documented in `.env.example`
- [ ] Conventional commit messages used
- [ ] No secrets committed
- [ ] Accessibility requirements met (ARIA, keyboard nav, focus states)
- [ ] MCP verification performed (if database changes made)

---

## 🔍 Verification Commands

```bash
# Type check
cd apps/web && pnpm typecheck

# Lint
cd apps/web && pnpm lint

# Format check
cd apps/web && pnpm format --check

# Run tests
cd apps/web && pnpm test

# Run E2E tests
cd apps/web && pnpm e2e

# Build
cd apps/web && pnpm build

# Verify admin account via MCP
call SupabaseMCP.select {"table": "users", "filter": {"account_type": "super_admin"}}

# Verify test user via MCP
call SupabaseMCP.select {"table": "users", "filter": {"account_type": "user"}, "limit": 5}
```

---

## 📚 Reference Documentation

- Supabase Auth: https://supabase.com/docs/guides/auth
- Next.js Middleware: https://nextjs.org/docs/app/building-your-application/routing/middleware
- Zod Validation: https://zod.dev/
- Playwright Testing: https://playwright.dev/

---

## 🚀 Next Phase

Once this phase is complete, proceed to:
- **Phase 2.2: Profile Management** - Wire up onboarding Step 2 and profile editing


