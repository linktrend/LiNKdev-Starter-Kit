# UI/UX Consolidation and Theming Blueprint - 2025-01-27

## Scope
- **Target Duration**: 2-3 hours
- **Focus**: Complete UI/UX consolidation with centralized theming architecture
- **Platforms**: Web (Next.js) + Mobile (React Native/Expo)

## Inputs
- Existing design tokens in `design/DESIGN_TOKENS.json`
- Current Tailwind preset in `packages/config/tailwind-preset.js`
- Web app styling in `apps/web/src/styles/globals.css`
- Shadcn components in `apps/web/src/components/ui/`
- UI package structure in `packages/ui/`

## Plan
### Phase I: Centralized Theme Architecture
1. Audit and consolidate design tokens in shared config
2. Audit web-specific theming for CSS HSL variables
3. Eliminate hard-coded values across web components

### Phase II: Component Library Completeness
1. Audit Shadcn components in web app
2. Ensure proper exports via `@starter/ui` package
3. Replace custom components with standardized primitives
4. Enforce consistent form patterns

### Phase III: UX Polish and Documentation
1. Standardize layout and accessibility
2. Create comprehensive theming guide
3. Verify cross-platform themeability

## Risks & Assumptions
- **Risk**: Existing components may have hard-coded values that need refactoring
- **Risk**: Mobile theming integration may require additional configuration
- **Assumption**: Shadcn MCP server is properly installed and functional
- **Assumption**: Current design tokens are comprehensive and up-to-date

## Script Additions
- None anticipated (using existing build/test scripts)

## Success Criteria
- ✅ Cross-platform themeability via central config
- ✅ All components use `@starter/ui` namespace
- ✅ Build and type check pass
- ✅ Comprehensive theming documentation
