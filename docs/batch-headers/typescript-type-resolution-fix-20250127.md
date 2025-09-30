# TypeScript Type Resolution Fix - 20250127

## Scope
1-2 hour target to resolve critical TypeScript type collision error in `apps/web` after API centralization.

## Inputs
- Current project structure with centralized API in `packages/api`
- TypeScript configuration in `apps/web`
- tRPC client configuration files

## Plan
1. **Phase I: Diagnose API Export**
   - Inspect root export file in `packages/api/src/index.ts`
   - Verify `AppRouter` type is explicitly exported
   - Check build output for proper type declarations

2. **Phase II: Fix Client-Side Type Consumption**
   - Examine tRPC client files in `apps/web/src/trpc/`
   - Correct type imports from `@starter/api` package
   - Verify build resolution and path references

3. **Verification**
   - Run `pnpm typecheck` in web app
   - Ensure zero TypeScript errors
   - Verify application build success

## Risks & Assumptions
- Type collision may be due to incorrect generic type arguments
- Build output may not be properly generating type declarations
- Package resolution may need path adjustments

## Script Additions
None expected - focusing on type resolution fixes.
