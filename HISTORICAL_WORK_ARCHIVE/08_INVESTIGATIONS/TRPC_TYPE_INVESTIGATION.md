# TRPC Type Investigation - Historical Work Archive

## Overview

This investigation resolved critical TRPC type propagation issues between `@starter/api` and `apps/web`. The root cause was a combination of explicit type annotations breaking inference, TRPC client using `any` type, and a temporary workaround masking the real issues. The solution established the correct pattern for TRPC in monorepos using source files instead of declaration files.

## Date

**December 18, 2024**

## Problem Statement

The web application was experiencing widespread TRPC type errors:
- Property 'audit' does not exist on type 'any'
- Property 'billing' does not exist on type 'any'
- Property 'records' does not exist on type 'any'
- 50+ similar errors across the codebase

Autocomplete was completely broken for TRPC procedures, and the `AppRouter` type was defined as `any`, eliminating all type safety.

## Root Causes Identified

### 1. Explicit Router Type Annotations
**Problem**: All 14 router files used explicit type annotations that broke TypeScript inference:
```typescript
export const userRouter: ReturnType<typeof createTRPCRouter> = createTRPCRouter({
  // ...
});
```

**Impact**: TypeScript couldn't infer the specific router structure, only the generic return type.

### 2. TRPC Client Using `any` Type
**Problem**: TRPC client was explicitly typed as `any`:
```typescript
export const api = createTRPCReact<any>();
```

**Impact**: Eliminated all type safety and autocomplete for TRPC procedures.

### 3. AppRouter Type Workaround
**Problem**: Temporary workaround masked the real issues:
```typescript
export type AppRouter = any;
```

**Impact**: Hid type errors but prevented proper type propagation.

### 4. TRPC Router Type Complexity
**Key Discovery**: TRPC routers are too complex for TypeScript declaration file generation:
```
error TS7056: The inferred type of this node exceeds the maximum length 
the compiler will serialize. An explicit type annotation is needed.
```

**Reason**: With 14+ routers and 100+ procedures, the deeply nested generic types exceed TypeScript's serialization limits.

## Solution Implemented

### 1. Removed Explicit Type Annotations
**Change**: Let TypeScript infer router types naturally:
```typescript
export const userRouter = createTRPCRouter({
  // ...
});
```

**Files Modified**: All 14 router files (13 routers + root)

### 2. Restored Proper AppRouter Type
**Change**: Import type from API package:
```typescript
export type { AppRouter } from '@starter/api';
```

**Files Modified**: `apps/web/src/trpc/types.ts`

### 3. Fixed TRPC Client Type
**Change**: Use proper AppRouter type:
```typescript
export const api = createTRPCReact<AppRouter>();
```

**Files Modified**: `apps/web/src/trpc/react.tsx`, `apps/web/src/trpc/server.ts`

### 4. Enhanced Protected Procedure Context
**Change**: Added type assertion for non-null user:
```typescript
export const protectedProcedure = publicProcedure
  .use(({ ctx, next }) => {
    if (!ctx.user) {
      throw new TRPCError({ code: 'UNAUTHORIZED' });
    }
    return next({
      ctx: {
        ...ctx,
        user: ctx.user as NonNullable<typeof ctx.user>,
      },
    });
  });
```

**Impact**: Eliminated unnecessary null checks in protected procedures.

### 5. Added Build System Dependencies
**Change**: Created `turbo.json` with proper build order:
```json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**"]
    },
    "typecheck": {
      "dependsOn": ["^build"]
    }
  }
}
```

**Impact**: Ensures API builds before web app typechecks.

## Architecture Decision: Source Files vs Declaration Files

### Decision Made
**Use source files for types, not declaration files.**

### Rationale
1. **TRPC Complexity**: Router types exceed TypeScript's serialization limits
2. **Monorepo Pattern**: Workspace packages commonly use source files
3. **Next.js Support**: `transpilePackages` handles source transpilation
4. **Developer Experience**: Faster builds, better error messages
5. **Industry Standard**: T3 Stack and other TRPC monorepos use this pattern

### Configuration
```json
{
  "types": "./src/index.ts",
  "exports": {
    ".": {
      "types": "./src/index.ts",
      "import": "./dist/index.js"
    }
  }
}
```

