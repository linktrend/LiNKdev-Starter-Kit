# Phase 2.4: API Routes & Username Checker

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
- ✅ Use Next.js App Router API routes
- ✅ Validate all inputs with Zod
- ✅ Return typed responses
- ✅ Handle errors gracefully
- ✅ Rate limit sensitive endpoints
- ✅ Require auth where appropriate
- ✅ Never expose service role key to client

---

## 🎯 Phase Overview

**Goal:** Create API routes for client-side data fetching, real-time validation, and external integrations.

**Scope:**
1. Create username availability checker API
2. Create slug availability checker API
3. Create user search API (for org invites)
4. Create org member lookup API
5. Add rate limiting middleware
6. Create API response types
7. Test all API endpoints

**Dependencies:**
- Phase 2.1, 2.2, 2.3 complete
- Database schema in place

---

## 📝 Implementation Steps

### Step 1: Create API Response Types

**File to create:** `apps/web/lib/api/types.ts`

```typescript
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination?: {
    page: number
    limit: number
    total: number
    hasMore: boolean
  }
}

export interface AvailabilityResponse {
  available: boolean
  suggestions?: string[]
}
```

---

### Step 2: Create Rate Limiting Utility

**File to create:** `apps/web/lib/api/rate-limit.ts`

```typescript
import { NextRequest } from 'next/server'

interface RateLimitConfig {
  windowMs: number // Time window in milliseconds
  max: number // Max requests per window
}

const requestCounts = new Map<string, { count: number; resetTime: number }>()

export function rateLimit(config: RateLimitConfig) {
  return (req: NextRequest) => {
    const ip = req.ip || req.headers.get('x-forwarded-for') || 'unknown'
    const now = Date.now()

    const record = requestCounts.get(ip)

    if (!record || now > record.resetTime) {
      requestCounts.set(ip, {
        count: 1,
        resetTime: now + config.windowMs,
      })
      return { success: true }
    }

    if (record.count >= config.max) {
      return {
        success: false,
        error: 'Too many requests',
        retryAfter: Math.ceil((record.resetTime - now) / 1000),
      }
    }

    record.count++
    return { success: true }
  }
}

export const defaultRateLimiter = rateLimit({ windowMs: 60000, max: 60 })
export const strictRateLimiter = rateLimit({ windowMs: 60000, max: 10 })
```

---

### Step 3: Username Availability API

**File to create:** `apps/web/app/api/check-username/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/auth/server'
import { usernameSchema } from '@/lib/validation/profile'
import { strictRateLimiter } from '@/lib/api/rate-limit'
import type { ApiResponse, AvailabilityResponse } from '@/lib/api/types'

export async function GET(req: NextRequest) {
  // Rate limit
  const rateLimitResult = strictRateLimiter(req)
  if (!rateLimitResult.success) {
    return NextResponse.json(
      { success: false, error: rateLimitResult.error },
      { status: 429, headers: { 'Retry-After': String(rateLimitResult.retryAfter) } }
    )
  }

  const { searchParams } = new URL(req.url)
  const username = searchParams.get('username')

  if (!username) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Username parameter is required' },
      { status: 400 }
    )
  }

  // Validate format
  const validation = usernameSchema.safeParse(username)
  if (!validation.success) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: validation.error.errors[0].message },
      { status: 400 }
    )
  }

  const normalizedUsername = validation.data
  const supabase = createClient()

  // Check availability
  const { data, error } = await supabase
    .from('users')
    .select('username')
    .eq('username', normalizedUsername)
    .maybeSingle()

  if (error) {
    console.error('Error checking username:', error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }

  const available = !data

  // Generate suggestions if taken
  let suggestions: string[] = []
  if (!available) {
    for (let i = 1; i <= 3; i++) {
      const suggestion = `${normalizedUsername}${Math.floor(Math.random() * 1000)}`
      suggestions.push(suggestion)
    }
  }

  return NextResponse.json<ApiResponse<AvailabilityResponse>>({
    success: true,
    data: {
      available,
      suggestions: available ? undefined : suggestions,
    },
  })
}
```

---

### Step 4: Slug Availability API

**File to create:** `apps/web/app/api/check-slug/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/auth/server'
import { z } from 'zod'
import { strictRateLimiter } from '@/lib/api/rate-limit'
import type { ApiResponse, AvailabilityResponse } from '@/lib/api/types'

const slugSchema = z
  .string()
  .min(3)
  .max(50)
  .regex(/^[a-z0-9-]+$/)

export async function GET(req: NextRequest) {
  const rateLimitResult = strictRateLimiter(req)
  if (!rateLimitResult.success) {
    return NextResponse.json(
      { success: false, error: rateLimitResult.error },
      { status: 429 }
    )
  }

  const { searchParams } = new URL(req.url)
  const slug = searchParams.get('slug')

  if (!slug) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Slug parameter is required' },
      { status: 400 }
    )
  }

  const validation = slugSchema.safeParse(slug)
  if (!validation.success) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: validation.error.errors[0].message },
      { status: 400 }
    )
  }

  const supabase = createClient()

  const { data, error } = await supabase
    .from('organizations')
    .select('slug')
    .eq('slug', validation.data)
    .maybeSingle()

  if (error) {
    console.error('Error checking slug:', error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }

  const available = !data

  let suggestions: string[] = []
  if (!available) {
    for (let i = 1; i <= 3; i++) {
      suggestions.push(`${validation.data}-${Math.floor(Math.random() * 1000)}`)
    }
  }

  return NextResponse.json<ApiResponse<AvailabilityResponse>>({
    success: true,
    data: { available, suggestions: available ? undefined : suggestions },
  })
}
```

