# Autonomous Monorepo Dependency Crash Resolution

## Scope
1-2 hour target - Fix circular dependencies, React context errors, and client/server boundary violations

## Inputs
- Attached plan: Autonomous Monorepo Dependency Crash Resolution
- Current codebase structure with `apps/web` and `packages/ui`
- Error: `TypeError: createContext is not a function`
- Circular dependency between calendar.tsx and @starter/ui

## Plan
1. **Phase 1**: Break circular dependency in calendar.tsx and add 'use client' to card.tsx
2. **Phase 2**: Restructure @starter/ui package exports (client/server split)
3. **Phase 3**: Enforce React singleton via Next.js webpack config
4. **Phase 4**: Clear caches and rebuild
5. **Phase 5**: Verify server runs cleanly and pages load without errors

## Risks & Assumptions
- **Risk**: Changes to @starter/ui exports may affect other consumers
- **Risk**: Webpack aliasing may conflict with existing Next.js config
- **Assumption**: All UI components in packages/ui should be client components
- **Assumption**: Current pnpm workspace structure is correct
- **Guardrail**: Must maintain monorepo structure (apps/, packages/)
- **Guardrail**: Must preserve centralized theming via packages/config

## Script Additions
None - using existing pnpm scripts

## Success Criteria
- [ ] Dev server starts without TypeError
- [ ] Marketing page loads at /en/ with Liquid Glass UI
- [ ] No React context errors in console
- [ ] No circular dependency warnings
- [ ] TypeScript compilation passes
- [ ] Monorepo architecture intact
