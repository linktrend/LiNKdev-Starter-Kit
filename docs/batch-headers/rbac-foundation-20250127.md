# RBAC Foundation Implementation - 20250127

## Scope: 2-3 hour target
Implementing a foundational, reusable Role-Based Access Control (RBAC) system within the centralized `@starter/api` package to serve as the primary security layer for gating privileged tRPC procedures.

## Inputs: Links/Files/Context used
- Existing database schema with roles (`owner`, `admin`, `member`, `viewer`) via `memberships` table
- Centralized `@starter/api` package structure
- Current tRPC context and middleware setup
- Existing `org.test.ts` test suite for validation

## Plan: bullet steps
1. **Define Role Hierarchy:** Create role hierarchy configuration and utilities
2. **Update tRPC Context:** Enhance context to reliably fetch user's organization role
3. **Create RBAC Middleware:** Implement reusable `accessGuard` middleware
4. **Apply to Core Routers:** Apply middleware to org, billing, and admin procedures
5. **Add Security Tests:** Create tests to verify role-based access control
6. **Type Safety Verification:** Ensure full typecheck compliance

## Risks & Assumptions: bullet list
- Database schema already supports roles via `memberships` table (no migrations needed)
- Existing `org.test.ts` must continue to pass
- Role hierarchy: owner > admin > member > viewer
- Context already has user and organization information available
- Middleware should throw `TRPCError` with 'FORBIDDEN' code for insufficient permissions

## Script Additions: Any new scripts added to package.json (if applicable)
- No new scripts required for this implementation
