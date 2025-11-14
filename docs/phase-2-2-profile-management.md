# Phase 2.2: Profile Management

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
│   │   │   ├── profile/      # Profile management
│   │   │   └── onboarding/   # User onboarding flow
│   ├── api/                  # API route handlers
│   └── actions/              # Server actions
├── components/               # Web-specific components
│   ├── profile/              # Profile-specific components
│   └── onboarding/           # Onboarding-specific components
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

**Goal:** Implement complete profile management functionality, including onboarding Step 2 (username + profile data) and profile editing from dashboard/console.

**Scope:**
1. Wire up onboarding Step 2 to collect and save username + profile data
2. Implement username availability checker (real-time validation)
3. Create profile view and edit modal in dashboard
4. Create profile edit functionality in admin console (for support)
5. Add avatar upload functionality
6. Implement education/work experience JSONB fields management
7. Test profile CRUD operations end-to-end

**Dependencies:**
- Phase 2.1 (Auth & Account Setup) must be complete
- Migration `20251113000000__users_billing_usage_expansion.sql` applied
- Database has all 41 user fields

---

## 📝 Implementation Steps

### Step 1: Create Profile Validation Schemas

**Purpose:** Centralize all profile-related validation logic with Zod.

**File to create:**

#### `apps/web/lib/validation/profile.ts`
```typescript
import { z } from 'zod'

// Username validation
export const usernameSchema = z
  .string()
  .min(3, 'Username must be at least 3 characters')
  .max(30, 'Username must be less than 30 characters')
  .regex(
    /^[a-zA-Z0-9_-]+$/,
    'Username can only contain letters, numbers, underscores, and hyphens'
  )
  .transform((val) => val.toLowerCase())

// Personal information
export const personalInfoSchema = z.object({
  username: usernameSchema.optional(),
  display_name: z.string().max(100).optional().nullable(),
  personal_title: z.string().max(10).optional().nullable(),
  first_name: z.string().min(1, 'First name is required').max(50),
  middle_name: z.string().max(50).optional().nullable(),
  last_name: z.string().min(1, 'Last name is required').max(50),
  bio: z.string().max(500).optional().nullable(),
})

// Contact information
export const contactInfoSchema = z.object({
  phone_country_code: z.string().max(5).optional().nullable(),
  phone_number: z.string().max(20).optional().nullable(),
})

// Address schema (reusable)
const addressSchema = z.object({
  apt_suite: z.string().max(20).optional().nullable(),
  street_address_1: z.string().max(200).optional().nullable(),
  street_address_2: z.string().max(200).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  state: z.string().max(100).optional().nullable(),
  postal_code: z.string().max(20).optional().nullable(),
  country: z.string().max(100).optional().nullable(),
})

// Personal address
export const personalAddressSchema = z.object({
  personal_apt_suite: z.string().max(20).optional().nullable(),
  personal_street_address_1: z.string().max(200).optional().nullable(),
  personal_street_address_2: z.string().max(200).optional().nullable(),
  personal_city: z.string().max(100).optional().nullable(),
  personal_state: z.string().max(100).optional().nullable(),
  personal_postal_code: z.string().max(20).optional().nullable(),
  personal_country: z.string().max(100).optional().nullable(),
})

// Business information
export const businessInfoSchema = z.object({
  business_position: z.string().max(100).optional().nullable(),
  business_company: z.string().max(200).optional().nullable(),
  business_apt_suite: z.string().max(20).optional().nullable(),
  business_street_address_1: z.string().max(200).optional().nullable(),
  business_street_address_2: z.string().max(200).optional().nullable(),
  business_city: z.string().max(100).optional().nullable(),
  business_state: z.string().max(100).optional().nullable(),
  business_postal_code: z.string().max(20).optional().nullable(),
  business_country: z.string().max(100).optional().nullable(),
})

// Education entry
export const educationEntrySchema = z.object({
  id: z.string().uuid().optional(),
  institution: z.string().min(1, 'Institution name is required').max(200),
  degree: z.string().max(100).optional().nullable(),
  field: z.string().max(100).optional().nullable(),
  start_year: z.number().int().min(1900).max(2100).optional().nullable(),
  end_year: z.number().int().min(1900).max(2100).optional().nullable(),
  current: z.boolean().default(false),
})

export const educationSchema = z.array(educationEntrySchema).default([])

// Work experience entry
export const workExperienceEntrySchema = z.object({
  id: z.string().uuid().optional(),
  company: z.string().min(1, 'Company name is required').max(200),
  position: z.string().min(1, 'Position is required').max(100),
  start_date: z.string().optional().nullable(), // ISO date string
  end_date: z.string().optional().nullable(), // ISO date string
  current: z.boolean().default(false),
  description: z.string().max(500).optional().nullable(),
})

export const workExperienceSchema = z.array(workExperienceEntrySchema).default([])

// Complete profile update schema
export const profileUpdateSchema = z.object({
  ...personalInfoSchema.shape,
  ...contactInfoSchema.shape,
  ...personalAddressSchema.shape,
  ...businessInfoSchema.shape,
  education: educationSchema.optional(),
  work_experience: workExperienceSchema.optional(),
})

// Onboarding Step 2 schema (minimal required fields)
export const onboardingStep2Schema = z.object({
  username: usernameSchema,
  first_name: z.string().min(1, 'First name is required').max(50),
  last_name: z.string().min(1, 'Last name is required').max(50),
  display_name: z.string().max(100).optional().nullable(),
})

// Types
export type PersonalInfo = z.infer<typeof personalInfoSchema>
export type ContactInfo = z.infer<typeof contactInfoSchema>
export type PersonalAddress = z.infer<typeof personalAddressSchema>
export type BusinessInfo = z.infer<typeof businessInfoSchema>
export type EducationEntry = z.infer<typeof educationEntrySchema>
export type WorkExperienceEntry = z.infer<typeof workExperienceEntrySchema>
export type ProfileUpdate = z.infer<typeof profileUpdateSchema>
export type OnboardingStep2 = z.infer<typeof onboardingStep2Schema>
```