---

### Step 5: User Search API (for invitations)

**File to create:** `apps/web/app/api/users/search/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient, requireAuth } from '@/lib/auth/server'
import { z } from 'zod'
import { defaultRateLimiter } from '@/lib/api/rate-limit'
import type { ApiResponse } from '@/lib/api/types'

const searchQuerySchema = z.object({
  q: z.string().min(2).max(50),
  limit: z.coerce.number().min(1).max(20).default(10),
})

export async function GET(req: NextRequest) {
  // Require auth
  try {
    await requireAuth()
  } catch {
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    )
  }

  // Rate limit
  const rateLimitResult = defaultRateLimiter(req)
  if (!rateLimitResult.success) {
    return NextResponse.json(
      { success: false, error: rateLimitResult.error },
      { status: 429 }
    )
  }

  const { searchParams } = new URL(req.url)
  const validation = searchQuerySchema.safeParse({
    q: searchParams.get('q'),
    limit: searchParams.get('limit'),
  })

  if (!validation.success) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: validation.error.errors[0].message },
      { status: 400 }
    )
  }

  const { q, limit } = validation.data
  const supabase = createClient()

  // Search by email or username
  const { data, error } = await supabase
    .from('users')
    .select('id, username, email, full_name, avatar_url')
    .or(`username.ilike.%${q}%,email.ilike.%${q}%,full_name.ilike.%${q}%`)
    .limit(limit)

  if (error) {
    console.error('Error searching users:', error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }

  return NextResponse.json<ApiResponse>({
    success: true,
    data: data || [],
  })
}
```

---

### Step 6: Organization Members API

**File to create:** `apps/web/app/api/organizations/[orgId]/members/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient, requireAuth } from '@/lib/auth/server'
import { defaultRateLimiter } from '@/lib/api/rate-limit'
import type { ApiResponse } from '@/lib/api/types'

export async function GET(
  req: NextRequest,
  { params }: { params: { orgId: string } }
) {
  // Require auth
  let currentUser
  try {
    currentUser = await requireAuth()
  } catch {
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    )
  }

  // Rate limit
  const rateLimitResult = defaultRateLimiter(req)
  if (!rateLimitResult.success) {
    return NextResponse.json(
      { success: false, error: rateLimitResult.error },
      { status: 429 }
    )
  }

  const { orgId } = params
  const supabase = createClient()

  // Check if user is member of this org
  const { data: membership } = await supabase
    .from('organization_members')
    .select('role')
    .eq('org_id', orgId)
    .eq('user_id', currentUser.id)
    .maybeSingle()

  if (!membership) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Forbidden' },
      { status: 403 }
    )
  }

  // Fetch members
  const { data, error } = await supabase
    .from('organization_members')
    .select(`
      role,
      joined_at,
      users (
        id,
        username,
        email,
        full_name,
        avatar_url
      )
    `)
    .eq('org_id', orgId)
    .order('joined_at', { ascending: true })

  if (error) {
    console.error('Error fetching members:', error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }

  return NextResponse.json<ApiResponse>({
    success: true,
    data: data || [],
  })
}
```

---

### Step 7: API Client Utilities

**File to create:** `apps/web/lib/api/client.ts`

```typescript
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: any
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export async function apiClient<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(endpoint, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  })

  const data = await res.json()

  if (!res.ok) {
    throw new ApiError(
      data.error || 'API request failed',
      res.status,
      data
    )
  }

  return data.data
}

// Specific API calls
export const api = {
  checkUsername: (username: string) =>
    apiClient<{ available: boolean; suggestions?: string[] }>(
      `/api/check-username?username=${encodeURIComponent(username)}`
    ),

  checkSlug: (slug: string) =>
    apiClient<{ available: boolean; suggestions?: string[] }>(
      `/api/check-slug?slug=${encodeURIComponent(slug)}`
    ),

  searchUsers: (query: string, limit = 10) =>
    apiClient<any[]>(
      `/api/users/search?q=${encodeURIComponent(query)}&limit=${limit}`
    ),

  getOrgMembers: (orgId: string) =>
    apiClient<any[]>(`/api/organizations/${orgId}/members`),
}
```

---

## ✅ Acceptance Criteria

- [ ] API response types defined
- [ ] Rate limiting implemented
- [ ] Username availability API works
- [ ] Slug availability API works
- [ ] User search API works
- [ ] Org members API works
- [ ] API client utilities created
- [ ] All APIs require appropriate auth
- [ ] All APIs validate inputs
- [ ] All APIs return typed responses
- [ ] Rate limits prevent abuse
- [ ] Integration tests pass

---

## ✅ Definition of Done Checklist

- [ ] All acceptance criteria met
- [ ] TypeScript strict mode - zero errors
- [ ] ESLint + Prettier pass
- [ ] All tests pass
- [ ] Build succeeds
- [ ] Zod schemas validate all inputs
- [ ] Rate limiting prevents abuse
- [ ] Accessibility requirements met

---

## 🔍 Verification Commands

```bash
cd apps/web && pnpm typecheck && pnpm lint && pnpm test && pnpm build

# Test APIs manually
curl "http://localhost:3000/api/check-username?username=testuser"
curl "http://localhost:3000/api/check-slug?slug=my-org"
```

---

## 🚀 Next Phase

**Phase 2.5: Billing & Stripe Integration** - Implement subscription management and Stripe webhooks


