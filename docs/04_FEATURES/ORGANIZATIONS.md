# Organizations

**Complete guide to organization context and multi-organization support**

---

## Table of Contents

1. [Overview](#overview)
2. [Organization Context Resolution](#organization-context-resolution)
3. [Priority Order](#priority-order)
4. [Implementation](#implementation)
5. [Organization Switcher](#organization-switcher)
6. [Multi-Organization Support](#multi-organization-support)
7. [RLS Integration](#rls-integration)
8. [Troubleshooting](#troubleshooting)

---

## Overview

The LiNKdev Starter Kit uses **organization-scoped resources** where all data belongs to an organization. The organization context resolver provides a single, priority-based system for determining which organization a user is working with across different routes and scenarios.

### Key Concepts

- **Organization Context** - The current organization a user is working with
- **Context Resolution** - Determining which org to use based on priority
- **Multi-Organization** - Users can belong to multiple organizations
- **Personal Organizations** - Auto-created for every user on signup

---

## Organization Context Resolution

### Overview

The org context resolver provides a single, priority-based system for determining which organization a user is working with across different routes and scenarios.

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

---

## Priority Order

The resolver determines `orgId` with this priority:

1. **`params.orgId`** - For `/org/[orgId]/**` routes (highest priority)
2. **`searchParams.orgId`** - For query parameters like `/records?orgId=...`
3. **`cookie 'org_id'`** - Persisted organization preference
4. **User's default org** - First active membership (lowest priority)

### Example Priority Flow

```typescript
// 1. Route parameter (highest priority)
// URL: /org/org-123/settings
resolveOrgId({ params: { orgId: 'org-123' } })
// Returns: { orgId: 'org-123', source: 'param' }

// 2. Query parameter
// URL: /records?orgId=org-456
resolveOrgId({ searchParams: { orgId: 'org-456' } })
// Returns: { orgId: 'org-456', source: 'query' }

// 3. Cookie
// Cookie: org_id=org-789
resolveOrgId({ cookies: { get: () => ({ value: 'org-789' }) } })
// Returns: { orgId: 'org-789', source: 'cookie' }

// 4. Default org (lowest priority)
resolveOrgId({ userId: 'user-123' })
// Returns: { orgId: 'default-org-id', source: 'default' }
```

---

## Implementation

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
  
  return (
    <div>
      <h1>Organization: {orgId}</h1>
      <p>Source: {source}</p>
      {/* Render data */}
    </div>
  );
}
```

### Cookie Persistence

**Function**: `persistOrgCookie(response: NextResponse, orgId: string)`

Sets the `org_id` cookie with:
- `path=/` - Available site-wide
- `sameSite=lax` - CSRF protection
- `httpOnly=false` - Client-side access for org switching
- `secure=true` in production

```typescript
import { persistOrgCookie } from '@/server/org-context';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const orgId = await resolveOrgId(...);
  
  const response = NextResponse.json({ orgId });
  
  if (orgId) {
    persistOrgCookie(response, orgId);
  }
  
  return response;
}
```

### Query Helpers

**File**: `apps/web/src/server/queries/orgs.ts`

```typescript
// Get all user's org memberships
export async function listUserMemberships(userId: string) {
  const { data } = await supabase
    .from('organization_members')
    .select(`
      role,
      organizations (
        id,
        name,
        org_type,
        is_personal,
        avatar_url
      )
    `)
    .eq('user_id', userId);
  
  return data;
}

// Get user's default org (first/oldest membership)
export async function getDefaultOrgId(userId: string) {
  const memberships = await listUserMemberships(userId);
  
  if (memberships.length === 0) {
    return null;
  }
  
  // Return first active membership
  return memberships[0].organizations.id;
}
```

---

## Organization Switcher

### Client Component

**File**: `apps/web/src/components/org-switcher.tsx`

A client component that allows users to switch between their organizations:

```typescript
interface OrgSwitcherProps {
  userId: string;
  currentOrgId?: string;
}

export function OrgSwitcher({ userId, currentOrgId }: OrgSwitcherProps) {
  const [orgs, setOrgs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch user's organizations
    fetch('/api/orgs/memberships')
      .then(res => res.json())
      .then(data => {
        setOrgs(data);
        setLoading(false);
      });
  }, [userId]);

  const handleSwitch = (orgId: string) => {
    // Set cookie
    document.cookie = `org_id=${orgId}; path=/; samesite=lax`;
    
    // Navigate to org context
    router.push(`/org/${orgId}`);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <Select value={currentOrgId} onValueChange={handleSwitch}>
      {orgs.map(org => (
        <SelectItem key={org.id} value={org.id}>
          {org.name} ({org.role})
        </SelectItem>
      ))}
    </Select>
  );
}
```

**Usage:**

```tsx
<OrgSwitcher userId={user.id} currentOrgId={currentOrgId} />
```

### API Endpoint

**File**: `apps/web/app/api/orgs/memberships/route.ts`

Returns user's organization memberships for the switcher:

```typescript
import { requireAuth } from '@/lib/auth/server';
import { listUserMemberships } from '@/server/queries/orgs';

export async function GET() {
  const user = await requireAuth();
  
  const memberships = await listUserMemberships(user.id);
  
  return Response.json(
    memberships.map(m => ({
      org_id: m.organizations.id,
      name: m.organizations.name,
      role: m.role,
      is_personal: m.organizations.is_personal,
    }))
  );
}
```

---

## Multi-Organization Support

### User's Organization List

```typescript
// Get all orgs user belongs to
const { data: memberships } = await supabase
  .from('organization_members')
  .select(`
    role,
    organizations (
      id,
      name,
      org_type,
      is_personal,
      avatar_url
    )
  `)
  .eq('user_id', user.id);

// Separate personal and team orgs
const personalOrg = memberships.find(m => m.organizations.is_personal);
const teamOrgs = memberships.filter(m => !m.organizations.is_personal);
```

### Org Switcher State Management

```typescript
// Store current org in context/state
const [currentOrg, setCurrentOrg] = useState(personalOrg);

// Switch organization
function switchOrg(orgId: string) {
  const org = memberships.find(m => m.organizations.id === orgId);
  setCurrentOrg(org.organizations);
  
  // Persist to cookie
  document.cookie = `org_id=${orgId}; path=/; samesite=lax`;
  
  // Reload data for new org context
  refetchOrgData();
}
```

### Shared State Components

**File**: `apps/web/src/components/org-states.tsx`

Three reusable components for consistent org page states:

```typescript
// Loading state
export function OrgLoading() {
  return (
    <div className="flex items-center justify-center p-8">
      <Spinner />
      <p className="ml-2">Loading organization...</p>
    </div>
  );
}

// No organizations found
export function OrgEmpty() {
  return (
    <div className="text-center p-8">
      <h2 className="text-lg font-semibold mb-2">No organizations found</h2>
      <p className="text-muted-foreground mb-4">
        You don't belong to any organizations yet.
      </p>
      <Button asChild>
        <Link href="/org/create">Create Organization</Link>
      </Button>
    </div>
  );
}

// Access denied
export function OrgForbidden() {
  return (
    <div className="text-center p-8">
      <h2 className="text-lg font-semibold mb-2">Access Denied</h2>
      <p className="text-muted-foreground">
        You don't have access to this organization.
      </p>
    </div>
  );
}
```

---

## RLS Integration

### All organization-scoped queries should filter by the resolved `orgId`:

```typescript
// ✅ Good: Uses resolved orgId
const { data } = await supabase
  .from('records')
  .select('*')
  .eq('org_id', orgId); // RLS-safe

// ❌ Bad: No org filter
const { data } = await supabase
  .from('records')
  .select('*'); // Bypasses RLS
```

### Access Verification

```typescript
// Verify user has access to org
export async function hasOrgAccess(userId: string, orgId: string): Promise<boolean> {
  const { data } = await supabase
    .from('organization_members')
    .select('id')
    .eq('user_id', userId)
    .eq('org_id', orgId)
    .single();
  
  return !!data;
}

// Usage
const orgContext = await resolveOrgId(...);
if (orgContext.orgId) {
  const hasAccess = await hasOrgAccess(user.id, orgContext.orgId);
  if (!hasAccess) {
    return <OrgForbidden />;
  }
}
```

---

## Error Handling

### No Organizations Found

When user has no memberships:

```typescript
const orgContext = await resolveOrgId(...);

if (!orgContext.orgId) {
  return <OrgEmpty />;
}
```

### Access Denied

When user lacks access to specific org:

```typescript
const orgContext = await resolveOrgId(...);

if (orgContext.orgId) {
  const hasAccess = await hasOrgAccess(user.id, orgContext.orgId);
  if (!hasAccess) {
    return <OrgForbidden />;
  }
}
```

---

## Troubleshooting

### Issue: No org context resolved

**Check:**
1. User has memberships?
2. Default org resolution working?
3. Cookie being set correctly?

**Debug:**

```sql
-- Check user's memberships
SELECT * FROM organization_members WHERE user_id = 'user-uuid';

-- Check default org
SELECT org_id FROM organization_members 
WHERE user_id = 'user-uuid' 
ORDER BY created_at ASC 
LIMIT 1;
```

### Issue: Wrong org context

**Check:**
1. Priority order correct?
2. Cookie value correct?
3. Route parameter correct?

**Debug:**

```typescript
// Log resolution source
const orgContext = await resolveOrgId(...);
console.log('Org ID:', orgContext.orgId);
console.log('Source:', orgContext.source);
```

### Issue: RLS errors

**Check:**
1. All queries filter by `org_id`?
2. User has membership in org?
3. RLS policies correct?

**Debug:**

```sql
-- Check membership
SELECT * FROM organization_members 
WHERE user_id = auth.uid() AND org_id = 'org-uuid';

-- Test RLS policy
SET ROLE authenticated;
SET request.jwt.claim.sub = 'user-uuid';
SELECT * FROM records WHERE org_id = 'org-uuid';
```

### Issue: Cookie not persisting

**Check:**
1. Cookie settings correct?
2. Client-side JavaScript working?
3. SameSite settings correct?

**Debug:**

```typescript
// Check cookie in browser console
console.log(document.cookie);

// Manually set cookie
document.cookie = 'org_id=test-org-id; path=/; samesite=lax';
```

---

## Security Considerations

1. **RLS Enforcement**: All queries must filter by resolved `orgId`
2. **Access Verification**: Use `hasOrgAccess()` before data operations
3. **Cookie Security**: `sameSite=lax` prevents CSRF, `secure` in production
4. **Input Validation**: Zod schemas validate all resolver inputs

---

## Related Documentation

- **Permissions:** [PERMISSIONS.md](./PERMISSIONS.md)
- **Billing:** [BILLING.md](./BILLING.md)
- **Development Guide:** [../03_DEVELOPMENT/DEVELOPMENT_GUIDE.md](../03_DEVELOPMENT/DEVELOPMENT_GUIDE.md)

---

**Last Updated:** 2025-01-27
