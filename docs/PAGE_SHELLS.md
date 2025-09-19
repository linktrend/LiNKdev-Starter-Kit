# Page Shells Documentation

This document describes the page shells created in the Page Scaffolding batch. These are design-agnostic, high-priority shells with minimal layouts and TODO placeholders for future data integration and design system implementation.

## Overview

All page shells follow these principles:
- **Additive and non-breaking**: No changes to existing business logic or database
- **Auth guards**: All pages except `/help` require authentication
- **Org guards**: Organization-scoped routes include org access verification
- **Minimal layout**: Basic structure without styling beyond layout
- **TODO placeholders**: Clear markers for future data integration

## Created Routes

### User/Profile Pages

#### `/profile` ✅ WIRED + PRIMITIVES-READY
- **File**: `apps/web/app/profile/page.tsx`
- **Auth Required**: Yes
- **Description**: User profile overview with basic account information
- **Features**:
  - Profile information display (real user data)
  - Account status indicators
  - TODO sections for recent activity, security settings, preferences
  - **NEW**: Uses Card, Badge, and Button primitives

#### `/settings/account`
- **File**: `apps/web/app/settings/account/page.tsx`
- **Auth Required**: Yes
- **Description**: Account settings and preferences management
- **Features**:
  - Personal information editing
  - Security settings (password change, 2FA)
  - Notification preferences
  - Account actions (export data, delete account)

### Organization Pages

#### `/org/[orgId]` ✅ WIRED + PRIMITIVES-READY
- **File**: `apps/web/app/org/[orgId]/page.tsx`
- **Auth Required**: Yes
- **Org Guard**: Yes (with access denied handling)
- **Description**: Organization dashboard with overview and quick actions
- **Features**:
  - Quick stats (real member count, org name, user role)
  - Recent activity timeline (from audit logs)
  - Quick action buttons
  - TODO sections for analytics, project management, resource usage
  - **NEW**: Uses Card, Button, and Badge primitives

#### `/org/[orgId]/settings` ✅ CONTEXT-READY
- **File**: `apps/web/app/org/[orgId]/settings/page.tsx`
- **Auth Required**: Yes
- **Org Guard**: Yes (with S7 resolver)
- **Description**: Organization settings and configuration
- **Features**:
  - Organization information editing
  - Member management overview
  - Security settings
  - Integration settings
  - Danger zone (organization deletion)
  - **NEW**: S7 org context resolution with access verification
  - **NEW**: Shared state components (loading, empty, forbidden)
  - **NEW**: Org summary display (ID, role, source)

#### `/org/[orgId]/team` ✅ CONTEXT-READY + PRIMITIVES-READY
- **File**: `apps/web/app/org/[orgId]/team/page.tsx`
- **Auth Required**: Yes
- **Org Guard**: Yes (with S7 resolver)
- **Description**: Team member management and invitations
- **Features**:
  - Team member list with roles
  - Pending invitations
  - Invite new member form
  - Member search and filtering
  - **NEW**: S7 org context resolution with access verification
  - **NEW**: Shared state components (loading, empty, forbidden)
  - **NEW**: Org summary display (ID, role, source)
  - **NEW**: Uses Card, Button, Badge, and Alert primitives

#### `/org/[orgId]/billing` ✅ CONTEXT-READY
- **File**: `apps/web/app/org/[orgId]/billing/page.tsx`
- **Auth Required**: Yes
- **Org Guard**: Yes (with S7 resolver)
- **Description**: Billing and subscription management
- **Features**:
  - Current plan overview
  - Usage statistics
  - Plan features comparison
  - Billing history
  - Payment method management
  - **NEW**: S7 org context resolution with access verification
  - **NEW**: Shared state components (loading, empty, forbidden)
  - **NEW**: Org summary display (ID, role, source)
- **Note**: No changes to existing billing logic

### Records Pages

#### `/records` ✅ WIRED + PRIMITIVES-READY
- **File**: `apps/web/app/records/page.tsx`
- **Auth Required**: Yes
- **Org Context**: Yes (resolved with priority-based resolution)
- **Description**: Records list and management with organization context
- **Features**:
  - Quick stats overview (real record count for resolved org)
  - Search and filtering
  - Record types overview
  - Recent records list (real records data with links)
  - Org context resolution (params > query > cookie > default)
  - Cookie persistence for org switching
  - TODO sections for bulk operations, custom fields, templates
  - **NEW**: Uses Card, Button, and Badge primitives

