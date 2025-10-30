## Scope
- Investigate and fix the Configuration screen not loading in the web app (Next.js App Router).
- Target: 1–2 hours to identify root cause and apply a minimal, safe fix.

## Inputs
- Codebase: `apps/web` (Next.js App Router)
- Potential routes:
  - `apps/web/src/app/[locale]/(console)/console/config/page.tsx`
  - `apps/web/src/app/[locale]/(console)/console/config/application/settings/page.tsx`
  - `apps/web/src/app/[locale]/(console)/console/layout.tsx`
- Middleware and i18n:
  - `apps/web/src/middleware.ts`, `apps/web/src/i18n.ts`

## Plan
- Reproduce locally and capture console/network errors.
- Inspect route components and layout for runtime-only pitfalls (icons, client-only usage, params).
- Verify that required params (`[locale]`) and middleware redirects are correct.
- Check recently changed settings/config components and imports for missing exports.
- Implement minimal fix (add guards, correct imports, or remove unsupported icon) following Tailwind and shadcn/ui usage.
- Add/adjust tests for the happy path render and a critical error path.

## Risks & Assumptions
- Assumption: Issue occurs on `/[locale]/console/config` (or nested subroutes).
- Risk: Third-party icon exports may differ across versions (e.g., `lucide-react` icon availability).
- Risk: Locale or org context guards/middleware could cause blank renders if not handled.
- Mitigation: Add defensive rendering and user-friendly error toasts; keep diffs small.

## Script Additions
- None at this time. Use existing scripts: `pnpm --filter apps/web dev|build|lint|test`.
