# API Overview

**LiNKdev Starter Kit - Complete API Architecture Documentation**

---

## Table of Contents

1. [API Architecture](#api-architecture)
2. [tRPC Setup](#trpc-setup)
3. [REST Endpoints](#rest-endpoints)
4. [Authentication](#authentication)
5. [Error Handling](#error-handling)
6. [Rate Limiting](#rate-limiting)
7. [Pagination](#pagination)
8. [Type Safety](#type-safety)

---

## API Architecture

The LiNKdev Starter Kit provides a **dual API architecture** combining:

- **tRPC** - Type-safe, end-to-end TypeScript API for internal use
- **REST API** - Standard HTTP endpoints for external integrations

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      Client Layer                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  React App   │  │  Mobile App  │  │  External    │      │
│  │  (tRPC)      │  │  (REST)      │  │  Services    │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
└─────────┼──────────────────┼──────────────────┼─────────────┘
          │                  │                  │
          ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────────┐
│                    API Layer                                  │
│  ┌──────────────────┐      ┌──────────────────┐              │
│  │   tRPC Router    │      │   REST Routes    │              │
│  │  /api/trpc       │      │  /api/v1/*       │              │
│  └────────┬─────────┘      └────────┬─────────┘              │
│           │                         │                         │
│           └──────────┬──────────────┘                         │
│                      ▼                                        │
│              ┌───────────────┐                                │
│              │  tRPC Caller  │                                │
│              │  (Shared)     │                                │
│              └───────┬───────┘                                │
└──────────────────────┼────────────────────────────────────────┘
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                  Business Logic Layer                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Routers     │  │  Middleware  │  │  Services    │      │
│  │  (packages/  │  │  (Auth,      │  │  (Billing,   │      │
│  │   api/src/   │  │   Audit)     │  │   Usage)     │      │
│  │   routers/)  │  │              │  │              │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
└─────────┼──────────────────┼──────────────────┼─────────────┘
          │                  │                  │
          └──────────────────┼──────────────────┘
                             ▼
              ┌──────────────────────────┐
              │   Supabase PostgreSQL    │
              │   (with RLS)             │
              └──────────────────────────┘
```

### Key Design Principles

1. **Type Safety First** - End-to-end TypeScript with Zod validation
2. **Single Source of Truth** - REST endpoints delegate to tRPC procedures
3. **Organization-Scoped** - All operations are scoped to organizations
4. **Audit Trail** - Built-in audit logging for all mutations
5. **Usage Tracking** - Automatic usage metrics collection

---

## tRPC Setup

### Configuration

tRPC is configured in `packages/api/src/trpc.ts`:

```typescript
import { initTRPC, TRPCError } from '@trpc/server';
import SuperJSON from 'superjson';

const t = initTRPC.context<TRPCContext>().create({
  transformer: SuperJSON, // Enables Date, Map, Set serialization
});

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = publicProcedure
  .use(({ ctx, next }) => {
    if (!ctx.user) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'You must be logged in to access this resource',
      });
    }
    return next({
      ctx: {
        ...ctx,
        user: ctx.user as NonNullable<typeof ctx.user>,
      },
    });
  })
  .use(({ ctx, next, path }) => {
    // Automatic usage logging
    if (ctx.user) {
      safeUsageLog(ctx.usageLogger, {
        userId: ctx.user.id,
        orgId: ctx.orgId,
        eventType: 'api_call',
        metadata: { procedure: path },
      });
    }
    return next();
  });
```

### Context Structure

The tRPC context (`TRPCContext`) includes:

```typescript
type TRPCContext = {
  user: {
    id: string;
    email?: string;
  } | null;
  supabase: SupabaseClient;
  posthog: {
    capture: (event: string, properties?: Record<string, unknown>) => void;
  } | null;
  headers?: Headers;
  usageLogger?: UsageLogger;
  orgId?: string; // Organization context
};
```

### Client Setup (React)

```typescript
// apps/web/src/trpc/react.tsx
import { createTRPCReact } from '@trpc/react-query';
import { httpBatchLink } from '@trpc/client';
import SuperJSON from 'superjson';
import type { AppRouter } from '@starter/api';

export const api = createTRPCReact<AppRouter>();

export function TRPCReactProvider({ children }: { children: React.ReactNode }) {
  const [trpcClient] = useState(() =>
    api.createClient({
      transformer: SuperJSON,
      links: [
        httpBatchLink({
          url: '/api/trpc',
          headers: () => ({
            'x-trpc-source': 'nextjs-react',
          }),
        }),
      ],
    })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <api.Provider client={trpcClient} queryClient={queryClient}>
        {children}
      </api.Provider>
    </QueryClientProvider>
  );
}
```

### Server-Side Usage

```typescript
// apps/web/src/server/api/trpc.ts
import { createTRPCContext } from '@/server/api/trpc';
import { appRouter } from '@starter/api';

export async function createCaller() {
  const ctx = await createTRPCContext();
  return appRouter.createCaller(ctx);
}

// Usage in Server Components or Server Actions
const caller = await createCaller();
const user = await caller.user.getProfile();
```

### Endpoint Handler

```typescript
// apps/web/src/app/api/trpc/[trpc]/route.ts
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '@starter/api';
import { createTRPCContext } from '@/server/api/trpc';

const handler = (req: NextRequest) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: () => createTRPCContext({ headers: req.headers }),
    onError:
      process.env.NODE_ENV === 'development'
        ? ({ path, error }) => {
            console.error(`❌ tRPC failed on ${path}: ${error.message}`);
          }
        : undefined,
  });

export { handler as GET, handler as POST };
```

---

## REST Endpoints

### Base URLs

- **Development**: `http://localhost:3000/api/v1`
- **Production**: `https://your-domain.com/api/v1`

### Endpoint Structure

REST endpoints are organized by resource:

```
/api/v1/
├── records/          # Record management
├── orgs/             # Organization management
├── billing/          # Billing & subscriptions
│   ├── checkout/     # Create checkout session
│   └── subscription/ # Subscription management
├── audit/            # Audit logs
└── reminders/        # Scheduling & reminders
```

### Request Format

All REST requests require:

1. **Authentication**: Bearer token in `Authorization` header
2. **Organization Context**: `X-Org-ID` header
3. **Content-Type**: `application/json` for POST/PATCH requests

```bash
curl -X GET \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "X-Org-ID: org-123" \
  https://api.example.com/v1/records
```

### Response Format

Standard REST response structure:

```typescript
// Success Response
{
  "data": { /* resource data */ },
  "meta": {
    "cursor": "next-page-cursor",
    "has_more": true,
    "total": 100
  }
}

// Error Response
{
  "error": {
    "code": "invalid_request",
    "message": "Validation failed",
    "details": {
      "field": "email",
      "reason": "Invalid email format"
    }
  }
}
```

### REST to tRPC Mapping

REST endpoints internally call tRPC procedures:

```typescript
// Example: /api/v1/records route.ts
const caller = appRouter.createCaller({
  user: auth.user,
  supabase: auth.supabase,
  orgId: auth.orgId,
  // ... other context
});

// Call tRPC procedure
const result = await caller.records.listRecords({
  org_id: auth.orgId,
  limit: 50,
});
```

---

## Authentication

### Authentication Methods

The API supports multiple authentication methods:

1. **Supabase Session** (tRPC) - Cookie-based session
2. **JWT Bearer Token** (REST) - Token in Authorization header

### tRPC Authentication

tRPC uses Supabase session cookies:

```typescript
// Context creation extracts user from session
export const createTRPCContext = async (opts?: { headers?: Headers }) => {
  const supabase = createClient({ cookies });
  const user = await getUser(); // Extracts from session cookie
  
  return {
    supabase,
    user,
    // ... other context
  };
};
```

### REST Authentication

REST endpoints require explicit authentication:

```typescript
// Authentication middleware
export async function authenticateRequest(request: NextRequest) {
  // Extract Bearer token
  const token = extractBearerToken(request);
  if (!token) {
    throw createAuthError('MISSING_TOKEN', 'Authorization header required', 401);
  }

  // Extract org ID
  const orgId = extractOrgId(request);
  if (!orgId) {
    throw createAuthError('MISSING_ORG_ID', 'X-Org-ID header required', 400);
  }

  // Validate JWT token
  const supabase = createClient({ cookies });
  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error || !user) {
    throw createAuthError('INVALID_TOKEN', 'Invalid or expired token', 401);
  }

  // Verify organization membership
  const { data: membership } = await supabase
    .from('organization_members')
    .select('org_id')
    .eq('org_id', orgId)
    .eq('user_id', user.id)
    .single();

  if (!membership) {
    throw createAuthError('ORG_ACCESS_DENIED', 'Not a member', 403);
  }

  return { user, orgId, supabase };
}
```

### Getting a JWT Token

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123',
});

const token = data.session?.access_token;
```

### Organization Context

All API operations require organization context:

- **tRPC**: Organization ID extracted from context or input
- **REST**: Organization ID required in `X-Org-ID` header

```bash
# REST API example
curl -H "X-Org-ID: org-123" \
     -H "Authorization: Bearer TOKEN" \
     https://api.example.com/v1/records
```

---

## Error Handling

### tRPC Error Codes

tRPC uses standard error codes:

```typescript
export enum TRPCErrorCode {
  PARSE_ERROR = 'PARSE_ERROR',
  BAD_REQUEST = 'BAD_REQUEST',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  METHOD_NOT_SUPPORTED = 'METHOD_NOT_SUPPORTED',
  TIMEOUT = 'TIMEOUT',
  CONFLICT = 'CONFLICT',
  PRECONDITION_FAILED = 'PRECONDITION_FAILED',
  PAYLOAD_TOO_LARGE = 'PAYLOAD_TOO_LARGE',
  UNPROCESSABLE_CONTENT = 'UNPROCESSABLE_CONTENT',
  TOO_MANY_REQUESTS = 'TOO_MANY_REQUESTS',
  CLIENT_CLOSED_REQUEST = 'CLIENT_CLOSED_REQUEST',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
}
```

### Error Response Format

**tRPC Error:**
```json
{
  "error": {
    "message": "User not found",
    "code": "NOT_FOUND",
    "data": {
      "code": "NOT_FOUND",
      "httpStatus": 404
    }
  }
}
```

**REST Error:**
```json
{
  "error": {
    "code": "resource_not_found",
    "message": "Resource not found",
    "details": {
      "resource": "user",
      "id": "user-123"
    }
  }
}
```

### Error Helpers

```typescript
// packages/api/src/lib/errors.ts
export const notFoundError = (message = 'Resource not found'): TRPCError =>
  new TRPCError({ code: 'NOT_FOUND', message });

export const unauthorizedError = (message = 'Unauthorized'): TRPCError =>
  new TRPCError({ code: 'UNAUTHORIZED', message });

export const forbiddenError = (message = 'Forbidden'): TRPCError =>
  new TRPCError({ code: 'FORBIDDEN', message });

export const badRequestError = (message = 'Bad request'): TRPCError =>
  new TRPCError({ code: 'BAD_REQUEST', message });

// Convert Supabase errors
export function fromSupabase(
  error: { code?: string; message?: string } | null,
  fallbackMessage: string,
): TRPCError {
  if (error?.code === '23505') {
    return badRequestError('Duplicate record');
  }
  if (error?.code === '42501') {
    return forbiddenError('Insufficient permissions');
  }
  return internalError(fallbackMessage);
}
```

### Error Handling Example

```typescript
// In a tRPC procedure
getById: protectedProcedure
  .input(z.object({ id: z.string() }))
  .query(async ({ ctx, input }) => {
    const { data, error } = await ctx.supabase
      .from('users')
      .select('*')
      .eq('id', input.id)
      .single();

    if (error || !data) {
      throw notFoundError('User not found');
    }

    return data;
  }),
```

---

## Rate Limiting

### Rate Limit Configuration

Rate limits are configured per endpoint type:

```typescript
// apps/web/src/server/rest/ratelimit.ts
export const RATE_LIMIT_CONFIG = {
  'GET': { limit: 120, window: 60 },      // 120 req/min
  'POST': { limit: 30, window: 60 },      // 30 req/min
  'PATCH': { limit: 30, window: 60 },     // 30 req/min
  'DELETE': { limit: 30, window: 60 },   // 30 req/min
  'billing': { limit: 10, window: 60 },   // 10 req/min
};
```

### Rate Limit Headers

Responses include rate limit information:

```http
X-RateLimit-Limit: 120
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 2024-01-01T12:01:00Z
Retry-After: 60
```

### Rate Limit Error

```json
{
  "error": {
    "code": "rate_limit_exceeded",
    "message": "Rate limit exceeded",
    "details": {
      "limit": 120,
      "reset_at": "2024-01-01T12:01:00Z",
      "retry_after": 60
    }
  }
}
```

---

## Pagination

### Cursor-Based Pagination

Both tRPC and REST APIs use cursor-based pagination:

**tRPC:**
```typescript
const result = await api.records.listRecords.query({
  org_id: 'org-123',
  limit: 50,
  cursor: 'next-page-cursor', // Optional
});
```

**REST:**
```bash
GET /api/v1/records?limit=50&cursor=next-page-cursor
```

### Pagination Response

```typescript
{
  "data": [ /* items */ ],
  "meta": {
    "cursor": "next-page-cursor",
    "has_more": true,
    "total": 250
  }
}
```

### Offset-Based Pagination (Legacy)

Some endpoints support offset-based pagination:

```typescript
{
  "data": [ /* items */ ],
  "meta": {
    "offset": 50,
    "limit": 50,
    "total": 250,
    "has_more": true
  }
}
```

---

## Type Safety

### End-to-End Type Safety

The API provides end-to-end type safety:

1. **Input Validation** - Zod schemas validate inputs
2. **Type Inference** - TypeScript infers return types
3. **Client Types** - tRPC generates client types automatically

### Example: Type-Safe Procedure

```typescript
// packages/api/src/routers/user.ts
export const userRouter = createTRPCRouter({
  getProfile: protectedProcedure
    .query(async ({ ctx }) => {
      // Return type inferred from Supabase query
      const { data } = await ctx.supabase
        .from('users')
        .select('*')
        .eq('id', ctx.user.id)
        .single();
      
      return data; // Type: Database['public']['Tables']['users']['Row']
    }),

  updateProfile: protectedProcedure
    .input(z.object({
      full_name: z.string().min(1).max(120).optional(),
      avatar_url: z.string().url().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // input is typed based on Zod schema
      const { data } = await ctx.supabase
        .from('users')
        .update(input)
        .eq('id', ctx.user.id)
        .select()
        .single();
      
      return data;
    }),
});
```

### Client Usage

```typescript
// Type-safe client usage
const user = await api.user.getProfile.query();
// user is typed as Database['public']['Tables']['users']['Row']

await api.user.updateProfile.mutate({
  full_name: 'John Doe',
  avatar_url: 'https://example.com/avatar.jpg',
});
// TypeScript will error if input doesn't match schema
```

---

## Related Documentation

- [tRPC Routers](./TRPC_ROUTERS.md) - Complete tRPC API reference
- [REST Endpoints](./REST_ENDPOINTS.md) - Complete REST API reference
- [Architecture](../02_ARCHITECTURE/ARCHITECTURE.md) - System architecture overview
- [Database Schema](../02_ARCHITECTURE/DATABASE_SCHEMA.md) - Database structure
- [Authentication Guide](../04_FEATURES/PERMISSIONS.md) - Authentication & authorization

---

## Quick Reference

### tRPC Client Setup

```typescript
import { api } from '@/trpc/react';

// Query
const { data } = api.user.getProfile.useQuery();

// Mutation
const mutation = api.user.updateProfile.useMutation();

// Server-side
import { createCaller } from '@/server/api/trpc';
const caller = await createCaller();
const user = await caller.user.getProfile();
```

### REST API Client Setup

```typescript
const response = await fetch('/api/v1/records', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'X-Org-ID': orgId,
    'Content-Type': 'application/json',
  },
});

const data = await response.json();
```

---

**Last Updated**: 2025-01-17
