# OpenAPI Client Generation - 20250127

## Scope
1-2 hour target to integrate automated TypeScript client generation from OpenAPI spec

## Inputs
- Existing OpenAPI definition: `apps/web/openapi.yml`
- Current web app structure in `apps/web/`

## Plan
1. Install OpenAPI TypeScript code generation tool
2. Configure generation script in package.json
3. Generate initial client to `apps/web/src/api/rest/client.ts`
4. Create verification test file
5. Ensure build integrity with typecheck

## Risks & Assumptions
- OpenAPI spec is valid and complete
- Generated client will be compatible with existing codebase
- No breaking changes to existing API structure

## Script Additions
- `generate:api` script in apps/web/package.json

## Exit Criteria
- REST client exists at `apps/web/src/api/rest/client.ts`
- Type safety confirmed via test file
- Full monorepo passes `pnpm typecheck`
