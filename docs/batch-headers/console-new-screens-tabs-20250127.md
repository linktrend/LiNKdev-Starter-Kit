# Console New Screens/Tabs - Batch Header

**Date**: 2025-01-27  
**Scope**: 1–2 hours  
**Status**: In Progress

## Inputs

- `apps/web/src/app/[locale]/(console)/console/database/page.tsx` - Reference for design patterns
- `apps/web/src/app/[locale]/(console)/console/errors/page.tsx` - Existing Errors & Logs page
- `apps/web/src/app/[locale]/(console)/console/reports/page.tsx` - Existing Reports page
- `apps/web/src/app/[locale]/(console)/console/security/page.tsx` - Existing Security page (placeholder)
- `apps/web/src/app/[locale]/(console)/console/config/page.tsx` - Existing Config page
- `apps/web/src/components/console/ConsoleFlagsPage.tsx` - Reference component

## Plan

1. **Errors & Logs** - Add sub-tabs:
   - Refactor existing "Errors" tab to "Error Tracking"
   - Refactor existing "Logs" tab to "Application Logs"
   - Add new "Audit Logs" tab (placeholder structure)
   - Add new "System Logs" tab (placeholder structure)

2. **Reports** - Add sub-tabs:
   - Add "Overview" tab (main dashboard)
   - Add "Analytics" tab (metrics and analytics)
   - Add "Exports" tab (export functionality - can reuse existing Generated Reports as sub-tab content)

3. **Security & Access** - Build complete structure:
   - Add "User Management" tab (CRUD structure)
   - Add "Access Control" tab (Roles & Permissions)
   - Add "Audit Trail" tab (history logs)
   - Add "Sessions" tab (active login sessions)

4. **Configuration** - Add Integrations tab:
   - Add "Integrations" tab alongside existing tabs
   - Structure for third-party integrations (Stripe, etc.)

## Risks & Assumptions

- All existing functionality should be preserved
- Using consistent design patterns from database page
- Responsive design required for mobile-first approach
- TypeScript types need to be properly defined
- Mock data will be used for placeholders

## Script Additions

None expected - no new package.json scripts needed

