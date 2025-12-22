# TRPC Type Troubleshooting Guide

Quick reference for common TRPC type issues in this monorepo.

## Quick Diagnostics

### Check if types are working

```typescript
// In any component:
import { api } from '@/trpc/react';

// Should have autocomplete:
api.billing.getPlans.useQuery();
//  ^? Should show all routers

// Should have input types:
api.billing.createCheckout.useMutation({
  onSuccess: (data) => {
    // data should be typed
  }
});
```

### Check TypeScript errors

```bash
# In API package:
cd packages/api && pnpm typecheck

# In web app:
cd apps/web && pnpm typecheck
```

---

## Common Issues and Solutions

### Issue: "Property 'X' does not exist on type 'any'"

**Symptom:**
```typescript
api.billing.getPlans.useQuery();
//  ^^^^^^^ Property 'billing' does not exist on type 'any'
```

**Cause:** TRPC client is using `any` instead of `AppRouter`.

**Solution:**

1. Check `apps/web/src/trpc/react.tsx`:
```typescript
// Should be:
export const api = createTRPCReact<AppRouter>();

// NOT:
export const api = createTRPCReact<any>();
```

2. Check `apps/web/src/trpc/types.ts`:
```typescript
// Should be:
export type { AppRouter } from '@starter/api';

// NOT:
export type AppRouter = any;
```

3. Restart TypeScript server in your editor.

---

### Issue: Types are stale after API changes

**Symptom:** You added a new procedure to the API, but the web app doesn't see it.

**Solution:**

1. Rebuild the API package:
```bash
cd packages/api && pnpm build
```

2. Clear TypeScript cache:
```bash
cd apps/web
rm -rf node_modules/.cache
rm -rf .next
rm -rf tsconfig.tsbuildinfo
```

3. Restart TypeScript server in your editor.

4. If still not working, check that `next.config.mjs` includes:
```javascript
transpilePackages: ['@starter/api', '@starter/types']
```

---

### Issue: "Type too complex to serialize"

**Symptom:**
```
error TS7056: The inferred type of this node exceeds the maximum length 
the compiler will serialize. An explicit type annotation is needed.
```

**Cause:** TRPC router types are too complex for declaration files.

**Solution:** This is expected! Keep using source files:

1. In `packages/api/package.json`, ensure:
```json
{
  "types": "./src/index.ts"
}
```

2. Do NOT try to generate `.d.ts` files for TRPC routers.

3. Next.js will transpile the source files automatically.

**Why:** TRPC routers create deeply nested generic types that exceed TypeScript's limits. Using source files is the recommended approach for TRPC monorepos.

---

### Issue: Autocomplete not working

**Symptom:** No suggestions when typing `api.`

**Possible Causes:**

1. **TypeScript server needs restart**
   - VS Code: `Cmd+Shift+P` → "TypeScript: Restart TS Server"
   - Cursor: Same as VS Code

2. **Wrong import**
   ```typescript
   // Should be:
   import { api } from '@/trpc/react';
   
   // NOT:
   import { api } from '@trpc/react';
   ```

3. **AppRouter not properly exported**
   - Check `packages/api/src/root.ts` has:
   ```typescript
   export type AppRouter = typeof appRouter;
   ```

4. **Build order issue**
   - Run `pnpm build` in API package first
   - Then restart TypeScript server

---

### Issue: "Cannot find module '@starter/api'"

**Symptom:**
```
error TS2307: Cannot find module '@starter/api' or its corresponding type declarations.
```

**Solution:**

1. Check that `apps/web/tsconfig.json` has paths:
```json
{
  "compilerOptions": {
    "paths": {
      "@starter/api": ["../packages/api/src"],
      "@starter/api/*": ["../packages/api/src/*"]
    }
  }
}
```

2. Verify symlink exists:
```bash
ls -la apps/web/node_modules/@starter/api
# Should show: @starter/api -> ../../../../packages/api
```

3. If symlink is missing, reinstall:
```bash
pnpm install
```

---

### Issue: Type errors in router files

**Symptom:**
```
packages/api/src/routers/user.ts(21,14): error TS2322: Type 'CreateRouterInner<...>' 
is not assignable to type 'CreateRouterInner<..., ProcedureRouterRecord>'.
```

**Cause:** Explicit type annotation breaking inference.

**Solution:** Remove the type annotation:

```typescript
// WRONG:
export const userRouter: ReturnType<typeof createTRPCRouter> = createTRPCRouter({
  // ...
});

// CORRECT:
export const userRouter = createTRPCRouter({
  // ...
});
```

Let TypeScript infer the type automatically.

---

### Issue: "ctx.user is possibly null" in protected procedures

**Symptom:**
```typescript
protectedProcedure.query(async ({ ctx }) => {
  const userId = ctx.user.id;
  //             ^^^^^^^^ Object is possibly 'null'
});
```

**Cause:** TypeScript doesn't infer that middleware narrows the type.

**Solution:** Already fixed in `packages/api/src/trpc.ts`:

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

If you see this error, the fix might not be applied. Check the file.

---

## Development Workflow

### Adding a new API procedure

1. **Add procedure to router:**
```typescript
// packages/api/src/routers/user.ts
export const userRouter = createTRPCRouter({
  // ... existing procedures
  
  newProcedure: protectedProcedure
    .input(z.object({ name: z.string() }))
    .query(async ({ input, ctx }) => {
      // Implementation
      return { result: input.name };
    }),
});
```

