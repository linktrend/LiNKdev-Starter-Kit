# Phase 2.6: Feature Gating

## 📋 Project Rules & Guardrails

**Before starting implementation, review these project rule files:**

1. **`.cursor/01-foundation.mdc`** - Monorepo structure, TypeScript config, package management, commit hygiene
2. **`.cursor/02-web-nextjs.mdc`** - Next.js App Router conventions, styling, data fetching, auth integration
3. **`.cursor/04-supabase.mdc`** - Database migrations, RLS policies, auth, edge functions, typed queries
4. **`.cursor/06-quality.mdc`** - Type-checking, linting, formatting, build verification requirements
5. **`.cursor/07-testing.mdc`** - Testing workflow, unit/integration/E2E test requirements
6. **`.cursor/12-mcp-rules.mdc`** - MCP server usage for database inspection and verification

---

## 🔒 Critical Guardrails

**Key Requirements:**
- ✅ Check feature access on server-side
- ✅ Never trust client-side feature checks
- ✅ Cache feature checks appropriately
- ✅ Provide clear upgrade prompts
- ✅ Test all plan tiers
- ✅ Document feature limits

---

## 🎯 Phase Overview

**Goal:** Implement plan-based feature gating with middleware, utilities, and UI components to enforce limits and prompt upgrades.

**Scope:**
1. Create feature checking utilities
2. Implement server-side middleware for feature gates
3. Build client-side feature gate components
4. Create upgrade prompt modals
5. Add feature limit indicators in UI
6. Test feature access across all plan tiers
7. Document feature gating patterns

**Dependencies:**
- Phase 2.1-2.5 complete
- `plan_features` table seeded with limits
- `check_feature_access()` database function exists

---

## 📝 Implementation Steps

### Step 1: Create Feature Access Utilities

**File to create:** `apps/web/lib/features/server.ts`

```typescript
import { createClient } from '@/lib/auth/server'
import { requireAuth } from '@/lib/auth/server'
import { cache } from 'react'

export interface FeatureLimit {
  limit?: number
  unlimited?: boolean
  enabled?: boolean
}

/**
 * Check if user has access to a feature
 */
export const checkFeatureAccess = cache(
  async (featureKey: string, orgId?: string): Promise<FeatureLimit> => {
    const user = await requireAuth()
    const supabase = createClient()

    // Call database function
    const { data, error } = await supabase.rpc('check_feature_access', {
      p_user_id: user.id,
      p_feature_key: featureKey,
      p_org_id: orgId || null,
    })

    if (error) {
      console.error('Error checking feature access:', error)
      // Default to free tier on error
      return { limit: 0, enabled: false }
    }

    return (data as FeatureLimit) || { limit: 0, enabled: false }
  }
)

/**
 * Require a feature to be enabled
 */
export async function requireFeature(featureKey: string, orgId?: string) {
  const access = await checkFeatureAccess(featureKey, orgId)

  if (!access.enabled) {
    throw new Error(`Feature '${featureKey}' is not available on your plan`)
  }

  return access
}

/**
 * Check if usage is within limits
 */
export async function checkUsageLimit(
  featureKey: string,
  currentUsage: number,
  orgId?: string
): Promise<{ allowed: boolean; limit: number; remaining: number }> {
  const access = await checkFeatureAccess(featureKey, orgId)

  if (access.unlimited) {
    return { allowed: true, limit: -1, remaining: -1 }
  }

  const limit = access.limit || 0
  const remaining = Math.max(0, limit - currentUsage)
  const allowed = currentUsage < limit

  return { allowed, limit, remaining }
}

/**
 * Get user's current plan
 */
export const getUserPlan = cache(async (orgId?: string): Promise<string> => {
  const user = await requireAuth()
  const supabase = createClient()

  if (orgId) {
    // Check org subscription
    const { data: subscription } = await supabase
      .from('org_subscriptions')
      .select('plan_name, status')
      .eq('org_id', orgId)
      .eq('status', 'active')
      .maybeSingle()

    return subscription?.plan_name || 'free'
  }

  // Check user subscription (fallback)
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('plan_name, status')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .maybeSingle()

  return subscription?.plan_name || 'free'
})

/**
 * Get all plan features
 */
export const getPlanFeatures = cache(async (planName: string) => {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('plan_features')
    .select('feature_key, feature_value')
    .eq('plan_name', planName)

  if (error) {
    console.error('Error fetching plan features:', error)
    return []
  }

  return data || []
})
```

**File to create:** `apps/web/lib/features/client.ts`