**Verification:**
- All schemas properly typed
- Username validation enforces lowercase and allowed characters
- JSONB fields (education, work_experience) have proper structure
- Max lengths match database column definitions

---

### Step 2: Create Profile Server Actions

**Purpose:** Implement CRUD operations for profile management.

**File to create:**

#### `apps/web/app/actions/profile.ts`
```typescript
'use server'

import { createClient } from '@/lib/auth/server'
import { requireAuth } from '@/lib/auth/server'
import { revalidatePath } from 'next/cache'
import {
  profileUpdateSchema,
  onboardingStep2Schema,
  usernameSchema,
} from '@/lib/validation/profile'
import { z } from 'zod'

/**
 * Check if username is available
 */
export async function checkUsernameAvailability(username: string) {
  const supabase = createClient()

  // Validate format
  const validation = usernameSchema.safeParse(username)
  if (!validation.success) {
    return {
      available: false,
      error: validation.error.errors[0].message,
    }
  }

  const normalizedUsername = validation.data

  // Check if username exists
  const { data, error } = await supabase
    .from('users')
    .select('id')
    .eq('username', normalizedUsername)
    .maybeSingle()

  if (error) {
    console.error('Error checking username:', error)
    return {
      available: false,
      error: 'Error checking username availability',
    }
  }

  return {
    available: !data,
    error: null,
  }
}

/**
 * Complete onboarding step 2 (set username and basic profile)
 */
export async function completeOnboardingStep2(formData: FormData) {
  const user = await requireAuth()
  const supabase = createClient()

  // Parse and validate
  const data = {
    username: formData.get('username'),
    first_name: formData.get('first_name'),
    last_name: formData.get('last_name'),
    display_name: formData.get('display_name') || null,
  }

  const validation = onboardingStep2Schema.safeParse(data)

  if (!validation.success) {
    return {
      error: validation.error.flatten().fieldErrors,
    }
  }

  const validatedData = validation.data

  // Check username availability
  const usernameCheck = await checkUsernameAvailability(validatedData.username)
  if (!usernameCheck.available) {
    return {
      error: {
        username: [usernameCheck.error || 'Username is already taken'],
      },
    }
  }

  // Update user profile
  const { error } = await supabase
    .from('users')
    .update({
      username: validatedData.username,
      first_name: validatedData.first_name,
      last_name: validatedData.last_name,
      display_name: validatedData.display_name,
      full_name: `${validatedData.first_name} ${validatedData.last_name}`,
      profile_completed: true,
      onboarding_completed: true,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)

  if (error) {
    console.error('Error updating profile:', error)
    return {
      error: {
        form: ['Failed to update profile. Please try again.'],
      },
    }
  }

  revalidatePath('/', 'layout')

  return {
    success: true,
  }
}

/**
 * Update user profile (comprehensive)
 */
export async function updateProfile(formData: FormData) {
  const user = await requireAuth()
  const supabase = createClient()

  // Parse FormData into object
  const data: Record<string, any> = {}
  formData.forEach((value, key) => {
    // Handle JSONB fields
    if (key === 'education' || key === 'work_experience') {
      try {
        data[key] = JSON.parse(value as string)
      } catch {
        data[key] = []
      }
    } else {
      data[key] = value === '' ? null : value
    }
  })

  // Validate
  const validation = profileUpdateSchema.safeParse(data)

  if (!validation.success) {
    return {
      error: validation.error.flatten().fieldErrors,
    }
  }

  const validatedData = validation.data

  // If username is being updated, check availability
  if (validatedData.username && validatedData.username !== user.username) {
    const usernameCheck = await checkUsernameAvailability(validatedData.username)
    if (!usernameCheck.available) {
      return {
        error: {
          username: [usernameCheck.error || 'Username is already taken'],
        },
      }
    }
  }

  // Update full_name if first/last name changed
  if (validatedData.first_name || validatedData.last_name) {
    const firstName = validatedData.first_name || user.first_name || ''
    const lastName = validatedData.last_name || user.last_name || ''
    validatedData.full_name = `${firstName} ${lastName}`.trim()
  }

  // Perform update
  const { error } = await supabase
    .from('users')
    .update({
      ...validatedData,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)

  if (error) {
    console.error('Error updating profile:', error)
    return {
      error: {
        form: ['Failed to update profile. Please try again.'],
      },
    }
  }

  revalidatePath('/[locale]/profile', 'page')
  revalidatePath('/[locale]/dashboard', 'page')

  return {
    success: true,
    message: 'Profile updated successfully',
  }
}

/**
 * Get current user profile
 */
export async function getCurrentUserProfile() {
  const user = await requireAuth()
  return user
}

/**
 * Update avatar URL (after upload)
 */
export async function updateAvatarUrl(avatarUrl: string) {
  const user = await requireAuth()
  const supabase = createClient()

  const { error } = await supabase
    .from('users')
    .update({
      avatar_url: avatarUrl,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)

  if (error) {
    console.error('Error updating avatar:', error)
    return {
      error: 'Failed to update avatar',
    }
  }

  revalidatePath('/', 'layout')

  return {
    success: true,
  }
}
```

