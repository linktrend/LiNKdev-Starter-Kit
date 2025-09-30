# tRPC AppRouter Type Resolution Fix

**Timestamp:** 2025-01-27
**Scope:** 1-2 hour target - Fix persistent tRPC type collision error

## Inputs
- Current tRPC setup in `apps/web/src/trpc/`
- Type resolution error with `AppRouter` import from `@starter/api`
- Existing type collision between client and server router types

## Plan
1. **Phase I: Define Client Type Workaround**
   - Examine current tRPC client setup in `apps/web/src/trpc/react.tsx`
   - Create targeted type alias to force TypeScript resolution
   - Update all downstream usage to use the new alias

2. **Phase II: Clear Caches and Rebuild**
   - Perform aggressive cache cleanup across monorepo
   - Remove all build artifacts and node_modules
   - Reinstall dependencies and rebuild API package
   - Verify type resolution success

## Risks & Assumptions
- Type collision is due to recursive type resolution in TypeScript
- Client-side type alias will force proper resolution
- Aggressive cache cleanup will eliminate stale type information
- No breaking changes to existing tRPC functionality

## Script Additions
- None (using existing pnpm scripts)

## Exit Criteria
- `pnpm --filter web typecheck` passes with zero errors
- Application build completes successfully
- Codebase stable for next architectural task
