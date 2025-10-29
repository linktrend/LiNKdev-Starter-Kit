# Console Reports & Security & Access Update - 2025-01-27

## Scope
Update Reports and Security & Access console screens to match the new structure and design patterns from protected screens.

## Inputs
- `apps/web/src/app/[locale]/(console)/console/reports/page.tsx` - Current reports page
- `apps/web/src/app/[locale]/(console)/console/security/page.tsx` - Current security page
- `apps/web/src/app/[locale]/(console)/console/database/page.tsx` - Design pattern reference
- `apps/web/src/app/[locale]/(console)/console/errors/page.tsx` - Design pattern reference
- `apps/web/src/components/console/ConsoleFlagsPage.tsx` - Design pattern reference

## Plan
1. Update Reports page:
   - Restructure with sub-tabs: Overview, Analytics, Exports
   - Add stats cards for key metrics
   - Create Overview dashboard with charts/summaries
   - Add Analytics tab with usage metrics and trends
   - Enhance Exports tab with export history and functionality
   - Match design patterns from protected screens

2. Update Security & Access page:
   - Restructure with sub-tabs: User Management, Access Control, Audit Trail, Sessions
   - Add User Management with CRUD operations
   - Add Access Control with roles & permissions matrix
   - Add Audit Trail with filterable history
   - Add Sessions with active login sessions
   - Match design patterns from protected screens

3. Design consistency:
   - Apply consistent spacing (space-y-4 sm:space-y-6 lg:space-y-8)
   - Use Card, CardHeader, CardTitle, CardDescription, CardContent
   - Implement Tabs with TabsList, TabsTrigger, TabsContent
   - Use Switch with green ON (bg-green-500/600), red OFF (bg-red-500/600)
   - Use CheckCircle2 icons with proper sizing (h-4 w-4 or h-5 w-5) and green colors
   - Ensure responsive design works correctly

## Risks & Assumptions
- Mock data will be used for demonstration purposes
- All functionality will be UI-only (no actual API integration)
- Design patterns from protected screens will be consistently applied
- Responsive breakpoints match existing patterns

## Script Additions
None required