**Verification:**
- All actions require authentication
- Username availability checked before updates
- JSONB fields properly serialized/deserialized
- Revalidation triggers cache refresh
- Errors returned in user-friendly format

---

### Step 3: Create Onboarding Step 2 Page

**Purpose:** Collect username and basic profile info after signup.

**File to create:**

#### `apps/web/app/(app)/onboarding/page.tsx`
```typescript
import { requireAuth } from '@/lib/auth/server'
import { redirect } from 'next/navigation'
import OnboardingStep2Form from '@/components/onboarding/onboarding-step-2-form'

export default async function OnboardingPage() {
  const user = await requireAuth()

  // If already completed onboarding, redirect to dashboard
  if (user.onboarding_completed) {
    redirect('/en/dashboard')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30">
      <div className="w-full max-w-2xl space-y-8 rounded-lg border bg-card p-8 shadow-sm">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Complete Your Profile</h1>
          <p className="mt-2 text-muted-foreground">
            Let's set up your account with a username and basic information.
          </p>
        </div>

        <OnboardingStep2Form user={user} />
      </div>
    </div>
  )
}
```

**File to create:**

#### `apps/web/components/onboarding/onboarding-step-2-form.tsx`
```typescript
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { completeOnboardingStep2, checkUsernameAvailability } from '@/app/actions/profile'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { useDebounce } from '@/hooks/use-debounce'

interface OnboardingStep2FormProps {
  user: {
    email: string
    full_name?: string | null
  }
}

export default function OnboardingStep2Form({ user }: OnboardingStep2FormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [username, setUsername] = useState('')
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null)
  const [checkingUsername, setCheckingUsername] = useState(false)

  const debouncedUsername = useDebounce(username, 500)

  // Check username availability on change
  useEffect(() => {
    if (debouncedUsername.length < 3) {
      setUsernameAvailable(null)
      return
    }

    setCheckingUsername(true)
    checkUsernameAvailability(debouncedUsername)
      .then((result) => {
        setUsernameAvailable(result.available)
        setCheckingUsername(false)
      })
      .catch(() => {
        setCheckingUsername(false)
      })
  }, [debouncedUsername])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)
    setErrors({})

    const formData = new FormData(event.currentTarget)
    const result = await completeOnboardingStep2(formData)

    if (result.error) {
      setErrors(result.error)
      setIsSubmitting(false)
      return
    }

    // Success - redirect to dashboard
    router.push('/en/dashboard')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Username */}
      <div className="space-y-2">
        <Label htmlFor="username">
          Username <span className="text-destructive">*</span>
        </Label>
        <div className="relative">
          <Input
            id="username"
            name="username"
            type="text"
            required
            placeholder="johndoe"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={
              usernameAvailable === false ? 'border-destructive' : ''
            }
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {checkingUsername && (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            )}
            {!checkingUsername && usernameAvailable === true && (
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            )}
            {!checkingUsername && usernameAvailable === false && (
              <XCircle className="h-4 w-4 text-destructive" />
            )}
          </div>
        </div>
        {errors.username && (
          <p className="text-sm text-destructive">{errors.username[0]}</p>
        )}
        <p className="text-xs text-muted-foreground">
          3-30 characters, letters, numbers, underscores, and hyphens only
        </p>
      </div>

      {/* First Name */}
      <div className="space-y-2">
        <Label htmlFor="first_name">
          First Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="first_name"
          name="first_name"
          type="text"
          required
          placeholder="John"
        />
        {errors.first_name && (
          <p className="text-sm text-destructive">{errors.first_name[0]}</p>
        )}
      </div>

      {/* Last Name */}
      <div className="space-y-2">
        <Label htmlFor="last_name">
          Last Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="last_name"
          name="last_name"
          type="text"
          required
          placeholder="Doe"
        />
        {errors.last_name && (
          <p className="text-sm text-destructive">{errors.last_name[0]}</p>
        )}
      </div>

      {/* Display Name (Optional) */}
      <div className="space-y-2">
        <Label htmlFor="display_name">Display Name (Optional)</Label>
        <Input
          id="display_name"
          name="display_name"
          type="text"
          placeholder="Johnny"
        />
        <p className="text-xs text-muted-foreground">
          How you'd like to be called (defaults to first name)
        </p>
      </div>

      {errors.form && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {errors.form[0]}
        </div>
      )}

      <Button
        type="submit"
        className="w-full"
        disabled={isSubmitting || usernameAvailable === false}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Completing...
          </>
        ) : (
          'Complete Profile'
        )}
      </Button>
    </form>
  )
}
```