2. **Build API package:**
```bash
cd packages/api && pnpm build
```

3. **Use in web app:**
```typescript
// apps/web/src/components/MyComponent.tsx
import { api } from '@/trpc/react';

export function MyComponent() {
  const { data } = api.user.newProcedure.useQuery({ name: 'test' });
  //    ^? data is typed automatically!
  
  return <div>{data?.result}</div>;
}
```

4. **Verify types:**
   - Autocomplete should show `newProcedure`
   - Input should be typed as `{ name: string }`
   - Output should be typed as `{ result: string }`

### Debugging type issues

1. **Check API build:**
```bash
cd packages/api
pnpm build
# Should succeed without errors
```

2. **Check API typecheck:**
```bash
cd packages/api
pnpm typecheck
# Should show no TRPC-related errors
```

3. **Check web typecheck:**
```bash
cd apps/web
pnpm typecheck
# Should show no TRPC-related errors
```

4. **Check module resolution:**
```bash
cd apps/web
ls -la node_modules/@starter/api
# Should be a symlink to ../../packages/api
```

5. **Clear all caches:**
```bash
# Clear TypeScript cache
rm -rf apps/web/tsconfig.tsbuildinfo
rm -rf packages/api/tsconfig.tsbuildinfo

# Clear Next.js cache
rm -rf apps/web/.next

# Clear node modules cache
rm -rf apps/web/node_modules/.cache
rm -rf packages/api/node_modules/.cache

# Restart TypeScript server in editor
```

---

## Architecture Notes

### Why source files instead of declaration files?

TRPC routers create extremely complex types that exceed TypeScript's declaration file serialization limits. The solution is to use source files directly, which:

1. ✅ Works with any type complexity
2. ✅ Provides better error messages
3. ✅ Is faster to build
4. ✅ Is the recommended approach for TRPC monorepos

Next.js handles transpilation via `transpilePackages` config.

### Why no explicit type annotations?

Explicit type annotations like `ReturnType<typeof createTRPCRouter>` are too generic and break TypeScript's ability to infer the specific procedures in each router. Let TypeScript infer types automatically.

### Why does Next.js need to transpile the API package?

Because the API package is written in TypeScript and uses ES modules, Next.js needs to transpile it to JavaScript that can run in the browser. The `transpilePackages` config tells Next.js to do this.

---

## Maintenance

### When to rebuild

Rebuild the API package when:
- ✅ Adding/removing procedures
- ✅ Changing input/output types
- ✅ Modifying router structure
- ✅ Changing middleware

You don't need to rebuild for:
- ❌ Changing procedure implementation (logic)
- ❌ Updating comments
- ❌ Formatting changes

### Keeping types in sync

The build system ensures types stay in sync:

1. **Turbo.json** ensures API builds before web typechecks
2. **Next.js transpilePackages** ensures API is transpiled
3. **TypeScript paths** ensure correct module resolution

If types seem out of sync:
1. Rebuild API: `cd packages/api && pnpm build`
2. Clear caches (see above)
3. Restart TypeScript server

---

## Best Practices

### DO:
- ✅ Let TypeScript infer router types
- ✅ Use `protectedProcedure` for authenticated endpoints
- ✅ Define input schemas with Zod
- ✅ Keep routers focused and cohesive
- ✅ Use the TRPC client (`api.X.Y.useQuery()`)

### DON'T:
- ❌ Add explicit type annotations to routers
- ❌ Try to generate declaration files
- ❌ Use `any` in TRPC client
- ❌ Import TRPC directly (use `api` from `@/trpc/react`)
- ❌ Bypass type safety with `as any`

---

## Getting Help

If you encounter issues not covered here:

1. Check the completion report: `docs/task-reports/TRPC-TYPE-INVESTIGATION-completion.md`
2. Check TRPC docs: https://trpc.io/docs
3. Check TypeScript docs: https://www.typescriptlang.org/docs
4. Search for similar issues in T3 Stack: https://create.t3.gg

---

## Quick Reference

### File Locations

- **API routers:** `packages/api/src/routers/`
- **API root:** `packages/api/src/root.ts`
- **TRPC client:** `apps/web/src/trpc/react.tsx`
- **TRPC server:** `apps/web/src/trpc/server.ts`
- **Type exports:** `apps/web/src/trpc/types.ts`

### Key Commands

```bash
# Build API
cd packages/api && pnpm build

# Typecheck API
cd packages/api && pnpm typecheck

# Typecheck web
cd apps/web && pnpm typecheck

# Clear caches
rm -rf apps/web/.next apps/web/node_modules/.cache apps/web/tsconfig.tsbuildinfo

# Rebuild everything
pnpm -r build
```

### Key Config Files

- `packages/api/package.json` - API package config
- `packages/api/tsconfig.json` - API TypeScript config
- `apps/web/tsconfig.json` - Web TypeScript config (has paths)
- `apps/web/next.config.mjs` - Next.js config (has transpilePackages)
- `turbo.json` - Build system config

---

**Last Updated:** December 18, 2024
**Related:** `docs/task-reports/TRPC-TYPE-INVESTIGATION-completion.md`
