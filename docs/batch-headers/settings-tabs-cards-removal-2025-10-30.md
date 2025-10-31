Scope: 1–2 hours. Remove Account and Data & Integrations tabs from Console Settings, and delete two cards in Security tab.

Inputs:
- apps/web/src/app/[locale]/(console)/console/settings/page.tsx
- Existing UI conventions (Tailwind, shadcn/ui Tabs)

Plan:
- Remove Account tab trigger/content and its related modals/state.
- Remove Data & Integrations tab trigger/content and its related modals/state.
- In Security tab, remove "User Roles & Permissions" and "Session & Activity Logs" cards and related modals/state.
- Update default/active tab handling to avoid referencing deleted tabs.
- Clean up unused imports.
- Run lint/typecheck and fix.

Risks & Assumptions:
- Assumption: Only Console Settings (`/en/console/settings`) is in scope; dashboard or app-level settings unaffected.
- Risk: URLs with `?tab=account` or `?tab=data` should gracefully redirect or coerce to an existing tab.
- Assumption: No tests depend on removed tabs/cards; if they exist, adjust accordingly in a follow-up.

Script Additions:
- None.