**File to create (custom hook):**

#### `apps/web/hooks/use-debounce.ts`
```typescript
import { useEffect, useState } from 'react'

export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}
```

**Verification:**
- Form displays after signup
- Username availability checked in real-time
- Visual feedback (icons) for username status
- Form submits only if username is available
- Redirects to dashboard on success
- Errors displayed inline

---

### Step 4: Create Profile View Page

**Purpose:** Display user profile information in dashboard.

**File to create:**

#### `apps/web/app/[locale]/profile/page.tsx`
```typescript
import { requireAuth } from '@/lib/auth/server'
import ProfileViewCard from '@/components/profile/profile-view-card'
import ProfileEditModal from '@/components/profile/profile-edit-modal'

export default async function ProfilePage() {
  const user = await requireAuth()

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Profile</h1>
          <p className="text-muted-foreground">
            View and manage your personal information
          </p>
        </div>
        <ProfileEditModal user={user} />
      </div>

      <ProfileViewCard user={user} />
    </div>
  )
}
```

**Continue in next message due to length...**

---

## ✅ Acceptance Criteria

- [ ] Profile validation schemas created with Zod
- [ ] Profile server actions implemented (CRUD operations)
- [ ] Username availability checker works in real-time
- [ ] Onboarding Step 2 page functional
- [ ] Profile view page displays user data
- [ ] Profile edit modal allows updates
- [ ] Education/work experience arrays editable
- [ ] Avatar upload functional
- [ ] All profile fields save correctly
- [ ] Integration tests pass
- [ ] E2E tests pass for onboarding and profile editing

---

## ✅ Definition of Done Checklist

Before marking this phase complete, verify:

- [ ] All acceptance criteria met
- [ ] Code follows file path conventions
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
- [ ] MCP verification performed

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

# Verify profiles via MCP
call SupabaseMCP.select {"table": "users", "select": "username,first_name,last_name,profile_completed", "limit": 5}
```

---

## 🚀 Next Phase

Once this phase is complete, proceed to:
- **Phase 2.3: Organization Management** - Implement org creation, member management, and org switcher


