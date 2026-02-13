# Permissions

**Complete guide to permissions and authorization in the LiNKdev Starter Kit**

---

## Table of Contents

1. [Overview](#overview)
2. [Permission Model](#permission-model)
3. [Platform Roles](#platform-roles)
4. [Organization Roles](#organization-roles)
5. [Entitlements](#entitlements)
6. [Authorization Flow](#authorization-flow)
7. [Database Implementation](#database-implementation)
8. [Implementation Examples](#implementation-examples)
9. [Troubleshooting](#troubleshooting)

---

## Overview

The LiNKdev Starter Kit uses a hybrid **RBAC (Role-Based Access Control)** and **ABAC (Attribute-Based Access Control)** system. This provides:

- **Platform-level** access control for global administrative features
- **Organization-level** access control for workspace resources
- **Feature gating** based on subscription plans
- **Usage limits** enforced per organization

### Key Concepts

- **Platform Roles** - Control access to the application and global admin features
- **Organization Roles** - Control access to resources within a workspace
- **Entitlements** - Feature access based on subscription plans
- **Usage Limits** - Resource limits enforced per organization

---

## Permission Model

### Dual-Layer System

The system uses a dual-layer permission model:

1. **Platform Level:** Controls access to the application and global administrative features
2. **Organization Level:** Controls access to resources within a specific workspace (Organization)

Additionally, **Feature Gating** (Entitlements) limits actions based on the organization's subscription plan.

### Permission Hierarchy

```
Platform Role (users.account_type)
  ↓
Organization Role (organization_members.role)
  ↓
Entitlements (plan_features)
  ↓
Usage Limits (usage_events + plan_features)
```

---

## Platform Roles

### Role Definitions

Stored in `users.account_type`:

| Role | Description | Permissions |
|------|-------------|-------------|
| `super_admin` | Full system access (Developer/Owner) | All platform features, user management, system configuration |
| `admin` | Platform administrator | User account management, platform monitoring |
| `user` | Standard user | Can belong to or own organizations |

### Implementation

```typescript
// Check platform role
import { getUser } from '@/lib/auth/server';

const user = await getUser();

if (user.account_type === 'super_admin') {
  // Allow access to admin console
}

if (['super_admin', 'admin'].includes(user.account_type)) {
  // Allow access to admin features
}
```

### Server Utilities

```typescript
// lib/auth/server.ts

export async function requireAdmin() {
  const user = await getUser();
  
  if (!['super_admin', 'admin'].includes(user.account_type)) {
    throw new Error('Admin access required');
  }
  
  return user;
}

export async function requireSuperAdmin() {
  const user = await getUser();
  
  if (user.account_type !== 'super_admin') {
    throw new Error('Super admin access required');
  }
  
  return user;
}
```

---

## Organization Roles

### Role Definitions

Stored in `organization_members.role`:

| Role | Description | Permissions |
|------|-------------|-------------|
| `owner` | Creator of the organization | Manage Billing, Delete Org, Manage Roles, All admin permissions |
| `admin` | Workspace administrator | Manage Members, Update Settings, Invite Users, Create/Edit/Delete Resources |
| `editor` | Standard contributor | Create/Edit/Delete Resources (Records, Posts) |
| `viewer` | Read-only access | View Resources only |

### Role Hierarchy

```
owner > admin > editor > viewer
```

### Implementation

```typescript
// Check organization role
import { getOrgRole } from '@/lib/auth/server';

const role = await getOrgRole(userId, orgId);

if (role === 'owner') {
  // Allow billing management
}

if (['owner', 'admin'].includes(role)) {
  // Allow member management
}

if (['owner', 'admin', 'editor'].includes(role)) {
  // Allow resource creation
}
```

### Server Utilities

```typescript
// lib/auth/server.ts

export async function requireOrgRole(
  orgId: string,
  requiredRole: 'owner' | 'admin' | 'editor' | 'viewer'
) {
  const user = await getUser();
  const role = await getOrgRole(user.id, orgId);
  
  const roleHierarchy = {
    owner: 4,
    admin: 3,
    editor: 2,
    viewer: 1,
  };
  
  if (roleHierarchy[role] < roleHierarchy[requiredRole]) {
    throw new Error(`Role ${requiredRole} required`);
  }
  
  return { user, role };
}
```

---

## Entitlements

### Overview

Beyond roles, the system checks **attributes** (Plans & Usage) before authorizing sensitive actions.

### Feature Gating

Access to features is determined by the Organization's active subscription (`org_subscriptions`).

- **Source of Truth:** `plan_features` table
- **Mechanism:** The system checks if the `feature_key` is enabled for the current `plan_name`

**Example:**
> A user with `owner` role *cannot* invite a 6th member if their Plan Limit is 5 seats.

### Usage Limits

Usage is metered via the `usage_events` table.

**Mechanism:** Before creating a resource (e.g., a new Record), the system:

1. Aggregates current usage for the period
2. Compares it against the Plan Limit
3. Blocks the action if the limit is exceeded

### Implementation

```typescript
import { hasEntitlement, hasExceededLimit } from '@/utils/billing/entitlements';

// Check if feature is enabled
const canUseAutomation = await hasEntitlement(orgId, 'can_use_automation', supabase);

// Check if limit exceeded
const hasExceededRecords = await hasExceededLimit(
  orgId,
  'max_records',
  currentRecordCount,
  supabase
);
```

---

## Authorization Flow

When a request reaches the API (Server Actions or tRPC):

### 1. Authentication

- Validate the User's JWT (Supabase Auth)
- Ensure the user is active

```typescript
const user = await getUser();
if (!user) {
  throw new Error('Unauthorized');
}
```

### 2. Context Resolution (Middleware)

- Extract `X-Org-ID` header or resolve from context
- **CRITICAL:** Verify the User is a member of this Organization (`organization_members` check)

```typescript
const orgId = request.headers.get('X-Org-ID');
const hasAccess = await hasOrgAccess(user.id, orgId);

if (!hasAccess) {
  throw new Error('Access denied');
}
```

### 3. Role Guard

- Check if the User's Org Role is sufficient for the endpoint (e.g., `requireRole('admin')`)

```typescript
const { role } = await requireOrgRole(orgId, 'admin');
```

### 4. Entitlement Guard

- Check if the Organization's Plan allows the feature (e.g., `assertEntitlement('max_seats')`)

```typescript
await assertEntitlement(orgId, 'can_use_automation', supabase);
```

### 5. Row Level Security (Database)

- Final line of defense. Postgres policies ensure users never see data outside their permitted scope, even if the API layer fails

```sql
-- RLS policy example
CREATE POLICY "Users can only see their org's records"
ON records FOR SELECT
USING (
  org_id IN (
    SELECT org_id FROM organization_members
    WHERE user_id = auth.uid()
  )
);
```

---

## Database Implementation

### RLS Policies

All tables (`users`, `organizations`, `usage_events`) have RLS enabled.

**Example Policy:**

```sql
-- Organization members can only see their own org's data
CREATE POLICY "org_members_select"
ON records FOR SELECT
USING (
  org_id IN (
    SELECT org_id FROM organization_members
    WHERE user_id = auth.uid()
  )
);
```

### Triggers

**Auto-create Personal Organization:**

```sql
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create personal organization
  INSERT INTO organizations (id, name, owner_id, is_personal, org_type)
  VALUES (
    gen_random_uuid(),
    NEW.raw_user_meta_data->>'display_name' || '''s Workspace',
    NEW.id,
    true,
    'personal'
  );
  
  -- Add user as owner
  INSERT INTO organization_members (org_id, user_id, role)
  VALUES (
    (SELECT id FROM organizations WHERE owner_id = NEW.id AND is_personal = true),
    NEW.id,
    'owner'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

---

## Implementation Examples

### Example 1: Protected API Route

```typescript
// app/api/records/route.ts
import { requireAuth } from '@/lib/auth/server';
import { requireOrgRole } from '@/lib/auth/server';
import { assertEntitlement } from '@/utils/billing/guards';

export async function POST(request: Request) {
  // 1. Authentication
  const user = await requireAuth();
  
  // 2. Get org context
  const { orgId } = await request.json();
  const hasAccess = await hasOrgAccess(user.id, orgId);
  if (!hasAccess) {
    return Response.json({ error: 'Access denied' }, { status: 403 });
  }
  
  // 3. Role check (editor or above can create)
  await requireOrgRole(orgId, 'editor');
  
  // 4. Entitlement check
  await assertEntitlement(orgId, 'max_records', supabase);
  
  // 5. Usage limit check
  const { reached } = await hasReachedLimit(orgId, 'records', currentCount);
  if (reached) {
    return Response.json({ error: 'Limit reached' }, { status: 403 });
  }
  
  // Create record (RLS ensures user can only create in their org)
  const { data: record } = await supabase
    .from('records')
    .insert({ org_id: orgId, ...data })
    .select()
    .single();
  
  return Response.json(record);
}
```

### Example 2: Protected Server Component

```typescript
// app/dashboard/page.tsx
import { requireAuth } from '@/lib/auth/server';
import { getOrgMemberships } from '@/lib/auth/server';

export default async function DashboardPage() {
  // Authentication check
  const user = await requireAuth();
  
  // Get user's organizations
  const memberships = await getOrgMemberships(user.id);
  
  if (memberships.length === 0) {
    return <div>No organizations found</div>;
  }
  
  // Use first org as default
  const defaultOrg = memberships[0];
  
  return (
    <div>
      <h1>Dashboard</h1>
      <p>Current Org: {defaultOrg.organizations.name}</p>
      <p>Your Role: {defaultOrg.role}</p>
    </div>
  );
}
```

### Example 3: Protected Client Component

```typescript
'use client';

import { useSession } from '@/hooks/useSession';
import { useOrgRole } from '@/hooks/useOrgRole';

export function ProtectedComponent({ orgId }: { orgId: string }) {
  const { user, loading: sessionLoading } = useSession();
  const { role, loading: roleLoading } = useOrgRole(orgId);
  
  if (sessionLoading || roleLoading) {
    return <div>Loading...</div>;
  }
  
  if (!user) {
    return <div>Please sign in</div>;
  }
  
  if (!['owner', 'admin'].includes(role)) {
    return <div>Admin access required</div>;
  }
  
  return <div>Admin content</div>;
}
```

---

## Troubleshooting

### Issue: Access denied when user should have access

**Check:**
1. User is authenticated?
2. User is member of the organization?
3. User's role is sufficient?
4. Organization has required entitlements?
5. Usage limits not exceeded?

**Debug:**

```sql
-- Check user's org memberships
SELECT * FROM organization_members WHERE user_id = 'user-uuid';

-- Check user's role in specific org
SELECT role FROM organization_members 
WHERE user_id = 'user-uuid' AND org_id = 'org-uuid';

-- Check org subscription
SELECT * FROM org_subscriptions WHERE org_id = 'org-uuid';

-- Check plan features
SELECT * FROM plan_features WHERE plan_name = 'pro';
```

### Issue: RLS blocking legitimate access

**Check:**
1. RLS policies allow access?
2. User is in organization_members table?
3. Policies use correct user_id (auth.uid())?

**Debug:**

```sql
-- Test RLS policy
SET ROLE authenticated;
SET request.jwt.claim.sub = 'user-uuid';

SELECT * FROM records WHERE org_id = 'org-uuid';
```

### Issue: Entitlement check failing

**Check:**
1. Org has active subscription?
2. Plan features seeded correctly?
3. Feature key spelled correctly?

**Debug:**

```sql
-- Check subscription
SELECT plan_name, status FROM org_subscriptions WHERE org_id = 'org-uuid';

-- Check feature
SELECT feature_value FROM plan_features 
WHERE plan_name = 'pro' AND feature_key = 'can_use_automation';
```

---

## Related Documentation

- **Authentication:** [AUTHENTICATION.md](./AUTHENTICATION.md)
- **Billing:** [BILLING.md](./BILLING.md)
- **Feature Flags:** [FEATURE_FLAGS.md](./FEATURE_FLAGS.md)
- **Organizations:** [ORGANIZATIONS.md](./ORGANIZATIONS.md)
- **Development Guide:** [../03_DEVELOPMENT/DEVELOPMENT_GUIDE.md](../03_DEVELOPMENT/DEVELOPMENT_GUIDE.md)

---

**Last Updated:** 2025-01-27
