# Billing System Testing Guide

This document describes the testing approach, structure, and procedures for the billing system.

## Overview

The billing system has comprehensive test coverage including:
- **Unit tests** for server actions
- **Integration tests** for webhook handlers
- **E2E tests** for critical user flows
- **Test helpers** for mocks and fixtures

## Test Structure

```
apps/web/
├── src/
│   ├── __tests__/
│   │   ├── helpers/
│   │   │   ├── stripe-mocks.ts          # Stripe API mocks
│   │   │   ├── billing-fixtures.ts      # Test data fixtures
│   │   │   ├── auth-helpers.ts          # Auth mocking utilities
│   │   │   └── database-helpers.ts      # Database mocking utilities
│   │   ├── actions/
│   │   │   └── billing.test.ts          # Server actions unit tests
│   │   └── api/
│   │       └── webhooks/
│   │           └── stripe.test.ts       # Webhook integration tests
└── tests/
    └── e2e/
        └── billing-checkout.spec.ts     # E2E smoke tests
```

## Running Tests

### Run All Billing Tests

```bash
pnpm --filter ./apps/web test billing
```

### Run Unit Tests Only

```bash
pnpm --filter ./apps/web test src/__tests__/actions/billing
```

### Run Integration Tests Only

```bash
pnpm --filter ./apps/web test src/__tests__/api/webhooks/stripe
```

### Run with Coverage

```bash
pnpm --filter ./apps/web test:coverage
```

### Run E2E Tests

```bash
pnpm --filter ./apps/web e2e billing-checkout.spec.ts
```

### Watch Mode (for development)

```bash
pnpm --filter ./apps/web test:watch
```

## Test Coverage

### Current Coverage Targets

- **Lines**: 80%
- **Functions**: 80%
- **Branches**: 75%
- **Statements**: 80%

### Viewing Coverage Reports

After running tests with coverage, open the HTML report:

```bash
open apps/web/coverage/index.html
```

## Mocking Strategy

### Stripe API Mocks

We mock the entire Stripe SDK to avoid real API calls. Mock objects are defined in `stripe-mocks.ts`:

- `mockStripeCustomer` - Complete customer object
- `mockStripeCheckoutSession` - Checkout session
- `mockStripeSubscription` - Subscription with items
- `mockStripeInvoice` - Invoice with payment details
- `createMockStripeEvent<T>()` - Factory for webhook events

**Example:**

```typescript
import { mockStripeCustomer, createMockStripeEvent } from '../helpers/stripe-mocks';

const event = createMockStripeEvent('customer.subscription.created', mockStripeSubscription);
```

### Supabase Database Mocks

We use the existing `InMemoryDatabase` helper for consistent database mocking:

```typescript
import { createInMemoryDB } from '../helpers/database-helpers';

const db = createInMemoryDB();
db.seedUser(mockUser);
db.seedOrganization(mockOrganization);
```

### Auth Mocks

We mock the auth server to return test users:

```typescript
vi.mock('@/lib/auth/server', () => ({
  requireAuth: vi.fn(() => Promise.resolve(mockUser)),
}));
```

## Test Data Fixtures

Test fixtures are defined in `billing-fixtures.ts`:

- `mockOrgSubscription` - Database subscription record
- `mockOrganization` - Organization with owner
- `mockUser` - User for auth context
- `mockBillingCustomer` - Billing customer record
- `mockOrganizationMember` - Organization membership

These fixtures match the actual database schema and can be customized per test.

## Unit Tests (Server Actions)

### What We Test

All 5 server actions are tested:

1. **createOrgStripeCustomer**
   - Creates new customer
   - Returns existing customer
   - Validates ownership
   - Handles errors

2. **createSubscriptionCheckout**
   - Creates checkout session
   - Validates ownership
   - Handles Stripe errors

3. **createBillingPortal**
   - Creates portal session
   - Validates ownership
   - Checks for existing customer

4. **getOrgSubscription**
   - Returns subscription for members
   - Validates membership
   - Handles missing subscriptions

5. **cancelSubscription**
   - Cancels at period end
   - Validates ownership
   - Handles errors

### Test Pattern

```typescript
describe('createOrgStripeCustomer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create a new Stripe customer', async () => {
    // Setup mocks
    vi.mocked(mockSupabaseClient.from).mockImplementation(...);
    
    // Execute action
    const result = await createOrgStripeCustomer('test-org-id');
    
    // Verify results
    expect(result.success).toBe(true);
    expect(stripeServer.createStripeCustomer).toHaveBeenCalled();
  });
});
```

## Integration Tests (Webhooks)

### What We Test

All webhook event types:

1. **checkout.session.completed** - Logs completion
2. **customer.subscription.created** - Creates subscription
3. **customer.subscription.updated** - Updates subscription
4. **customer.subscription.deleted** - Marks as canceled
5. **invoice.paid** - Logs payment
6. **invoice.payment_failed** - Updates to past_due

### Security & Reliability

- Signature verification
- Missing signature handling
- Invalid signature handling
- Idempotency checks (processed_events table)
- Duplicate event handling
- Database error handling

### Test Pattern

```typescript
it('should handle subscription.created event', async () => {
  const event = createMockStripeEvent('customer.subscription.created', mockStripeSubscription);
  
  // Mock database responses
  vi.mocked(mockSupabaseAdmin.from).mockImplementation(...);
  
  const request = createMockRequest(event);
  const response = await POST(request);
  
  expect(response.status).toBe(200);
});
```

