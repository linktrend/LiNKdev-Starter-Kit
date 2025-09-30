# Role Permission Security Fix - 20250127

## Scope
Fix critical security bug where non-admin users can change organization member roles. Target: 1-2 hours.

## Inputs
- apps/web/src/server/routers/org.ts (updateMembership mutation)
- apps/web/src/server/__tests__/org.test.ts (failing test case)
- apps/web/src/types/org.ts (role type definitions)

## Plan
1. Run org.test.ts to identify specific failure case
2. Examine updateMembership mutation authorization logic
3. Add proper admin role check before allowing role changes
4. Validate fix with test suite
5. Ensure all org tests still pass

## Risks & Assumptions
- Risk: Breaking existing functionality if authorization logic is too restrictive
- Assumption: Only admins should be able to change member roles
- Assumption: Current test suite accurately reflects expected behavior

## Script Additions
None expected - using existing test commands
