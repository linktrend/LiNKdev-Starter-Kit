# Stabilize and Consolidate Batch - 2025-01-27

## Scope
1-2 hour target to achieve zero quality debt, fully centralized shared types, and successfully integrated Internationalization boilerplate.

## Inputs
- Current codebase with modified files in git status
- Existing packages/types structure
- Previous i18n integration attempts

## Plan
1. **PHASE I: CODE HYGIENE (P1)**
   - Run ESLint with --fix flag on apps/web
   - Manually resolve remaining linting warnings/errors
   - Achieve zero linting warnings/errors

2. **PHASE II: TYPES CONSOLIDATION (P2)**
   - Configure packages/types to generate DTS files
   - Scan apps/web/src for old type imports (@/types/, src/types/)
   - Update all imports to use @starter/types

3. **PHASE III: INTERNATIONALIZATION (P3)**
   - Re-attempt next-intl installation
   - Resolve TypeScript configuration conflicts
   - Implement essential boilerplate without changing existing text

## Risks & Assumptions
- TypeScript configuration conflicts with next-intl may require careful resolution
- Some type imports may be deeply nested and require systematic scanning
- Linting fixes should not break existing functionality

## Script Additions
- None expected, using existing pnpm scripts

## Exit Criteria
- pnpm build succeeds
- pnpm typecheck passes with zero errors
- pnpm lint passes with zero warnings/errors
- next-intl boilerplate functional without type conflicts