### Why This Works
1. Next.js transpiles `@starter/api` via `transpilePackages` config
2. TypeScript resolves types directly from source files
3. Source files have full type information without serialization limits
4. No declaration files needed for workspace packages

## Results

### Before Fix
```bash
$ cd apps/web && pnpm typecheck
# 50+ TRPC-related errors
# No autocomplete for api.billing.*, api.audit.*, etc.
```

### After Fix
```bash
$ cd apps/web && pnpm typecheck
# TRPC errors: GONE ✅
# Full autocomplete with all router names and procedures
# Proper input/output types for each procedure
```

### Type Autocomplete
**Before**: No autocomplete for TRPC procedures

**After**: Full autocomplete with:
- All router names (billing, audit, user, etc.)
- All procedures (getPlans, createCheckout, etc.)
- Input/output types for each procedure
- Proper error types

## Files Modified

### Router Files (14 files)
- `packages/api/src/root.ts` - Removed type annotation
- All 13 router files - Removed `ReturnType<typeof createTRPCRouter>` annotations

### Type Files (3 files)
- `packages/api/src/trpc.ts` - Added NonNullable assertion
- `apps/web/src/trpc/types.ts` - Restored proper AppRouter import
- `apps/web/src/trpc/react.tsx` - Changed from any to AppRouter
- `apps/web/src/trpc/server.ts` - Changed from any to AppRouter

### Configuration Files (2 files)
- `turbo.json` - Created with build dependencies
- `packages/api/tsconfig.build.json` - Created for future use

## Lessons Learned

### 1. TRPC Type Complexity is Real
- Not a bug, it's a feature (full type safety)
- Declaration files aren't always possible
- Source files are a valid solution

### 2. Explicit Type Annotations Can Hurt
- `ReturnType<typeof X>` is too generic
- Let TypeScript infer specific types
- Only annotate when necessary

### 3. `any` Hides Problems
- The `AppRouter = any` workaround masked the real issues
- Always investigate why `any` was needed
- Fix root cause, don't paper over it

### 4. Monorepo Patterns Differ from Libraries
- Workspace packages don't need declaration files
- Transpilation is handled by the consumer (Next.js)
- Source files are first-class citizens

### 5. Build System Matters
- Proper build order prevents stale types
- Turborepo helps but needs configuration
- Always verify dependencies are correct

## Recommendations for Future

### 1. Keep Using Source Files
Do not attempt to generate declaration files for TRPC routers. The current setup is correct and follows best practices.

### 2. Monitor TypeScript Performance
If TypeScript becomes slow:
- Consider splitting routers into smaller sub-routers
- Use project references for better incremental builds
- Profile with `tsc --extendedDiagnostics`

### 3. Document the Pattern
Add a comment in `packages/api/package.json`:
```json
{
  "types": "./src/index.ts",
  "// Note": "Types point to source files because TRPC routers are too complex for declaration files"
}
```

### 4. Consider Router Splitting
If routers grow very large (100+ procedures), consider splitting:
```typescript
export const billingRouter = createTRPCRouter({
  subscriptions: subscriptionsRouter,
  invoices: invoicesRouter,
  usage: usageRouter,
});
```

## References

- [TRPC Type Safety Docs](https://trpc.io/docs/server/procedures#type-safety)
- [TypeScript Module Resolution](https://www.typescriptlang.org/docs/handbook/module-resolution.html)
- [Next.js transpilePackages](https://nextjs.org/docs/app/api-reference/next-config-js/transpilePackages)
- [T3 Stack TRPC Setup](https://create.t3.gg/en/usage/trpc)
- [TypeScript Issue: Type too complex](https://github.com/microsoft/TypeScript/issues/34119)

## Conclusion

The TRPC type propagation issues were successfully resolved by:
1. Removing explicit type annotations that broke inference
2. Restoring proper AppRouter type in the web app
3. Fixing TRPC client to use AppRouter instead of any
4. Understanding that source files are the correct approach for TRPC in monorepos

The key insight is that TRPC router types are too complex for TypeScript declaration files, and the correct solution is to use source files with Next.js transpilation. This is the recommended pattern for TRPC monorepos and is used by production applications like the T3 Stack.

**Status**: ✅ Complete  
**Date**: December 18, 2024  
**Impact**: Restored full type safety and autocomplete for all TRPC procedures
