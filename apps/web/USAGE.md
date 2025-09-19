# Organizations & Invitations Module Usage Guide

This guide explains how to use the Organizations & Invitations module in your Hikari-based application.

## 🚀 Quick Start

### 1. Environment Setup

The module works in two modes:

**Template Mode (Offline)**
```bash
# Enable offline mode for template development
TEMPLATE_OFFLINE=1
```

**Production Mode (With Supabase)**
```bash
# Configure Supabase (optional)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key

# Optional: Configure additional services
NEXT_PUBLIC_POSTHOG_KEY=your_posthog_key
ORG_MAX_MEMBERS=100
ORG_INVITE_EXPIRY_DAYS=7
```

### 2. Database Setup (Production)

Run the migration to create the required tables:

```sql
-- This will be automatically applied when you run Supabase migrations
-- File: supabase/migrations/20250101000000__orgs_invites_enhancement.sql
```

### 3. Using the Module

#### Create an Organization

```typescript
import { api } from '@/trpc/react';

function CreateOrgForm() {
  const createOrg = api.org.createOrg.useMutation();
  
  const handleSubmit = async (name: string) => {
    try {
      const org = await createOrg.mutateAsync({ name });
      console.log('Created organization:', org);
    } catch (error) {
      console.error('Failed to create organization:', error);
    }
  };
  
  return (
    // Your form component
  );
}
```

#### List User's Organizations

```typescript
function OrgList() {
  const { data: orgs, isLoading } = api.org.listOrgs.useQuery();
  
  if (isLoading) return <div>Loading...</div>;
  
  return (
    <div>
      {orgs?.map(org => (
        <div key={org.id}>
          <h3>{org.name}</h3>
          <p>Role: {org.role}</p>
        </div>
      ))}
    </div>
  );
}
```

#### Switch Organizations

```typescript
function OrgSwitcher() {
  const setCurrent = api.org.setCurrent.useMutation();
  
  const handleSwitch = async (orgId: string) => {
    try {
      await setCurrent.mutateAsync({ orgId });
      // Organization switched successfully
    } catch (error) {
      console.error('Failed to switch organization:', error);
    }
  };
  
  return (
    // Your switcher component
  );
}
```

#### Invite Members

```typescript
function InviteForm({ orgId }: { orgId: string }) {
  const invite = api.org.invite.useMutation();
  
  const handleInvite = async (email: string, role: string) => {
    try {
      const inviteData = await invite.mutateAsync({
        orgId,
        email,
        role: role as 'admin' | 'editor' | 'viewer'
      });
      console.log('Invitation sent:', inviteData);
    } catch (error) {
      console.error('Failed to send invitation:', error);
    }
  };
  
  return (
    // Your invite form
  );
}
```

## 🎨 UI Components

### OrgSwitcher Component

```typescript
import { OrgSwitcher } from '@/components/org/OrgSwitcher';

function DashboardLayout() {
  return (
    <div>
      <header>
        <OrgSwitcher 
          currentOrg={currentOrg}
          onOrgChange={handleOrgChange}
        />
      </header>
      {/* Rest of your layout */}
    </div>
  );
}
```

### MemberRow Component

```typescript
import { MemberRow } from '@/components/org/MemberRow';

function MembersList({ members }: { members: OrganizationMember[] }) {
  return (
    <div>
      {members.map(member => (
        <MemberRow
          key={member.user_id}
          member={member}
          currentUserRole="admin"
          onRoleChange={handleRoleChange}
          onMemberRemove={handleMemberRemove}
        />
      ))}
    </div>
  );
}
```

### InviteForm Component

```typescript
import { InviteForm } from '@/components/org/InviteForm';

function InvitePage({ orgId }: { orgId: string }) {
  return (
    <div>
      <h1>Invite Team Members</h1>
      <InviteForm 
        orgId={orgId}
        onInviteSent={handleInviteSent}
      />
    </div>
  );
}
```