#### `/records/[recordId]`
- **File**: `apps/web/app/records/[recordId]/page.tsx`
- **Auth Required**: Yes
- **Description**: Individual record details and management
- **Features**:
  - Record information display
  - Custom fields
  - Activity timeline
  - Record actions (edit, duplicate, share, delete)
  - Sidebar with metadata and tags

### Support Pages

#### `/help`
- **File**: `apps/web/app/help/page.tsx`
- **Auth Required**: No
- **Description**: Help center and documentation
- **Features**:
  - Search functionality
  - Help categories
  - Popular articles
  - FAQ section
  - Contact support options
  - Additional resources

## Guards Applied

### Authentication Guards
All pages except `/help` use the following auth pattern:
```typescript
const user = await getUser();
if (!user) {
  return redirect('/signin');
}
```

### Organization Guards
Organization-scoped routes include org access verification (commented out for now):
```typescript
// TODO: Verify user has access to this organization
// const { data: membership } = await supabase
//   .from('organization_members')
//   .select('role')
//   .eq('org_id', orgId)
//   .eq('user_id', user.id)
//   .single();
```

## Navigation Updates

### Dashboard Navigation
Updated `apps/web/config/dashboard.ts` to include:
- Profile link
- Records link
- Organization link (hardcoded to `org-1` for now)
- Help link

### Developer Navigation
Created `apps/web/components/dev-nav.tsx` for easy access to all page shells during development.

### Org Switcher Integration
**File**: `apps/web/src/components/org-switcher.tsx`

Added minimal org switcher to dashboard layout:
- Client component that fetches user memberships
- Sets `org_id` cookie and navigates on change
- Shows loading and empty states
- Displays organization names and user roles
- **TODO**: Replace with real menu during design pass

**Integration**:
- Added to `apps/web/app/(dashboard)/dashboard/layout.tsx`
- Available across all authenticated pages
- Uses `/api/orgs/memberships` endpoint

## TODO Items per Page

### Data Integration
Each page includes TODO placeholders for:
- tRPC data fetching calls
- Form validation and mutations
- Real-time updates
- Error handling

### Design System Integration
All pages are ready for:
- Design system component integration
- Consistent styling application
- Theme customization
- Responsive design refinements

### Feature Implementation
Specific features marked for implementation:
- User profile: Activity feed, security settings, preferences
- Account settings: Form validation, password change, 2FA setup
- Org dashboard: Analytics, project management, resource monitoring
- Org settings: Member management, security configuration, integrations
- Org team: Real member list, invitation management, role changes
- Org billing: Plan switching, payment method management, usage tracking
- Records: Bulk operations, custom fields, templates, search
- Record detail: Real data fetching, editing, sharing, versioning
- Help: Search functionality, real articles, support integration

## Testing

### Route Smoke Tests
Created `apps/web/tests/routes.sanity.spec.ts` with:
- Basic route definition tests
- Guard verification tests
- Component existence tests
- TODO placeholder verification

### Integration Test Placeholders
Documented integration test requirements for when test harness is available:
- Route accessibility (200 responses)
- Auth guard redirects
- Org guard redirects
- Component rendering
- Meta tag verification
- Navigation link testing

## File Inventory

### New Files Created
```
apps/web/app/profile/page.tsx
apps/web/app/settings/account/page.tsx
apps/web/app/org/[orgId]/page.tsx
apps/web/app/org/[orgId]/settings/page.tsx
apps/web/app/org/[orgId]/team/page.tsx
apps/web/app/org/[orgId]/billing/page.tsx
apps/web/app/records/page.tsx
apps/web/app/records/[recordId]/page.tsx
apps/web/app/help/page.tsx
apps/web/components/dev-nav.tsx
apps/web/tests/routes.sanity.spec.ts
docs/PAGE_SHELLS.md
```

### Modified Files
```
apps/web/config/dashboard.ts (navigation updates)
apps/web/app/(dashboard)/dashboard/page.tsx (added dev nav)
```

## Next Steps

1. **Data Integration**: Replace TODO placeholders with actual tRPC calls
2. **Design System**: Apply consistent styling and components
3. **Testing**: Implement proper integration tests
4. **Guards**: Implement real organization access verification
5. **Navigation**: Update with dynamic organization switching
6. **Features**: Implement specific functionality marked in TODOs

## Development Notes

- All pages use existing UI components from `@/components/ui`
- Auth patterns follow existing Supabase integration
- Layout structure is minimal and ready for design system
- TODO comments are comprehensive and actionable
- No database changes or business logic modifications
- All routes are accessible and functional with placeholder data