```typescript
'use client'

import { useQuery } from '@tanstack/react-query'

export interface FeatureAccess {
  enabled: boolean
  limit?: number
  unlimited?: boolean
}

/**
 * Client-side feature check hook (for UI purposes only, NOT security)
 */
export function useFeatureAccess(featureKey: string, orgId?: string) {
  return useQuery({
    queryKey: ['feature-access', featureKey, orgId],
    queryFn: async () => {
      const params = new URLSearchParams({ feature: featureKey })
      if (orgId) params.append('orgId', orgId)

      const res = await fetch(`/api/features/check?${params}`)
      if (!res.ok) throw new Error('Failed to check feature access')

      const data = await res.json()
      return data.data as FeatureAccess
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Client-side usage check hook
 */
export function useUsageLimit(
  featureKey: string,
  currentUsage: number,
  orgId?: string
) {
  return useQuery({
    queryKey: ['usage-limit', featureKey, currentUsage, orgId],
    queryFn: async () => {
      const params = new URLSearchParams({
        feature: featureKey,
        usage: String(currentUsage),
      })
      if (orgId) params.append('orgId', orgId)

      const res = await fetch(`/api/features/usage?${params}`)
      if (!res.ok) throw new Error('Failed to check usage limit')

      const data = await res.json()
      return data.data as {
        allowed: boolean
        limit: number
        remaining: number
      }
    },
    staleTime: 1 * 60 * 1000, // 1 minute
  })
}
```

---

### Step 2: Create Feature Check API Routes

**File to create:** `apps/web/app/api/features/check/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { checkFeatureAccess } from '@/lib/features/server'
import { requireAuth } from '@/lib/auth/server'
import type { ApiResponse } from '@/lib/api/types'

export async function GET(req: NextRequest) {
  try {
    await requireAuth()
  } catch {
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    )
  }

  const { searchParams } = new URL(req.url)
  const featureKey = searchParams.get('feature')
  const orgId = searchParams.get('orgId')

  if (!featureKey) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Feature key is required' },
      { status: 400 }
    )
  }

  const access = await checkFeatureAccess(featureKey, orgId || undefined)

  return NextResponse.json<ApiResponse>({
    success: true,
    data: access,
  })
}
```

**File to create:** `apps/web/app/api/features/usage/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { checkUsageLimit } from '@/lib/features/server'
import { requireAuth } from '@/lib/auth/server'
import type { ApiResponse } from '@/lib/api/types'

export async function GET(req: NextRequest) {
  try {
    await requireAuth()
  } catch {
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    )
  }

  const { searchParams } = new URL(req.url)
  const featureKey = searchParams.get('feature')
  const usage = searchParams.get('usage')
  const orgId = searchParams.get('orgId')

  if (!featureKey || !usage) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Feature key and usage are required' },
      { status: 400 }
    )
  }

  const currentUsage = parseInt(usage, 10)
  if (isNaN(currentUsage)) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Invalid usage value' },
      { status: 400 }
    )
  }

  const result = await checkUsageLimit(
    featureKey,
    currentUsage,
    orgId || undefined
  )

  return NextResponse.json<ApiResponse>({
    success: true,
    data: result,
  })
}
```

---

### Step 3: Create Feature Gate Components

**File to create:** `apps/web/components/features/feature-gate.tsx`

```typescript
'use client'

import { useFeatureAccess } from '@/lib/features/client'
import { Button } from '@/components/ui/button'
import { Lock } from 'lucide-react'
import Link from 'next/link'

interface FeatureGateProps {
  featureKey: string
  orgId?: string
  children: React.ReactNode
  fallback?: React.ReactNode
  showUpgrade?: boolean
}

export function FeatureGate({
  featureKey,
  orgId,
  children,
  fallback,
  showUpgrade = true,
}: FeatureGateProps) {
  const { data: access, isLoading } = useFeatureAccess(featureKey, orgId)

  if (isLoading) {
    return <div className="animate-pulse">Loading...</div>
  }

  if (!access?.enabled) {
    if (fallback) return <>{fallback}</>

    if (showUpgrade) {
      return (
        <div className="rounded-lg border border-muted bg-muted/30 p-6 text-center">
          <Lock className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="mb-2 text-lg font-semibold">
            This feature is not available on your plan
          </h3>
          <p className="mb-4 text-sm text-muted-foreground">
            Upgrade to access this feature
          </p>
          <Button asChild>
            <Link href="/en/billing">Upgrade Plan</Link>
          </Button>
        </div>
      )
    }

    return null
  }

  return <>{children}</>
}
```

**File to create:** `apps/web/components/features/usage-indicator.tsx`

```typescript
'use client'

import { useUsageLimit } from '@/lib/features/client'
import { Progress } from '@/components/ui/progress'
import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import Link from 'next/link'

interface UsageIndicatorProps {
  featureKey: string
  currentUsage: number
  orgId?: string
  label: string
}

export function UsageIndicator({
  featureKey,
  currentUsage,
  orgId,
  label,
}: UsageIndicatorProps) {
  const { data: usage, isLoading } = useUsageLimit(
    featureKey,
    currentUsage,
    orgId
  )

  if (isLoading || !usage) return null

  const { allowed, limit, remaining } = usage

  if (limit === -1) {
    return (
      <div className="text-sm text-muted-foreground">
        {label}: {currentUsage} (Unlimited)
      </div>
    )
  }

  const percentage = (currentUsage / limit) * 100
  const isNearLimit = percentage >= 80

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span>{label}</span>
        <span
          className={isNearLimit ? 'font-semibold text-destructive' : ''}
        >
          {currentUsage} / {limit}
        </span>
      </div>

      <Progress value={percentage} className="h-2" />

      {isNearLimit && (
        <Alert variant={!allowed ? 'destructive' : 'default'}>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>
            {!allowed ? 'Limit Reached' : 'Approaching Limit'}
          </AlertTitle>
          <AlertDescription>
            {!allowed
              ? `You've reached your ${label.toLowerCase()} limit. `
              : `You have ${remaining} ${label.toLowerCase()} remaining. `}
            <Link href="/en/billing" className="underline">
              Upgrade your plan
            </Link>{' '}
            to increase limits.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
