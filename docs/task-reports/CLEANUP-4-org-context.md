# CLEANUP-4: Console Organization Context

## Files created
- `apps/web/src/contexts/OrgContext.tsx`
- `apps/web/src/components/console/OrgSwitcher.tsx`
- `apps/web/src/hooks/useCurrentOrg.ts`
- `apps/web/src/app/[locale]/(console)/console/analytics/AnalyticsPageClient.tsx`
- `apps/web/src/app/[locale]/(console)/console/health/HealthPageClient.tsx`
- `apps/web/src/__tests__/console/org-context.test.tsx`

## Files modified
- Console layout/topbar: `apps/web/src/components/console/ConsoleLayoutClient.tsx`, `apps/web/src/components/navigation/ConsoleTopbar.tsx`
- Console pages: analytics, audit, database, errors, health, security clients
- Shared components/hooks: `AnalyticsDashboard`, `useAuditLogs`, `ConfigScreen`, `app/actions/errors.ts`
- Playwright helper: `apps/web/tests/helpers/admin-setup.ts`

## Org context
- Org data comes from `api.organization.list` and defaults to personal org, falling back to the first membership.
- Selection persists in `localStorage (console.currentOrgId)` and invalidates React Query caches on switch to avoid stale org-scoped data.
- `OrgSwitcher` in the console header allows multi-org users to switch without reload; single/no-org states are handled gracefully.
- Layout guards render loading/no-org messaging and wraps console pages in `OrgProvider`.

## Pages updated
- `console/health`, `console/database`, `console/errors`, `console/analytics`, `console/audit` (client), `console/security`, and `console/config` now read org context and show fallbacks when no org is available.

## Testing
- `pnpm vitest src/__tests__/console/org-context.test.tsx` (from `apps/web`) ✅
- Not run: full vitest suite, Playwright/e2e (not requested).

## User experience
- Org-aware console navigation with a visible switcher and persisted choice across pages.
- Clear messaging for users without org membership and loading states during org fetch/switch.
- Org-specific data resets on switch to prevent cross-org leakage.

## Sign-off
- Org context provider, switcher, and persistence implemented.
- Console pages consume the active org and handle multi/no-org flows.
- Tests added/updated for org context behavior.