## E2E Tests

### What We Test

Basic smoke tests for:
- Billing page loads
- Plans are displayed
- Upgrade buttons visible
- Manage billing (for active subscriptions)

### Note on E2E Tests

Most E2E tests are marked as `.skip()` because they require:
- Full authentication setup
- Organization creation
- Active subscription setup

These tests serve as templates for future comprehensive E2E testing.

## Adding New Tests

### Adding a Unit Test

1. Open `apps/web/src/__tests__/actions/billing.test.ts`
2. Add a new `it()` block in the appropriate `describe()` section
3. Follow the existing pattern: setup mocks → execute → verify
4. Clear mocks in `beforeEach()` to avoid state leakage

### Adding an Integration Test

1. Open `apps/web/src/__tests__/api/webhooks/stripe.test.ts`
2. Add a new test case for the event type
3. Use `createMockStripeEvent()` to create test events
4. Mock database responses appropriately

### Adding Test Fixtures

1. Open `apps/web/src/__tests__/helpers/billing-fixtures.ts`
2. Export a new fixture following the existing pattern
3. Ensure it matches the actual database schema
4. Document the fixture with a JSDoc comment

## Common Test Patterns

### Testing Success Path

```typescript
it('should perform action successfully', async () => {
  // Setup: Mock successful responses
  vi.mocked(dependency).mockResolvedValue(successData);
  
  // Execute: Call the function
  const result = await functionUnderTest();
  
  // Verify: Check success and side effects
  expect(result.success).toBe(true);
  expect(dependency).toHaveBeenCalledWith(expectedArgs);
});
```

### Testing Error Path

```typescript
it('should handle errors gracefully', async () => {
  // Setup: Mock error response
  vi.mocked(dependency).mockRejectedValue(new Error('Test error'));
  
  // Execute: Call the function
  const result = await functionUnderTest();
  
  // Verify: Check error handling
  expect(result.success).toBe(false);
  expect(result.error).toBeDefined();
});
```

### Testing Authorization

```typescript
it('should reject unauthorized users', async () => {
  // Setup: Mock non-owner user
  const nonOwnerOrg = { ...mockOrganization, owner_id: 'different-user' };
  vi.mocked(mockSupabaseClient.from).mockImplementation(...);
  
  // Execute & Verify
  const result = await functionUnderTest();
  expect(result.success).toBe(false);
  expect(result.error).toContain('owner');
});
```

## CI/CD Integration

Tests run automatically in CI/CD pipelines:

```yaml
# .github/workflows/test.yml
- name: Run Tests
  run: pnpm test
  
- name: Check Coverage
  run: pnpm test:coverage
```

Coverage reports are uploaded to CI artifacts.

## Manual Testing

For manual testing of the billing flow:

1. **Setup Stripe CLI**:
   ```bash
   pnpm --filter ./apps/web stripe:login
   ```

2. **Listen for webhooks**:
   ```bash
   pnpm --filter ./apps/web stripe:listen
   ```

3. **Test checkout flow**:
   - Navigate to `/billing`
   - Click "Upgrade" on a plan
   - Use Stripe test card: `4242 4242 4242 4242`
   - Verify webhook events in terminal

4. **Test billing portal**:
   - Click "Manage Billing"
   - Verify redirect to Stripe portal
   - Test subscription management

## Troubleshooting

### Tests Failing Locally

1. **Clear node_modules and reinstall**:
   ```bash
   rm -rf node_modules
   pnpm install
   ```

2. **Check mock setup**:
   - Ensure `vi.clearAllMocks()` in `beforeEach()`
   - Verify mock implementations match actual APIs

3. **Check test isolation**:
   - Each test should be independent
   - No shared state between tests

### Flaky Tests

If tests are flaky:
1. Check for timing issues (use `await` properly)
2. Verify mocks are synchronous
3. Ensure no real network calls
4. Check for race conditions

### Coverage Not Meeting Threshold

1. Run coverage report: `pnpm test:coverage`
2. Open HTML report: `open coverage/index.html`
3. Identify uncovered lines
4. Add tests for uncovered branches

## Best Practices

### DO

✅ Clear mocks between tests  
✅ Use realistic test data  
✅ Test both success and error paths  
✅ Test authorization checks  
✅ Keep tests fast (<30 seconds total)  
✅ Make tests deterministic  
✅ Document complex test setups  

### DON'T

❌ Make real API calls  
❌ Share state between tests  
❌ Use hardcoded dates (use `Date.now()`)  
❌ Skip error path testing  
❌ Ignore flaky tests  
❌ Test implementation details  

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [Stripe Testing Guide](https://stripe.com/docs/testing)
- [Testing Library Best Practices](https://testing-library.com/docs/guiding-principles/)

## Support

For questions about billing tests:
1. Check this documentation
2. Review existing test patterns
3. Check test output for specific errors
4. Consult the team

## Maintenance

### Regular Tasks

- Review coverage reports monthly
- Update mocks when Stripe API changes
- Add tests for new billing features
- Refactor tests when patterns emerge
- Keep documentation up to date

### When to Update Tests

- After adding new billing features
- When Stripe API version changes
- When database schema changes
- When bugs are found (add regression tests)
- When test patterns improve