```

---

### Step 4: Create Upgrade Prompt Modal

**File to create:** `apps/web/components/features/upgrade-modal.tsx`

```typescript
'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Check, Sparkles } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface UpgradeModalProps {
  isOpen: boolean
  onClose: () => void
  featureName: string
  requiredPlan: string
}

export function UpgradeModal({
  isOpen,
  onClose,
  featureName,
  requiredPlan,
}: UpgradeModalProps) {
  const router = useRouter()

  const planFeatures = {
    pro: [
      '10,000 records',
      '10,000 API calls/month',
      '50 automations',
      '50GB storage',
      'Priority support',
    ],
    business: [
      'Unlimited records',
      '100,000 API calls/month',
      'Unlimited automations',
      '500GB storage',
      'Advanced analytics',
      'SSO',
      'Priority support',
    ],
  }

  const features = planFeatures[requiredPlan as keyof typeof planFeatures] || []

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-center">
            Upgrade to {requiredPlan.charAt(0).toUpperCase() + requiredPlan.slice(1)}
          </DialogTitle>
          <DialogDescription className="text-center">
            <strong>{featureName}</strong> requires a {requiredPlan} plan or higher.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <p className="mb-3 text-sm font-semibold">Included in this plan:</p>
          <ul className="space-y-2">
            {features.map((feature, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button
            onClick={() => {
              router.push('/en/billing')
              onClose()
            }}
            className="w-full"
          >
            View Plans
          </Button>
          <Button variant="outline" onClick={onClose} className="w-full">
            Maybe Later
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/**
 * Hook to trigger upgrade modal
 */
export function useUpgradeModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [featureName, setFeatureName] = useState('')
  const [requiredPlan, setRequiredPlan] = useState('pro')

  const showUpgrade = (feature: string, plan: string = 'pro') => {
    setFeatureName(feature)
    setRequiredPlan(plan)
    setIsOpen(true)
  }

  return {
    isOpen,
    featureName,
    requiredPlan,
    showUpgrade,
    closeUpgrade: () => setIsOpen(false),
  }
}
```

---

### Step 5: Create Feature Gate Middleware

**File to create:** `apps/web/lib/features/middleware.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { checkFeatureAccess } from './server'

/**
 * Middleware to check feature access before allowing route access
 */
export async function withFeatureGate(
  req: NextRequest,
  featureKey: string,
  orgIdFromParams?: string
) {
  try {
    const access = await checkFeatureAccess(featureKey, orgIdFromParams)

    if (!access.enabled) {
      return NextResponse.redirect(
        new URL(
          `/en/billing?upgrade=${featureKey}`,
          req.url
        )
      )
    }

    return NextResponse.next()
  } catch (error) {
    console.error('Feature gate error:', error)
    return NextResponse.redirect(new URL('/en/dashboard', req.url))
  }
}
```

---

## ✅ Acceptance Criteria

- [ ] Feature access utilities created (server & client)
- [ ] Feature check API routes implemented
- [ ] Feature gate component displays upgrade prompts
- [ ] Usage indicator shows limits and remaining quota
- [ ] Upgrade modal provides clear call-to-action
- [ ] Server-side feature checks enforce security
- [ ] Client-side checks provide immediate UI feedback
- [ ] All plan tiers tested (free, pro, business, enterprise)
- [ ] Feature limits enforced correctly
- [ ] Upgrade paths work end-to-end
- [ ] Integration tests pass
- [ ] E2E tests pass

---

## ✅ Definition of Done Checklist

- [ ] All acceptance criteria met
- [ ] TypeScript strict mode - zero errors
- [ ] ESLint + Prettier pass
- [ ] All tests pass
- [ ] Build succeeds
- [ ] Feature gating patterns documented
- [ ] Security verified (server-side checks)
- [ ] UX verified (clear upgrade prompts)

---

## 🔍 Verification Commands

```bash
cd apps/web && pnpm typecheck && pnpm lint && pnpm test && pnpm e2e && pnpm build

# Verify plan features via MCP
call SupabaseMCP.select {"table": "plan_features", "select": "plan_name,feature_key,feature_value", "limit": 20}

# Test feature access function
call SupabaseMCP.executeSQL {"query": "SELECT check_feature_access('USER_ID', 'max_records', null)"}
```

---

## 🚀 Next Phase

**Phase 2.7: Usage Tracking & Dashboard** - Implement usage event logging and admin dashboard


