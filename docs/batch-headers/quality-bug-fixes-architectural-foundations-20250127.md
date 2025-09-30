# Quality Bug Fixes & Architectural Foundations - 2025-01-27

## Scope
2-3 hour target to complete quality-of-life bug fixes and establish key architectural foundations for future refactors.

## Inputs
- Current monorepo structure with web app, mobile app, and shared packages
- Existing type definitions in `apps/web/src/types/`
- Pagination and billing test failures
- Supabase local development guardrails

## Plan
### Phase I: Quality and Bug Fixes
1. Fix pagination cursor bug in REST API utilities
2. Fix billing mock exports (hasExceededLimit, getCurrentPlan)
3. Resolve minor type and lint issues

### Phase II: Architectural Foundations
4. Remove Supabase local guardrail
5. Centralize shared types into `packages/types`
6. Integrate i18n boilerplate with next-intl

## Risks & Assumptions
- Type migration may require careful import path updates
- i18n setup should be minimal boilerplate only
- All existing functionality must remain intact

## Script Additions
- New `packages/types` workspace package
- i18n middleware and provider setup
- Removal of `db:guard:nolocal` script
