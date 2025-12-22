# tRPC Routers Reference

**Complete documentation of all tRPC routers, procedures, inputs, and outputs**

---

## Table of Contents

1. [Router Overview](#router-overview)
2. [User Router](#user-router)
3. [Profile Router](#profile-router)
4. [Organization Router](#organization-router)
5. [Team Router](#team-router)
6. [Records Router](#records-router)
7. [Scheduling Router](#scheduling-router)
8. [Automation Router](#automation-router)
9. [Billing Router](#billing-router)
10. [Audit Router](#audit-router)
11. [Usage Router](#usage-router)
12. [Notifications Router](#notifications-router)
13. [Settings Router](#settings-router)
14. [Flags Router](#flags-router)
15. [Development Tasks Router](#development-tasks-router)
16. [Email Router](#email-router)

---

## Router Overview

All routers are exported from `packages/api/src/root.ts`:

```typescript
export const appRouter = createTRPCRouter({
  status: publicProcedure.query(() => ({ ok: true })),
  organization: organizationRouter,
  user: userRouter,
  profile: profileRouter,
  records: recordsRouter,
  scheduling: schedulingRouter,
  automation: automationRouter,
  billing: billingRouter,
  audit: auditRouter,
  usage: usageRouter,
  flags: flagsRouter,
  developmentTasks: developmentTasksRouter,
  notifications: notificationsRouter,
  settings: settingsRouter,
  team: teamRouter,
  email: emailRouter,
});
```

### Base URL

- **Development**: `http://localhost:3000/api/trpc`
- **Production**: `https://your-domain.com/api/trpc`

### Procedure Types

- **`publicProcedure`** - No authentication required
- **`protectedProcedure`** - Requires authenticated user
- **`protectedProcedure.use(requireMember(...))`** - Requires org membership
- **`protectedProcedure.use(requireAdmin(...))`** - Requires admin role
- **`protectedProcedure.use(requireOwner(...))`** - Requires owner role

---

## User Router

**Path**: `user.*`

### `user.getProfile`

Get the authenticated user's profile.

**Type**: `protectedProcedure.query`

**Input**: None

**Output**:
```typescript
{
  id: string;
  email: string;
  full_name?: string;
  display_name?: string;
  avatar_url?: string;
  bio?: string;
  first_name?: string;
  last_name?: string;
  onboarding_completed?: boolean;
  profile_completed?: boolean;
  created_at: string;
  updated_at: string;
}
```

**Example**:
```typescript
const user = await api.user.getProfile.query();
```

**Errors**:
- `NOT_FOUND` - User not found

---

### `user.updateProfile`

Update the authenticated user's profile fields.

**Type**: `protectedProcedure.mutation`

**Input**:
```typescript
{
  full_name?: string;        // 1-120 chars
  display_name?: string;     // 1-120 chars
  avatar_url?: string;       // Valid URL
  bio?: string;              // Max 500 chars
  first_name?: string;       // 1-120 chars
  last_name?: string;        // 1-120 chars
  onboarding_completed?: boolean;
  profile_completed?: boolean;
}
```

**Output**: Updated user object

**Example**:
```typescript
await api.user.updateProfile.mutate({
  full_name: 'John Doe',
  avatar_url: 'https://example.com/avatar.jpg',
});
```

**Errors**:
- `BAD_REQUEST` - Invalid input
- `INTERNAL_SERVER_ERROR` - Update failed

**Audit**: Creates audit log entry

---

### `user.deleteAccount`

Delete the authenticated user's account.

**Type**: `protectedProcedure.mutation`

**Input**: None

**Output**:
```typescript
{
  success: true;
  userId: string;
}
```

**Example**:
```typescript
await api.user.deleteAccount.mutate();
```

**Errors**:
- `INTERNAL_SERVER_ERROR` - Deletion failed

**Audit**: Creates audit log entry

---

## Profile Router

**Path**: `profile.*`

### `profile.getOnboardingStatus`

Get onboarding and profile completion status.

**Type**: `protectedProcedure.query`

**Input**: None

**Output**:
```typescript
{
  onboardingCompleted: boolean;
  profileCompleted: boolean;
  preferences: Record<string, any> | null;
}
```

**Example**:
```typescript
const status = await api.profile.getOnboardingStatus.query();
```

---

### `profile.completeProfile`

Mark onboarding and profile as completed.

**Type**: `protectedProcedure.mutation`

**Input**: None

**Output**:
```typescript
{
  onboardingCompleted: boolean;
  profileCompleted: boolean;
}
```

**Example**:
```typescript
await api.profile.completeProfile.mutate();
```

---

### `profile.updatePreferences`

Update user preferences JSON blob.

**Type**: `protectedProcedure.mutation`

**Input**:
```typescript
{
  preferences: Record<string, any>;
}
```

**Output**: Updated user object with preferences

**Example**:
```typescript
await api.profile.updatePreferences.mutate({
  preferences: {
    theme: 'dark',
    notifications: true,
  },
});
```

---

## Organization Router

**Path**: `organization.*` or `org.*`

### `organization.list`

List organizations the authenticated user belongs to.

**Type**: `protectedProcedure.query`

**Input**: None

**Output**: Array of organizations with role:
```typescript
Array<{
  id: string;
  name: string;
  slug: string;
  org_type: 'personal' | 'business' | 'family' | 'education' | 'other';
  is_personal: boolean;
  description?: string;
  avatar_url?: string;
  owner_id: string;
  settings: Record<string, any>;
  created_at: string;
  updated_at: string;
  role: 'owner' | 'admin' | 'editor' | 'viewer';
}>
```

**Example**:
```typescript
const orgs = await api.organization.list.query();
```

---

### `organization.getById`

Get organization details by ID.

**Type**: `protectedProcedure.query`

**Input**:
```typescript
{
  orgId: string;
}
```

**Output**: Organization object with role

**Example**:
```typescript
const org = await api.organization.getById.query({ orgId: 'org-123' });
```

**Errors**:
- `NOT_FOUND` - Organization not found or inaccessible

---

### `organization.create`

Create a new organization and assign current user as owner.

**Type**: `protectedProcedure.mutation`

**Input**:
```typescript
{
  name: string;              // 1-100 chars
  orgType?: 'personal' | 'business' | 'family' | 'education' | 'other';
  description?: string;      // Max 500 chars
}
```

**Output**: Created organization object

**Example**:
```typescript
const org = await api.organization.create.mutate({
  name: 'My Company',
  orgType: 'business',
  description: 'Our company organization',
});
```

**Audit**: Creates audit log entry

---

### `organization.update`

Update organization metadata (owner/admin only).

**Type**: `protectedProcedure.mutation`

**Input**:
```typescript
{
  orgId: string;
  name: string;              // 1-100 chars
  orgType?: 'personal' | 'business' | 'family' | 'education' | 'other';
  description?: string;      // Max 500 chars
}
```

**Output**: Updated organization object

**Example**:
```typescript
await api.organization.update.mutate({
  orgId: 'org-123',
  name: 'Updated Name',
  orgType: 'business',
});
```

**Permissions**: Requires admin role or higher

**Audit**: Creates audit log entry

---

### `organization.delete`

Delete an organization (owner only).

**Type**: `protectedProcedure.mutation`

**Input**:
```typescript
{
  orgId: string;
}
```

**Output**:
```typescript
{
  success: true;
}
```

**Permissions**: Requires owner role

---

### `organization.listMembers`

List members of an organization.

**Type**: `protectedProcedure.query`

**Input**:
```typescript
{
  orgId: string;
}
```

**Output**: Array of members with user details:
```typescript
Array<{
  user_id: string;
  role: 'owner' | 'admin' | 'editor' | 'viewer';
  created_at: string;
  user: {
    id: string;
    email: string;
    full_name?: string;
    avatar_url?: string;
  };
}>
```

**Permissions**: Requires member role or higher

---

### `organization.addMember`

Add a member to an organization (owner/admin).

**Type**: `protectedProcedure.mutation`

**Input**:
```typescript
{
  orgId: string;
  userId: string;
  role: 'admin' | 'editor' | 'viewer';
}
```

**Output**: Created membership object

**Permissions**: Requires admin role or higher

**Audit**: Creates audit log entry

---

### `organization.removeMember`

Remove a member from an organization (owner/admin).

**Type**: `protectedProcedure.mutation`

**Input**:
```typescript
{
  orgId: string;
  userId: string;
}
```

**Output**:
```typescript
{
  success: true;
}
```

**Permissions**: Requires admin role or higher

**Errors**:
- `FORBIDDEN` - Cannot remove organization owner
- `FORBIDDEN` - Insufficient permissions

**Audit**: Creates audit log entry

---

### `organization.updateMemberRole`

Update a member's role (owner only).

**Type**: `protectedProcedure.mutation`

**Input**:
```typescript
{
  orgId: string;
  userId: string;
  role: 'admin' | 'editor' | 'viewer';
}
```

**Output**: Updated membership object

**Permissions**: Requires owner role

**Audit**: Creates audit log entry for role change

---

## Team Router

**Path**: `team.*`

### `team.inviteMember`

Invite a member to the organization.

**Type**: `protectedProcedure.mutation`

**Input**:
```typescript
{
  orgId: string;             // UUID
  email: string;              // Valid email
  role: 'member' | 'viewer';
}
```

**Output**: Team invite (without token for security):
```typescript
{
  id: string;
  org_id: string;
  email: string;
  role: string;
  status: 'pending' | 'accepted' | 'revoked' | 'expired';
  invited_by: string;
  expires_at: string;
  created_at: string;
}
```

**Permissions**: Requires admin role or higher

**Errors**:
- `BAD_REQUEST` - User already a member
- `BAD_REQUEST` - Invitation already sent

**Example**:
```typescript
const invite = await api.team.inviteMember.mutate({
  orgId: 'org-123',
  email: 'user@example.com',
  role: 'viewer',
});
```

---

### `team.listInvites`

List pending team invitations.

**Type**: `protectedProcedure.query`

**Input**:
```typescript
{
  orgId: string;
}
```

**Output**: Array of team invites

**Permissions**: Requires admin role or higher

---

### `team.acceptInvite`

Accept a team invitation.

**Type**: `protectedProcedure.mutation`

**Input**:
```typescript
{
  token: string;
}
```

**Output**:
```typescript
{
  success: true;
  orgId: string;
  role: string;
}
```

**Errors**:
- `BAD_REQUEST` - Invalid or expired token
- `BAD_REQUEST` - Invitation already accepted

---

### `team.revokeInvite`

Revoke a team invitation (admin/owner).

**Type**: `protectedProcedure.mutation`

**Input**:
```typescript
{
  inviteId: string;
  orgId: string;
}
```

**Output**:
```typescript
{
  success: true;
}
```

**Permissions**: Requires admin role or higher

---

## Records Router

**Path**: `records.*`

### `records.createRecordType`

Create a new record type definition.

**Type**: `protectedProcedure.mutation`

**Input**:
```typescript
{
  key: string;                // 1-50 chars, unique
  display_name: string;       // 1-100 chars
  description?: string;
  config: {
    fields: Array<{
      key: string;
      label: string;
      type: 'text' | 'number' | 'email' | 'url' | 'date' | 'boolean' | 'select' | 'textarea';
      required?: boolean;
      placeholder?: string;
      description?: string;
      options?: string[];
      validation?: {
        min?: number;
        max?: number;
        pattern?: string;
        custom?: string;
      };
    }>;
    is_public?: boolean;
    permissions?: {
      can_create?: string[];
      can_read?: string[];
      can_update?: string[];
      can_delete?: string[];
    };
    validation?: {
      schema?: Record<string, any>;
      custom_rules?: string[];
    };
  };
}
```

**Output**: Created record type object

**Audit**: Creates audit log entry

---

### `records.listRecordTypes`

List available record types (user's own + public).

**Type**: `protectedProcedure.query`

**Input**: None

**Output**: Array of record types

---

### `records.getRecordType`

Get record type by ID.

**Type**: `protectedProcedure.query`

**Input**:
```typescript
{
  id: string;
}
```

**Output**: Record type object

**Errors**:
- `NOT_FOUND` - Record type not found

---

### `records.createRecord`

Create a new record.

**Type**: `protectedProcedure.mutation`

**Input**:
```typescript
{
  type_id: string;
  org_id: string;
  user_id?: string;
  data: Record<string, any>;
}
```

**Output**: Created record object

**Audit**: Creates audit log entry

---

### `records.listRecords`

List records with filtering and pagination.

**Type**: `protectedProcedure.query`

**Input**:
```typescript
{
  type_id?: string;
  org_id?: string;
  user_id?: string;
  limit?: number;            // Default 50, max 100
  offset?: number;           // Default 0
  search?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}
```

**Output**:
```typescript
{
  records: Array<Record>;
  total: number;
  has_more: boolean;
}
```

---

## Scheduling Router

**Path**: `scheduling.*`

### `scheduling.createReminder`

Create a new reminder.

**Type**: `protectedProcedure.mutation`

**Input**:
```typescript
{
  org_id: string;             // UUID
  record_id?: string;        // UUID, optional
  title: string;              // 1-200 chars
  notes?: string;
  due_at?: string;            // ISO datetime
  priority?: 'low' | 'medium' | 'high' | 'urgent'; // Default 'medium'
}
```

**Output**: Created reminder object

**Audit**: Creates audit log entry

---

### `scheduling.listReminders`

List reminders with filtering.

**Type**: `protectedProcedure.query`

**Input**:
```typescript
{
  org_id: string;
  status?: 'pending' | 'sent' | 'completed' | 'snoozed' | 'cancelled';
  from?: string;              // ISO datetime
  to?: string;                // ISO datetime
  q?: string;                 // Search query
  limit?: number;            // Default 50, max 100
  offset?: number;
}
```

**Output**: Array of reminders with pagination

---

### `scheduling.updateReminder`

Update a reminder.

**Type**: `protectedProcedure.mutation`

**Input**: `UpdateReminderInput` (from `@starter/types`)

**Output**: Updated reminder object

**Audit**: Creates audit log entry

---

### `scheduling.completeReminder`

Mark a reminder as completed.

**Type**: `protectedProcedure.mutation`

**Input**:
```typescript
{
  id: string;
}
```

**Output**: Updated reminder object

**Audit**: Creates audit log entry

---

### `scheduling.createSchedule`

Create a recurring schedule.

**Type**: `protectedProcedure.mutation`

**Input**:
```typescript
{
  org_id: string;
  name: string;
  description?: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval?: number;          // Default 1
  start_date: string;         // ISO date
  end_date?: string;          // ISO date
  time_of_day?: string;       // HH:mm format
  timezone?: string;          // Default 'UTC'
}
```

**Output**: Created schedule object

**Audit**: Creates audit log entry

---

## Automation Router

**Path**: `automation.*`

### `automation.enqueue`

Enqueue an automation event for delivery.

**Type**: `protectedProcedure.mutation`

**Input**:
```typescript
{
  event: string;              // Event name
  payload: Record<string, any>;
  orgId: string;              // UUID
}
```

**Output**:
```typescript
{
  success: true;
  eventId: string;
  message: string;
}
```

**Audit**: Creates audit log entry

---

### `automation.runDeliveryTick`

Process pending automation events.

**Type**: `protectedProcedure.mutation`

**Input**: None

**Output**:
```typescript
{
  success: true;
  processed: number;
  successful: number;
  failed: number;
  duration: number;           // Milliseconds
  message: string;
}
```

---

## Billing Router

**Path**: `billing.*`

### `billing.getPlans`

Get all available billing plans with entitlements.

**Type**: `protectedProcedure.query`

**Input**: None

**Output**:
```typescript
{
  plans: Array<Plan>;
  offline: boolean;
}
```

---

### `billing.getSubscription`

Get organization's current subscription.

**Type**: `protectedProcedure.query`

**Input**:
```typescript
{
  orgId: string;              // UUID
}
```

**Output**:
```typescript
{
  subscription: Subscription | null;
  customer: Customer | null;
  offline: boolean;
}
```

**Permissions**: Requires member role

---

### `billing.createCheckout`

Create Stripe checkout session.

**Type**: `protectedProcedure.mutation`

**Input**:
```typescript
{
  orgId: string;
  plan: string;               // Plan ID
  successUrl: string;
  cancelUrl: string;
}
```

**Output**:
```typescript
{
  sessionId: string;
  url: string;
  offline?: boolean;
}
```

**Permissions**: Requires member role

**Audit**: Creates audit log entry

---

### `billing.openPortal`

Open Stripe customer portal.

**Type**: `protectedProcedure.mutation`

**Input**:
```typescript
{
  orgId: string;
  returnUrl: string;
}
```

**Output**:
```typescript
{
  url: string;
  offline?: boolean;
}
```

**Permissions**: Requires member role

---

### `billing.getUsageStats`

Get usage statistics for an organization.

**Type**: `protectedProcedure.query`

**Input**:
```typescript
{
  orgId: string;
}
```

**Output**:
```typescript
{
  organizations: { current: number; limit: number; exceeded: boolean };
  members: { current: number; limit: number; exceeded: boolean };
  records: { current: number; limit: number; exceeded: boolean };
  reminders: { current: number; limit: number; exceeded: boolean };
  offline?: boolean;
}
```

**Permissions**: Requires member role

---

### `billing.listInvoices`

Get organization's invoices.

**Type**: `protectedProcedure.query`

**Input**:
```typescript
{
  orgId: string;
  limit?: number;
}
```

**Output**:
```typescript
{
  invoices: Array<Invoice>;
  has_more: boolean;
  offline?: boolean;
}
```

**Permissions**: Requires member role

---

## Audit Router

**Path**: `audit.*`

### `audit.append`

Append a new audit log entry (server-only).

**Type**: `protectedProcedure.mutation`

**Input**:
```typescript
{
  orgId: string;
  action: string;
  entityType: string;
  entityId: string;
  metadata?: Record<string, any>;
}
```

**Output**: Created audit log entry

---

### `audit.list`

List audit logs with filtering and pagination.

**Type**: `protectedProcedure.query`

**Input**:
```typescript
{
  orgId: string;
  q?: string;                 // Search query
  entityType?: string;
  action?: string;
  actorId?: string;
  from?: string;             // ISO datetime
  to?: string;               // ISO datetime
  cursor?: string;
  limit?: number;            // Default 50
}
```

**Output**:
```typescript
{
  logs: Array<AuditLog>;
  total: number;
  cursor?: string;
  has_more: boolean;
}
```

---

### `audit.getById`

Get audit log by ID.

**Type**: `protectedProcedure.query`

**Input**:
```typescript
{
  id: string;
  orgId: string;
}
```

**Output**: Audit log object

**Errors**:
- `NOT_FOUND` - Audit log not found

---

### `audit.getStats`

Get audit log statistics.

**Type**: `protectedProcedure.query`

**Input**:
```typescript
{
  orgId: string;
  from?: string;
  to?: string;
}
```

**Output**:
```typescript
{
  total_events: number;
  events_by_action: Record<string, number>;
  events_by_entity_type: Record<string, number>;
  events_by_actor: Record<string, number>;
  period: {
    from: string;
    to: string;
  };
}
```

---

### `audit.export`

Export audit logs (admin only).

**Type**: `protectedProcedure.query`

**Input**:
```typescript
{
  orgId: string;
  format?: 'json' | 'csv';
  from?: string;
  to?: string;
  filters?: Record<string, any>;
}
```

**Output**: Export data or download URL

**Permissions**: Requires admin role

---

## Usage Router

**Path**: `usage.*`

### `usage.getApiUsage`

Get API usage metrics for an organization.

**Type**: `protectedProcedure.query`

**Input**:
```typescript
{
  orgId: string;
  from?: string;
  to?: string;
  endpoint?: string;
  method?: string;
}
```

**Output**:
```typescript
{
  endpoints: Array<{
    endpoint: string;
    method: string;
    call_count: number;
    avg_response_time: number;
    error_count: number;
    error_rate: number;
  }>;
  total_calls: number;
  avg_response_time: number;
  error_rate: number;
  period: {
    from: string;
    to: string;
  };
}
```

**Permissions**: Requires member role

---

### `usage.getFeatureUsage`

Get feature usage statistics.

**Type**: `protectedProcedure.query`

**Input**:
```typescript
{
  orgId: string;
  feature?: string;
  from?: string;
  to?: string;
}
```

**Output**: Feature usage statistics

**Permissions**: Requires member role

---

### `usage.recordUsageEvent`

Record a usage event.

**Type**: `protectedProcedure.mutation`

**Input**:
```typescript
{
  orgId: string;
  eventType: string;
  quantity?: number;
  metadata?: Record<string, any>;
}
```

**Output**:
```typescript
{
  success: true;
  eventId: string;
}
```

---

## Notifications Router

**Path**: `notifications.*`

### `notifications.list`

List notifications for an organization.

**Type**: `protectedProcedure.query`

**Input**:
```typescript
{
  orgId: string;
  read?: boolean;
  limit?: number;            // Default 50, max 100
  offset?: number;          // Default 0
}
```

**Output**:
```typescript
{
  notifications: Array<Notification>;
  total: number;
  hasMore: boolean;
}
```

**Permissions**: Requires member role

---

### `notifications.markAsRead`

Mark a notification as read.

**Type**: `protectedProcedure.mutation`

**Input**:
```typescript
{
  notificationId: string;
}
```

**Output**:
```typescript
{
  success: true;
}
```

---

### `notifications.markAllAsRead`

Mark all notifications as read.

**Type**: `protectedProcedure.mutation`

**Input**:
```typescript
{
  orgId: string;
}
```

**Output**:
```typescript
{
  success: true;
  count: number;
}
```

**Permissions**: Requires member role

---

### `notifications.delete`

Delete a notification.

**Type**: `protectedProcedure.mutation`

**Input**:
```typescript
{
  notificationId: string;
}
```

**Output**:
```typescript
{
  success: true;
}
```

---

### `notifications.getUnreadCount`

Get unread notification count.

**Type**: `protectedProcedure.query`

**Input**:
```typescript
{
  orgId: string;
}
```

**Output**:
```typescript
{
  count: number;
}
```

**Permissions**: Requires member role

---

## Settings Router

**Path**: `settings.*`

### `settings.getUserSettings`

Get user settings with defaults.

**Type**: `protectedProcedure.query`

**Input**:
```typescript
{
  userId?: string;           // Optional, defaults to current user
}
```

**Output**: User settings object

**Errors**:
- `FORBIDDEN` - Cannot access another user's settings

---

### `settings.updateUserSettings`

Update user settings (upsert pattern).

**Type**: `protectedProcedure.mutation`

**Input**:
```typescript
{
  theme?: 'light' | 'dark' | 'system';
  language?: string;
  timezone?: string;
  emailNotifications?: {
    marketing?: boolean;
    features?: boolean;
    security?: boolean;
    updates?: boolean;
  };
  pushNotifications?: {
    enabled?: boolean;
    browser?: boolean;
    mobile?: boolean;
  };
}
```

**Output**: Updated user settings

---

### `settings.getOrgSettings`

Get organization settings.

**Type**: `protectedProcedure.query`

**Input**:
```typescript
{
  orgId: string;
}
```

**Output**: Organization settings object

**Permissions**: Requires member role

---

### `settings.updateOrgSettings`

Update organization settings (owner/admin).

**Type**: `protectedProcedure.mutation`

**Input**:
```typescript
{
  orgId: string;
  settings: Record<string, any>;
}
```

**Output**: Updated organization settings

**Permissions**: Requires admin role or higher

---

## Flags Router

**Path**: `flags.*`

### `flags.getFlagStatus`

Get the status of a feature flag for an organization.

**Type**: `publicProcedure.query`

**Input**:
```typescript
{
  orgId: string;
  name: 'RECORDS_FEATURE_ENABLED' | 
        'BILLING_FEATURE_ENABLED' | 
        'AUDIT_FEATURE_ENABLED' | 
        'SCHEDULING_FEATURE_ENABLED' | 
        'ATTACHMENTS_FEATURE_ENABLED' | 
        'ADVANCED_ANALYTICS_ENABLED' | 
        'BETA_FEATURES_ENABLED';
}
```

**Output**:
```typescript
{
  name: string;
  enabled: boolean;
  value?: any;
}
```

---

### `flags.getAllFlags`

Get all feature flags for an organization.

**Type**: `publicProcedure.query`

**Input**:
```typescript
{
  orgId: string;
}
```

**Output**: Array of feature flag responses

---

## Development Tasks Router

**Path**: `developmentTasks.*`

### `developmentTasks.list`

List development tasks with filtering and pagination.

**Type**: `protectedProcedure.query`

**Input**:
```typescript
{
  org_id: string;
  status?: 'todo' | 'in-progress' | 'review' | 'done' | 'blocked';
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  assignee_id?: string;
  search?: string;
  limit?: number;            // Default 50, max 100
  offset?: number;           // Default 0
  sort_by?: 'created_at' | 'updated_at' | 'due_date' | 'priority' | 'status';
  sort_order?: 'asc' | 'desc';
}
```

**Output**:
```typescript
{
  tasks: Array<DevelopmentTask>;
  total: number;
  has_more: boolean;
}
```

**Permissions**: Requires member role

---

### `developmentTasks.create`

Create a new development task.

**Type**: `protectedProcedure.mutation`

**Input**:
```typescript
{
  org_id: string;
  title: string;              // 1-500 chars
  description?: string;      // Max 10000 chars
  status?: 'todo' | 'in-progress' | 'review' | 'done' | 'blocked';
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  assignee_id?: string;
  notion_page_id?: string;
  notion_database_id?: string;
  metadata?: Record<string, any>;
  due_date?: string;          // ISO date
}
```

**Output**: Created task object

**Permissions**: Requires member role

---

### `developmentTasks.update`

Update a development task.

**Type**: `protectedProcedure.mutation`

**Input**: Similar to create, with `id` field required

**Output**: Updated task object

**Permissions**: Requires member role

---

### `developmentTasks.delete`

Delete a development task.

**Type**: `protectedProcedure.mutation`

**Input**:
```typescript
{
  id: string;
  org_id: string;
}
```

**Output**:
```typescript
{
  success: true;
}
```

**Permissions**: Requires member role

---

## Email Router

**Path**: `email.*`

### `email.sendTest`

Send a test email (development/testing).

**Type**: `protectedProcedure.mutation`

**Input**:
```typescript
{
  to: string;                // Valid email address
  message?: string;          // Optional message
}
```

**Output**:
```typescript
{
  success: true;
  message: string;
}
```

**Note**: This endpoint is for testing purposes only

---

## Related Documentation

- [API Overview](./API_OVERVIEW.md) - API architecture and setup
- [REST Endpoints](./REST_ENDPOINTS.md) - REST API reference
- [Architecture](../02_ARCHITECTURE/ARCHITECTURE.md) - System architecture
- [Permissions](../04_FEATURES/PERMISSIONS.md) - Authorization guide

---

**Last Updated**: 2025-01-17
