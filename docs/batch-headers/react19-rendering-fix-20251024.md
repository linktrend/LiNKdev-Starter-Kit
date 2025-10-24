# React 19 Rendering Crash Resolution

## Scope
1-2 hour target - Fix "Objects are not valid as a React child" error in React 19

## Inputs
- Error: "Objects are not valid as a React child (found: object with keys {$$typeof, type, key, props, _owner, _store})"
- Current stack: React 19.0.0-rc, Next.js 14.2.3, next-intl 3.26.5
- Target: Marketing page at `/en/`

## Plan
1. **Phase 1**: Audit home page and Hero/Pricing components for object rendering
2. **Phase 2**: Check Footer component for logo/copyright rendering issues
3. **Phase 3**: Deep dive into recently modified UI components (Card, Button, Tabs)
4. **Iterative Testing**: After each fix, restart server and test page load

## Risks & Assumptions
- **Risk**: React 19 has stricter rendering rules than React 18
- **Assumption**: Error is in JSX where an object/array is being rendered as a child
- **Guardrail**: Must maintain React 19, monorepo structure, and Liquid Glass styling
- **Guardrail**: No downgrades to React or next-intl

## Script Additions
None - using existing pnpm scripts

## Success Criteria
- [ ] Server starts without "Objects are not valid as a React child" error
- [ ] Marketing page loads at /en/ with full Liquid Glass UI
- [ ] No console errors related to rendering
