# Organization Context Resolution

This document describes the organization context resolution system implemented to ensure consistent, RLS-safe org context across app routes.

## Overview

The org context resolver provides a single, priority-based system for determining which organization a user is working with across different routes and scenarios.

## Priority Order

The resolver determines `orgId` with this priority:

1. **`params.orgId`** - For `/org/[orgId]/**` routes (highest priority)
2. **`searchParams.orgId`** - For query parameters like `/records?orgId=...`
3. **`cookie 'org_id'`** - Persisted organization preference
4. **User's default org** - First active membership (lowest priority)

## Implementation

### Core Resolver

**File**: `apps/web/src/server/org-context.ts`

```typescript
export async function resolveOrgId(opts: {
  params?: { orgId?: string };
  searchParams?: URLSearchParams | Record<string, string>;
  cookies: RequestCookies;
  userId: string;
}): Promise<OrgContext>;
```

**Returns**: `{ orgId: string | null, source: 'param' | 'query' | 'cookie' | 'default' | null }`

### Cookie Persistence

**Function**: `persistOrgCookie(response: NextResponse, orgId: string)`

Sets the `org_id` cookie with:
- `path=/` - Available site-wide
- `sameSite=lax` - CSRF protection
- `httpOnly=false` - Client-side access for org switching
- `secure=true` in production

### Query Helpers

**File**: `apps/web/src/server/queries/orgs.ts`

- `listUserMemberships(userId: string)` - Get all user's org memberships
- `getDefaultOrgId(userId: string)` - Get user's first/oldest membership

## Usage Patterns

### Server Components

```typescript
// In page components
export default async function MyPage({ searchParams }: { searchParams: any }) {
  const user = await getCurrentUserProfile();
  if (!user) return redirect('/signin');

  const orgContext = await resolveOrgId({
    searchParams,
    cookies: cookies(),
    userId: user.id,
  });

  const { orgId, source } = orgContext;
  
  if (!orgId) {
    // Handle no org case
    return <NoOrgMessage />;
  }

  // Use orgId for data fetching
  const data = await fetchOrgData(orgId);
}
```

### Client-Side Persistence

```typescript
// Wrap components that need cookie persistence
<OrgContextProvider orgId={orgId} source={source}>
  <YourComponent />
</OrgContextProvider>
```

## RLS Integration

All organization-scoped queries should filter by the resolved `orgId`:

```typescript
// Good: Uses resolved orgId
const { data } = await supabase
  .from('records')
  .select('*')
  .eq('org_id', orgId); // RLS-safe

// Bad: No org filter
const { data } = await supabase
  .from('records')
  .select('*'); // Bypasses RLS
```

## Error Handling

### No Organizations Found

When user has no memberships:
```typescript
if (memberships.length === 0) {
  return (
    <div>
      <h1>No organizations found</h1>
      <p>TODO: invite/create org.</p>
    </div>
  );
}
```

### Access Denied

When user lacks access to specific org:
```typescript
const hasAccess = await hasOrgAccess(orgId, user.id);
if (!hasAccess) {
  return <AccessDeniedMessage />;
}
```

## Testing

**File**: `apps/web/tests/org-context.spec.ts`

Tests cover:
- Priority resolution order
- Error handling
- Cookie persistence
- Membership queries

## Future Enhancements

### Real Org Switcher UX

Current implementation provides basic org switching via query parameters:
- `/records?orgId=org-123` - Switch to specific org
- Cookie persistence for subsequent requests

**TODO**: Implement proper org switcher component with:
- Dropdown showing user's organizations
- Current org indicator
- One-click switching
- Breadcrumb navigation

### Middleware Integration

**Optional**: Extend middleware for automatic org context resolution:

```typescript
// middleware.ts
export async function middleware(request: NextRequest) {
  // For /records routes, attempt to resolve org context
  if (request.nextUrl.pathname.startsWith('/records')) {
    // Resolve and persist org context
  }
}
```

**Note**: Skipped in current implementation due to complexity. Page-level resolution is preferred for now.

## Security Considerations

1. **RLS Enforcement**: All queries must filter by resolved `orgId`
2. **Access Verification**: Use `hasOrgAccess()` before data operations
3. **Cookie Security**: `sameSite=lax` prevents CSRF, `secure` in production
4. **Input Validation**: Zod schemas validate all resolver inputs

## Org Switcher

### Client Component

**File**: `apps/web/src/components/org-switcher.tsx`

A client component that allows users to switch between their organizations:

```typescript
interface OrgSwitcherProps {
  userId: string;
  currentOrgId?: string;
}
```

**Features**:
- Fetches user memberships via `/api/orgs/memberships`
- Renders a select dropdown with organization names and roles
- Sets `org_id` cookie on change: `document.cookie = "org_id=<value>; path=/; samesite=lax"`
- Navigates to `/org/<orgId>` on selection
- Shows loading and empty states

**Usage**:
```tsx
<OrgSwitcher userId={user.id} currentOrgId={currentOrgId} />
```

### API Endpoint

**File**: `apps/web/app/api/orgs/memberships/route.ts`

Returns user's organization memberships for the switcher:

```typescript
GET /api/orgs/memberships
// Returns: Array<{org_id: string, role: string, name: string}>
```

## Shared State Components

**File**: `apps/web/src/components/org-states.tsx`

Three reusable components for consistent org page states:

- `<OrgLoading />` - Loading state with spinner
- `<OrgEmpty />` - No organizations found state
- `<OrgForbidden />` - Access denied state

## Context-Ready Pages

The following pages now use the S7 resolver and show consistent states:

- `/org/[orgId]/settings` - Organization settings
- `/org/[orgId]/team` - Team management  
- `/org/[orgId]/billing` - Billing and plans

Each page:
1. Resolves org context using `resolveOrgId()`
2. Verifies access with `hasOrgAccess()`
3. Shows appropriate state component if no access/org
4. Displays org summary (ID, role, source) for debugging

## Migration Notes

- **Backward Compatible**: Existing routes continue to work
- **Additive Only**: No breaking changes to current functionality
- **Gradual Adoption**: Can be adopted route-by-route
- **Cookie Migration**: Existing cookies are preserved and respected
- **Switcher Integration**: Dashboard layout includes org switcher

## Troubleshooting

### Common Issues

1. **No org context**: Check user memberships and default org resolution
2. **Access denied**: Verify user has membership in target organization
3. **Cookie not persisting**: Check client-side JavaScript and cookie settings
4. **RLS errors**: Ensure all queries filter by resolved `orgId`

### Debug Information

The resolver returns `source` information for debugging:
- `'param'` - From route parameter
- `'query'` - From search parameter
- `'cookie'` - From persisted cookie
- `'default'` - From user's first membership
- `null` - No org found