## 🔐 Role-Based Access Control

### Checking Permissions

```typescript
import { 
  canManageMembers, 
  canManageInvites, 
  canChangeRole 
} from '@/utils/org';

function MemberActions({ userRole, memberRole }: { 
  userRole: OrgRole; 
  memberRole: OrgRole; 
}) {
  const canManage = canManageMembers(userRole);
  const canChange = canChangeRole(memberRole, 'admin', userRole);
  
  return (
    <div>
      {canManage && (
        <button>Manage Member</button>
      )}
      {canChange && (
        <button>Change Role</button>
      )}
    </div>
  );
}
```

### Role Hierarchy

```typescript
import { isRoleHigher } from '@/utils/org';

// Check if one role is higher than another
const isAdminHigher = isRoleHigher('admin', 'editor'); // true
const isOwnerHigher = isRoleHigher('owner', 'admin'); // true
```

## 📊 Analytics Events

The module automatically tracks analytics events:

```typescript
// Events are automatically sent to PostHog (if configured)
// - org_created
// - org_switched
// - member_invited
// - member_accepted
// - member_role_updated
// - member_removed
```

## 🧪 Testing

### Unit Tests

```bash
# Run unit tests
pnpm test src/server/__tests__/org.test.ts
```

### E2E Tests

```bash
# Run Playwright tests
pnpm test:e2e tests/org.spec.ts
```

## 🛠️ Customization

### Adding Custom Roles

1. Update the `OrgRole` type in `src/types/org.ts`
2. Update role permissions in `src/utils/org.ts`
3. Update UI components to handle new roles
4. Update database migration if needed

### Custom Permissions

```typescript
// Add custom permission checks
export function hasCustomPermission(userRole: OrgRole, permission: string): boolean {
  const customPermissions = {
    owner: ['custom_permission_1', 'custom_permission_2'],
    admin: ['custom_permission_1'],
    // ... other roles
  };
  
  return customPermissions[userRole]?.includes(permission) || false;
}
```

### Custom Invite Expiry

```typescript
// Override default expiry
const customExpiry = getInviteExpiryDate(14); // 14 days instead of 7
```

## 🚨 Error Handling

The module includes comprehensive error handling:

```typescript
try {
  await createOrg.mutateAsync({ name: 'My Org' });
} catch (error) {
  if (error.code === 'UNAUTHORIZED') {
    // User not logged in
  } else if (error.code === 'FORBIDDEN') {
    // Insufficient permissions
  } else {
    // Other error
  }
}
```

## 🔄 Migration from Existing Apps

If you're adding this module to an existing app:

1. Run the database migration
2. Update your user authentication to work with organizations
3. Add the UI components to your existing layout
4. Update your existing API calls to include organization context

## 📝 Best Practices

1. **Always check permissions** before showing UI elements
2. **Use the offline store** for development and testing
3. **Handle loading states** in your UI components
4. **Validate inputs** on both client and server
5. **Log analytics events** for monitoring usage
6. **Test role changes** thoroughly before deploying

## 🆘 Troubleshooting

### Common Issues

**"Not a member of this organization"**
- User needs to be added to the organization first
- Check if the user is properly authenticated

**"Insufficient permissions"**
- User's role doesn't have the required permissions
- Check the role hierarchy and permission matrix

**"Invalid or expired invite"**
- Invite token is invalid or has expired
- Check invite status and expiry date

**Template mode not working**
- Ensure `TEMPLATE_OFFLINE=1` is set
- Check that the offline store is properly initialized

### Debug Mode

Enable debug logging:

```typescript
// In your app
if (process.env.NODE_ENV === 'development') {
  console.log('Org module debug info:', {
    isOfflineMode: process.env.TEMPLATE_OFFLINE === '1',
    currentOrg: orgStore.getCurrentOrg(),
    userOrgs: orgStore.listUserOrgs(userId)
  });
}
```
