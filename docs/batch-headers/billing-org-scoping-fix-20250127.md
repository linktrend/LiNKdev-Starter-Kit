# Batch Header: Billing Organization Scoping Fix

**Timestamp:** 2025-01-27
**Scope:** 2-3 hours - Fix billing system to scope all subscription data to org_id instead of user_id
**Inputs:** 
- Current billing utilities in `apps/web/src/utils/billing/`
- Mock billing store in `src/server/mocks/billing.store.ts`
- Stripe webhook handlers in `apps/web/src/app/api/webhooks/stripe/`
- tRPC billing router in `packages/api/src/routers/billing.ts`
- Existing billing tests

**Plan:**
1. Analyze current billing system structure and identify user_id dependencies
2. Refactor billing utilities to use org_id instead of user_id
3. Update mock store to manage subscriptions by org_id
4. Fix Stripe webhook handlers to lookup org_id from customer
5. Update tRPC billing router to use org_id from RBAC context
6. Run tests and typecheck to verify changes

**Risks & Assumptions:**
- RBAC middleware provides org_id in context
- billing_customers table has org_id column
- org_subscriptions table exists and is properly structured
- Existing tests can be updated to use org_id

**Script Additions:** None expected
