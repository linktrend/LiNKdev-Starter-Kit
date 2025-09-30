# API Centralization - 2025-01-27

## Scope
1-2 hour target to resolve tRPC circular dependency/runtime issue by centralizing mobile/web API access

## Inputs
- Current tRPC setup in `apps/web/src/server/api/`
- Router files in `apps/web/src/server/routers/`
- Client files in `apps/web/src/trpc/`
- Existing package structure and dependencies

## Plan
1. Create new `packages/api` workspace with proper dependencies
2. Configure build system (tsup/tsconfig) for API package
3. Move server logic from web app to centralized API package
4. Update web server endpoint to use new API package
5. Update web client to import from centralized API
6. Clean up obsolete files and directories
7. Verify type checking and build success

## Risks & Assumptions
- Assumes current tRPC setup has circular dependency issues
- Risk: Breaking existing functionality during migration
- Risk: Type compatibility issues between packages
- Assumption: All router files can be safely moved
- Assumption: Client code can be updated without breaking changes

## Script Additions
- None expected (using existing pnpm workspace structure)
