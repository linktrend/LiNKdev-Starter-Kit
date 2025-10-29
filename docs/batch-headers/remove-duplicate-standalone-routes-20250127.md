# Batch Header: Remove Duplicate/Standalone Routes

**Date:** 2025-01-27  
**Scope:** 1-2 hours  
**Target:** Remove duplicate standalone routes `/console/flags` and `/console/jobs` and consolidate into Configuration tabs

## Inputs
- Standalone routes:
  - `apps/web/src/app/[locale]/(console)/console/flags/page.tsx`
  - `apps/web/src/app/[locale]/(console)/console/jobs/page.tsx`
- Configuration tabs with same functionality:
  - Configuration > Application > Feature Flags (uses `ConsoleFlagsPage` component)
  - Configuration > Application > Jobs/Queue (has full jobs management UI)
- Files with references:
  - `apps/web/src/app/[locale]/(console)/console/layout.tsx` (getScreenName function)
  - `apps/web/scripts/verify-routes.ts` (route verification)
  - `docs/structure.md` (documentation)

## Plan
1. Delete standalone route files:
   - `apps/web/src/app/[locale]/(console)/console/flags/page.tsx`
   - `apps/web/src/app/[locale]/(console)/console/jobs/page.tsx`
2. Update `console/layout.tsx`:
   - Remove references to `/console/flags` and `/console/jobs` from `getScreenName` function
3. Update `verify-routes.ts`:
   - Remove `/console/flags` and `/console/jobs` from REQUIRED_ROUTES array
4. Search for any other references:
   - Check for navigation links, redirects, or API route handlers
   - Update if found to point to Configuration tabs

## Risks & Assumptions
- Configuration tabs have complete functionality (verified - same components/logic)
- No direct navigation links in sidebar to standalone routes (verified - not in consoleNavItems)
- Documentation in `docs/structure.md` can remain as historical reference
- No API route handlers depend on these specific paths
- Redirects can be added later if needed for backwards compatibility

## Script Additions
None required

