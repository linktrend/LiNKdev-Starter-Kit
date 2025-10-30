Scope: 1–2 hour target

Inputs:
- `apps/web/src/app/[locale]/(console)/console/billing/page.tsx`
- `apps/web/src/utils/userDisplay.ts`
- `apps/web/src/utils/formatDateTime.ts`

Plan:
- Change Subscriptions table header from Organization to User.
- Render user info (display name + username) using `getUserDisplay`, matching user column styling elsewhere.
- Ensure Plan column uses one of the four available plans by deriving from `mockPlans` via `planId`.
- Standardize Next Billing date format to match the app standard using `formatDateTimeExact`.
- Add minimal mock `user` data to `mockSubscriptions` to support the User column.

Risks & Assumptions:
- Assumes `getUserDisplay` is the canonical helper for user display.
- UI-only changes; no backend impact.
- Mock data updated only within this page to keep demo consistent.

Script Additions:
- None.

