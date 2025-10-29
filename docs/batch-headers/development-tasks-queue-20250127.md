# Batch Header: Development Tasks Queue Refactor

**Timestamp**: 2025-01-27

## Scope
Refactor Jobs/Queue tab to focus on development tasks with Supabase backend and optional Notion integration. Estimated 2-3 hours.

## Inputs
- `apps/web/src/app/[locale]/(console)/console/config/page.tsx` - Current Jobs/Queue implementation
- `apps/web/src/app/[locale]/(console)/console/database/page.tsx` - Design pattern reference
- `apps/web/src/app/[locale]/(console)/console/errors/page.tsx` - Design pattern reference
- `packages/api/src/routers/*.ts` - tRPC router patterns
- `apps/web/supabase/migrations/*.sql` - Migration patterns

## Plan
1. Create database migration for `development_tasks` table with indexes and RLS policies
2. Create tRPC router (`packages/api/src/routers/developmentTasks.ts`) with CRUD operations
3. Add router to `packages/api/src/root.ts`
4. Refactor Jobs/Queue tab in config page to use development tasks
5. Implement task management UI (create, edit, delete, filter)
6. Add optional Notion integration configuration section
7. Update types and ensure type safety

## Risks & Assumptions
- **Assumption**: Users table exists and is accessible via `auth.users(id)`
- **Assumption**: Organization context is handled via tRPC context
- **Risk**: Notion API integration requires additional dependencies (handled as optional)
- **Assumption**: Existing design patterns from database/errors pages will be followed
- **Risk**: Large refactor may break existing functionality (mitigated by careful incremental changes)

## Script Additions
None - using existing scripts (pnpm type-check, pnpm lint)

