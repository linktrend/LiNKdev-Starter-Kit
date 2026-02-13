# Testing Guide

**Comprehensive guide to testing in the LiNKdev Starter Kit**

---

## Table of Contents

1. [Testing Philosophy](#testing-philosophy)
2. [Unit Testing with Vitest](#unit-testing-with-vitest)
3. [Integration Testing](#integration-testing)
4. [E2E Testing with Playwright](#e2e-testing-with-playwright)
5. [Test Helpers & Fixtures](#test-helpers--fixtures)
6. [Coverage Requirements](#coverage-requirements)
7. [Running Tests](#running-tests)
8. [Writing Good Tests](#writing-good-tests)
9. [Mocking & Test Data](#mocking--test-data)
10. [CI/CD Integration](#cicd-integration)

---

## Testing Philosophy

### Testing Pyramid

Our testing strategy follows the testing pyramid principle:

```
        /\
       /E2E\          ← Few, critical user flows
      /------\
     /Integration\    ← API routes, tRPC routers
    /------------\
   /   Unit Tests  \   ← Many, fast, isolated
  /----------------\
```

- **Unit Tests**: Fast, isolated tests for individual functions/components
- **Integration Tests**: Test interactions between modules (tRPC routers, API routes)
- **E2E Tests**: Full browser tests for critical user journeys

### Principles

✅ **Test behavior, not implementation**  
✅ **Write tests that fail for the right reasons**  
✅ **Keep tests fast and deterministic**  
✅ **Test error paths as well as success paths**  
✅ **Use realistic test data**  
✅ **Maintain test isolation**  

---

## Unit Testing with Vitest

### Overview

Unit tests are fast, isolated tests that verify individual functions, components, or modules work correctly in isolation.

**Location**: `apps/web/src/__tests__/` and `packages/api/src/__tests__/`

### Configuration

Vitest is configured per package:

- **Web App** (`apps/web/vitest.config.ts`): Uses `jsdom` environment for React components
- **API Package** (`packages/api/vitest.config.ts`): Uses `node` environment for server-side code

### Example: Testing Server Actions

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createOrgStripeCustomer } from '@/app/actions/billing';
import { mockStripeCustomer } from '../helpers/stripe-mocks';
import { mockOrganization, mockUser } from '../helpers/billing-fixtures';

// Mock dependencies
vi.mock('@/lib/auth/server', () => ({
  requireAuth: vi.fn(() => Promise.resolve(mockUser)),
}));

vi.mock('@/lib/stripe/server', () => ({
  createStripeCustomer: vi.fn(() => Promise.resolve(mockStripeCustomer)),
}));

describe('createOrgStripeCustomer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create a new Stripe customer for organization', async () => {
    // Setup mocks
    const mockSupabaseClient = {
      from: vi.fn((table: string) => {
        if (table === 'organizations') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                single: vi.fn(() => Promise.resolve({ data: mockOrganization, error: null })),
              })),
            })),
          };
        }
        // ... other table mocks
      }),
    };

    vi.mocked(createClient).mockReturnValue(mockSupabaseClient);

    // Execute action
    const result = await createOrgStripeCustomer('test-org-id');

    // Verify results
    expect(result.success).toBe(true);
    expect(result.data?.customerId).toBe('cus_test123');
  });

  it('should handle errors gracefully', async () => {
    // Mock error response
    vi.mocked(createStripeCustomer).mockRejectedValue(new Error('Stripe API error'));

    const result = await createOrgStripeCustomer('test-org-id');

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});
```

### Example: Testing tRPC Routers

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TRPCError } from '@trpc/server';
import { automationRouter } from '../../routers/automation';

const baseContext = () => ({
  supabase: { from: vi.fn() },
  user: { id: 'user-1' },
  orgId: 'org-123',
});

describe('automationRouter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('enqueues events successfully', async () => {
    const enqueueEventMock = vi.fn().mockResolvedValue('evt-123');
    globalThis.enqueueEvent = enqueueEventMock;

    const caller = automationRouter.createCaller(baseContext());

    const result = await caller.enqueue({
      orgId: 'org-123',
      event: 'user.signup',
      payload: { userId: 'user-1' },
    });

    expect(result.success).toBe(true);
    expect(result.eventId).toBe('evt-123');
    expect(enqueueEventMock).toHaveBeenCalledWith('org-123', 'user.signup', { userId: 'user-1' });
  });

  it('surfaces enqueue failures', async () => {
    const enqueueEventMock = vi.fn().mockRejectedValue(new Error('boom'));
    globalThis.enqueueEvent = enqueueEventMock;

    const caller = automationRouter.createCaller(baseContext());

    await expect(
      caller.enqueue({
        orgId: 'org-123',
        event: 'user.signup',
        payload: {},
      }),
    ).rejects.toBeInstanceOf(TRPCError);
  });
});
```

### Best Practices

- **Clear mocks between tests**: Use `beforeEach(() => vi.clearAllMocks())`
- **Test both success and error paths**: Don't just test the happy path
- **Use descriptive test names**: `it('should create customer when organization exists')`
- **Keep tests focused**: One assertion per test when possible
- **Mock external dependencies**: Never make real API calls in unit tests

---

## Integration Testing

### Overview

Integration tests verify that multiple modules work together correctly. They test tRPC routers, API routes, and database interactions.

**Location**: `packages/api/src/__tests__/integration/` and `apps/web/src/__tests__/api/`

### Test Context Factory

Integration tests use a test context factory to create tRPC callers with mocked database:

```typescript
import { createTestCaller } from './helpers/test-context';
import { createTestUser, createTestOrganization } from './helpers/test-data';

describe('Organization Router Integration Tests', () => {
  let testUser: any;
  let testOrg: any;

  beforeEach(() => {
    testUser = createTestUser();
    testOrg = createTestOrganization({ owner_id: testUser.id });
  });

  it('should list organizations for the user', async () => {
    const { caller, getTable } = createTestCaller({ user: testUser });
    const orgMembers = getTable('organization_members');

    orgMembers.__queueEqResponse({
      data: [
        {
          role: 'owner',
          organizations: { ...testOrg },
        },
      ],
      error: null,
    });

    const result = await caller.organization.list();

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      id: testOrg.id,
      name: testOrg.name,
      role: 'owner',
    });
  });
});
```

### Example: Testing Webhook Handlers

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/webhooks/stripe/route';
import { createMockStripeEvent } from '../helpers/stripe-mocks';
import { mockStripeSubscription } from '../helpers/stripe-mocks';

describe('Stripe Webhook Handler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should handle subscription.created event', async () => {
    const event = createMockStripeEvent('customer.subscription.created', mockStripeSubscription);

    // Mock database responses
    const mockSupabaseAdmin = {
      from: vi.fn((table: string) => {
        if (table === 'org_subscriptions') {
          return {
            insert: vi.fn(() => ({
              select: vi.fn(() => ({
                single: vi.fn(() => Promise.resolve({ data: null, error: null })),
              })),
            })),
          };
        }
        // ... other tables
      }),
    };

    vi.mocked(createAdminClient).mockReturnValue(mockSupabaseAdmin);

    const request = new Request('http://localhost/api/webhooks/stripe', {
      method: 'POST',
      headers: {
        'stripe-signature': 'test-signature',
      },
      body: JSON.stringify(event),
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
  });

  it('should verify webhook signature', async () => {
    const request = new Request('http://localhost/api/webhooks/stripe', {
      method: 'POST',
      headers: {}, // Missing signature
      body: JSON.stringify({}),
    });

    const response = await POST(request);

    expect(response.status).toBe(401);
  });
});
```

### Testing Security & Authorization

```typescript
it('should reject unauthorized users', async () => {
  const nonOwnerUser = createTestUser();
  const org = createTestOrganization({ owner_id: 'different-user-id' });

  const { caller } = createTestCaller({ user: nonOwnerUser });

  await expect(
    caller.organization.update({
      id: org.id,
      name: 'New Name',
    }),
  ).rejects.toThrow(TRPCError);
});
```

### Best Practices

- **Use realistic test data**: Match actual database schema
- **Test authorization checks**: Verify RBAC enforcement
- **Test error handling**: Database errors, network failures, etc.
- **Verify side effects**: Check audit logs, notifications, etc.
- **Test idempotency**: Important for webhooks and async operations

---

## E2E Testing with Playwright

### Overview

E2E tests run in real browsers and test complete user flows from start to finish.

**Location**: `apps/web/tests/e2e/`

### Configuration

Playwright is configured in `apps/web/playwright.config.ts`:

- **Browsers**: Chromium, Firefox, WebKit
- **Base URL**: `http://localhost:3000` (or `PLAYWRIGHT_BASE_URL` env var)
- **Retries**: 2 retries in CI, 0 locally
- **Screenshots**: On failure only
- **Video**: Retained on failure

### Page Object Pattern

E2E tests use the Page Object pattern for maintainability:

```typescript
// tests/page-objects/LoginPage.ts
import { Page, expect } from '@playwright/test';

export class LoginPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/en/login');
  }

  async loginWithPassword(email: string, password: string) {
    await this.page.fill('input[name="email"]', email);
    await this.page.fill('input[name="password"]', password);
    await this.page.click('button[type="submit"]');
  }

  async expectLoginError(message: string) {
    await expect(this.page.locator('.error-message')).toContainText(message);
  }
}
```

### Example: Login Flow Test

```typescript
import { test, expect } from '@playwright/test';
import { LoginPage } from '../page-objects/LoginPage';
import { DashboardPage } from '../page-objects/DashboardPage';
import { createTestUser, deleteUserCascade } from '../helpers/setup';
import { randomPassword } from '../helpers/test-data';

test.describe('Login flows', () => {
  test('login with email/password', async ({ page }) => {
    const { id, email, password } = await createTestUser({ password: randomPassword() });
    
    // Update user to completed onboarding
    const admin = getAdminClient();
    await admin
      .from('users')
      .update({ onboarding_completed: true, profile_completed: true })
      .eq('id', id);

    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);

    try {
      await loginPage.loginWithPassword(email, password);
      await dashboardPage.goto();
      await dashboardPage.expectLoaded();
    } finally {
      await deleteUserCascade(id);
    }
  });

  test('failed login shows error', async ({ page }) => {
    const { id, email } = await createTestUser({ password: randomPassword() });
    const wrongPassword = 'WrongPass123!';
    const loginPage = new LoginPage(page);

    try {
      await loginPage.loginWithPassword(email, wrongPassword);
      await loginPage.expectLoginError('Invalid login credentials');
    } finally {
      await deleteUserCascade(id);
    }
  });
});
```

### Test Helpers for E2E

```typescript
// tests/helpers/setup.ts
import { createClient } from '@supabase/supabase-js';

export async function createTestUser(options: { password?: string } = {}) {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  
  const { data, error } = await supabase.auth.admin.createUser({
    email: `test-${Date.now()}@example.com`,
    password: options.password || 'TestPassword123!',
    email_confirm: true,
  });

  if (error) throw error;
  return data.user;
}

export async function deleteUserCascade(userId: string) {
  const admin = getAdminClient();
  // Delete related records, then user
  await admin.from('users').delete().eq('id', userId);
}
```

### Best Practices

- **Use Page Objects**: Encapsulate page interactions
- **Clean up test data**: Always delete test users/orgs in `finally` blocks
- **Use realistic waits**: Prefer `expect().toBeVisible()` over `page.waitForTimeout()`
- **Test critical paths**: Focus on user journeys that matter most
- **Keep tests independent**: Each test should be able to run alone
- **Use test data helpers**: Don't hardcode test data

---

## Test Helpers & Fixtures

### Location

Test helpers are organized by purpose:

```
apps/web/src/__tests__/helpers/
├── auth-helpers.ts          # Auth mocking utilities
├── billing-fixtures.ts       # Billing test data
├── database-helpers.ts       # Database mocking
└── stripe-mocks.ts          # Stripe API mocks

packages/api/src/__tests__/helpers/
├── fixtures.ts              # General test fixtures
├── middleware-helpers.ts    # Middleware testing utilities
└── supabaseMock.ts         # Supabase client mocks

packages/api/src/__tests__/integration/helpers/
├── test-context.ts          # tRPC caller factory
└── test-data.ts            # Test data generators
```

### Auth Helpers

```typescript
// apps/web/src/__tests__/helpers/auth-helpers.ts
import { createMockUser, createMockSession } from './auth-helpers';

// Mock auth server
vi.mock('@/lib/auth/server', () => ({
  requireAuth: vi.fn(() => Promise.resolve(createMockUser())),
  getSession: vi.fn(() => Promise.resolve(createMockSession())),
}));
```

### Database Helpers

```typescript
// apps/web/src/__tests__/helpers/database-helpers.ts
import { createInMemoryDB } from './database-helpers';

const db = createInMemoryDB();
db.seedUser(mockUser);
db.seedOrganization(mockOrganization);

// Use in tests
const user = await db.getUser('user-id');
```

### Stripe Mocks

```typescript
// apps/web/src/__tests__/helpers/stripe-mocks.ts
import { mockStripeCustomer, createMockStripeEvent } from '../helpers/stripe-mocks';

const event = createMockStripeEvent('customer.subscription.created', mockStripeSubscription);
```

### Billing Fixtures

```typescript
// apps/web/src/__tests__/helpers/billing-fixtures.ts
import {
  mockOrgSubscription,
  mockOrganization,
  mockUser,
  mockBillingCustomer,
} from '../helpers/billing-fixtures';

// Use in tests
const org = mockOrganization({ owner_id: 'user-123' });
```

### Test Data Generators

```typescript
// packages/api/src/__tests__/integration/helpers/test-data.ts
import { createTestUser, createTestOrganization, generateUUID } from './helpers/test-data';

const user = createTestUser({ email: 'custom@example.com' });
const org = createTestOrganization({ owner_id: user.id });
```

---

## Coverage Requirements

### Coverage Thresholds

Current coverage targets (configured in `vitest.config.ts`):

- **Lines**: 80%
- **Functions**: 80%
- **Branches**: 80%
- **Statements**: 80%

### Viewing Coverage Reports

```bash
# Run tests with coverage
pnpm --filter ./apps/web test:coverage

# Open HTML report
open apps/web/coverage/index.html
```

### Coverage Exclusions

The following are excluded from coverage:

- Test files (`**/*.test.{ts,tsx}`, `**/__tests__/**`)
- Type definitions (`**/*.d.ts`, `src/types/**`)
- Generated code (`src/api/rest/**`)
- Test utilities (`src/test/**`)

### Improving Coverage

1. **Run coverage report**: `pnpm test:coverage`
2. **Open HTML report**: Identify uncovered lines
3. **Add tests for uncovered branches**: Focus on error paths
4. **Test edge cases**: Boundary conditions, null checks
5. **Verify coverage increases**: Re-run coverage after adding tests

---

## Running Tests

### Running All Tests

```bash
# Run all tests
pnpm test

# Run web app tests only
pnpm --filter ./apps/web test

# Run API package tests only
pnpm --filter ./packages/api test
```

### Running Specific Test Suites

```bash
# Run tests matching a pattern
pnpm --filter ./apps/web test billing

# Run a specific test file
pnpm --filter ./apps/web test src/__tests__/actions/billing.test.ts

# Run tests in a directory
pnpm --filter ./apps/web test src/__tests__/actions/
```

### Watch Mode

```bash
# Watch mode for development
pnpm --filter ./apps/web test:watch

# Watch specific file
pnpm --filter ./apps/web test:watch billing.test.ts
```

### E2E Tests

```bash
# Run all E2E tests
pnpm --filter ./apps/web e2e

# Run specific E2E test
pnpm --filter ./apps/web e2e login.spec.ts

# Run E2E tests in UI mode
pnpm --filter ./apps/web e2e:ui

# Run E2E tests in headed mode (see browser)
pnpm --filter ./apps/web e2e:headed
```

### Coverage

```bash
# Run with coverage
pnpm --filter ./apps/web test:coverage

# View coverage report
open apps/web/coverage/index.html
```

### Debugging Tests

```bash
# Run tests with Node debugger
node --inspect-brk node_modules/.bin/vitest run

# Run Playwright in debug mode
pnpm --filter ./apps/web e2e:debug
```

---

## Writing Good Tests

### Test Structure (AAA Pattern)

Follow the Arrange-Act-Assert pattern:

```typescript
it('should create customer when organization exists', async () => {
  // Arrange: Setup mocks and test data
  const mockOrg = mockOrganization({ id: 'org-123' });
  vi.mocked(getOrg).mockResolvedValue(mockOrg);

  // Act: Execute the function under test
  const result = await createOrgStripeCustomer('org-123');

  // Assert: Verify the results
  expect(result.success).toBe(true);
  expect(result.data?.customerId).toBeDefined();
});
```

### Test Naming

Use descriptive test names that explain what is being tested:

✅ **Good**:
- `it('should create customer when organization exists')`
- `it('should reject unauthorized users')`
- `it('should handle Stripe API errors gracefully')`

❌ **Bad**:
- `it('works')`
- `it('test create customer')`
- `it('should work correctly')`

### Testing Success Paths

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

### Testing Error Paths

```typescript
it('should handle errors gracefully', async () => {
  // Setup: Mock error response
  vi.mocked(dependency).mockRejectedValue(new Error('Test error'));

  // Execute: Call the function
  const result = await functionUnderTest();

  // Verify: Check error handling
  expect(result.success).toBe(false);
  expect(result.error).toBeDefined();
  expect(result.error).toContain('Test error');
});
```

### Testing Authorization

```typescript
it('should reject unauthorized users', async () => {
  // Setup: Mock non-owner user
  const nonOwnerOrg = { ...mockOrganization, owner_id: 'different-user' };
  vi.mocked(getOrg).mockResolvedValue(nonOwnerOrg);

  // Execute & Verify
  const result = await functionUnderTest();
  expect(result.success).toBe(false);
  expect(result.error).toContain('owner');
});
```

### Test Isolation

Each test should be independent:

```typescript
describe('MyFeature', () => {
  beforeEach(() => {
    // Clear all mocks between tests
    vi.clearAllMocks();
    
    // Reset test data
    testData.reset();
  });

  afterEach(() => {
    // Cleanup if needed
    vi.restoreAllMocks();
  });

  it('test 1', () => {
    // This test doesn't depend on test 2
  });

  it('test 2', () => {
    // This test doesn't depend on test 1
  });
});
```

### Common Pitfalls

❌ **Don't test implementation details**:
```typescript
// Bad: Testing internal variable
expect(internalCounter).toBe(1);

// Good: Testing observable behavior
expect(result.count).toBe(1);
```

❌ **Don't make real API calls**:
```typescript
// Bad: Real API call
const customer = await stripe.customers.create({ email: 'test@example.com' });

// Good: Mocked API call
vi.mocked(stripe.customers.create).mockResolvedValue(mockCustomer);
```

❌ **Don't share state between tests**:
```typescript
// Bad: Shared state
let sharedData = {};

// Good: Isolated state
beforeEach(() => {
  const testData = createTestData();
});
```

---

## Mocking & Test Data

### Mocking External APIs

#### Stripe

```typescript
import { vi } from 'vitest';
import { mockStripeCustomer, createMockStripeEvent } from '../helpers/stripe-mocks';

vi.mock('@/lib/stripe/server', () => ({
  stripe: {
    customers: {
      create: vi.fn(() => Promise.resolve(mockStripeCustomer)),
    },
  },
  createStripeCustomer: vi.fn(() => Promise.resolve(mockStripeCustomer)),
}));

// Use in tests
const event = createMockStripeEvent('customer.subscription.created', mockStripeSubscription);
```

#### Supabase

```typescript
import { vi } from 'vitest';

const mockSupabaseClient = {
  from: vi.fn((table: string) => {
    if (table === 'users') {
      return {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: mockUser, error: null })),
          })),
        })),
      };
    }
    // ... other tables
  }),
};

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => mockSupabaseClient),
}));
```

#### Auth

```typescript
import { vi } from 'vitest';
import { createMockUser } from '../helpers/auth-helpers';

vi.mock('@/lib/auth/server', () => ({
  requireAuth: vi.fn(() => Promise.resolve(createMockUser())),
  getSession: vi.fn(() => Promise.resolve(createMockSession())),
}));
```

### Creating Test Data

#### Factories

```typescript
// helpers/test-data.ts
export function createTestUser(overrides?: Partial<User>): User {
  return {
    id: generateUUID(),
    email: `test-${Date.now()}@example.com`,
    created_at: new Date().toISOString(),
    ...overrides,
  };
}

export function createTestOrganization(overrides?: Partial<Organization>): Organization {
  return {
    id: generateUUID(),
    name: `Test Org ${Date.now()}`,
    owner_id: generateUUID(),
    created_at: new Date().toISOString(),
    ...overrides,
  };
}
```

#### Fixtures

```typescript
// helpers/billing-fixtures.ts
export const mockOrgSubscription = {
  id: 'sub_test123',
  org_id: 'org_test123',
  stripe_subscription_id: 'sub_stripe123',
  status: 'active',
  current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
};

export const mockOrganization = (overrides?: Partial<Organization>) => ({
  id: 'org_test123',
  name: 'Test Organization',
  owner_id: 'user_test123',
  created_at: new Date().toISOString(),
  ...overrides,
});
```

### Best Practices

- **Use factories for dynamic data**: `createTestUser({ email: 'custom@example.com' })`
- **Use fixtures for static data**: `mockStripeCustomer` (complete Stripe object)
- **Match real schemas**: Test data should match actual database/API schemas
- **Avoid hardcoded dates**: Use `Date.now()` or relative dates
- **Make data realistic**: Use realistic email formats, UUIDs, etc.

---

## CI/CD Integration

### GitHub Actions

Tests run automatically in CI/CD pipelines:

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Run unit tests
        run: pnpm test
      
      - name: Run E2E tests
        run: pnpm --filter ./apps/web e2e
        env:
          PLAYWRIGHT_BASE_URL: http://localhost:3000
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./apps/web/coverage/lcov.info
```

### Test Execution in CI

- **Unit tests**: Run in parallel, fast feedback
- **Integration tests**: Run after unit tests pass
- **E2E tests**: Run last, can be slower
- **Coverage**: Uploaded as CI artifacts

### Pre-commit Hooks

Consider using pre-commit hooks to run tests:

```json
{
  "husky": {
    "hooks": {
      "pre-commit": "pnpm test:staged"
    }
  }
}
```

---

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

1. **Check for timing issues**: Use `await` properly, avoid `setTimeout`
2. **Verify mocks are synchronous**: Don't mix async/sync mocks
3. **Ensure no real network calls**: All external APIs should be mocked
4. **Check for race conditions**: Use proper async/await patterns

### Coverage Not Meeting Threshold

1. **Run coverage report**: `pnpm test:coverage`
2. **Open HTML report**: `open coverage/index.html`
3. **Identify uncovered lines**: Focus on error paths and edge cases
4. **Add tests for uncovered branches**: Especially error handling

### E2E Tests Failing

1. **Check server is running**: E2E tests need the dev server
2. **Verify test data cleanup**: Ensure `finally` blocks clean up
3. **Check browser compatibility**: Test in multiple browsers
4. **Review screenshots/videos**: Check `test-results/` directory

---

## Best Practices Summary

### DO ✅

- ✅ Clear mocks between tests (`vi.clearAllMocks()`)
- ✅ Use realistic test data (match schemas)
- ✅ Test both success and error paths
- ✅ Test authorization checks
- ✅ Keep tests fast (<30 seconds total)
- ✅ Make tests deterministic
- ✅ Document complex test setups
- ✅ Use Page Objects for E2E tests
- ✅ Clean up test data in `finally` blocks

### DON'T ❌

- ❌ Make real API calls
- ❌ Share state between tests
- ❌ Use hardcoded dates (use `Date.now()`)
- ❌ Skip error path testing
- ❌ Ignore flaky tests
- ❌ Test implementation details
- ❌ Use `waitForTimeout()` in E2E tests
- ❌ Hardcode test data (use factories)

---

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Library Best Practices](https://testing-library.com/docs/guiding-principles/)
- [Stripe Testing Guide](https://stripe.com/docs/testing)
- [Supabase Testing Guide](https://supabase.com/docs/guides/cli/local-development)

---

## Support

For questions about testing:

1. Check this documentation
2. Review existing test patterns in the codebase
3. Check test output for specific errors
4. Consult the team

---

## Maintenance

### Regular Tasks

- Review coverage reports monthly
- Update mocks when external APIs change
- Add tests for new features
- Refactor tests when patterns emerge
- Keep documentation up to date

### When to Update Tests

- After adding new features
- When external API versions change
- When database schema changes
- When bugs are found (add regression tests)
- When test patterns improve
