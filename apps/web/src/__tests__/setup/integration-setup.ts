import { beforeEach, afterEach, vi } from 'vitest';
import { createInMemoryDB } from '../helpers/database-helpers';
import { EmailCapture, SMSCapture, mockSupabaseAuth } from '../helpers/auth-helpers';

/**
 * Global test state for integration tests
 */
export const testState = {
  database: createInMemoryDB(),
  emailCapture: new EmailCapture(),
  smsCapture: new SMSCapture(),
};

let cachedSupabaseMock: ReturnType<typeof createMock> | null = null;

function createMock() {
  const auth = mockSupabaseAuth({
    emailCapture: testState.emailCapture,
    smsCapture: testState.smsCapture,
    database: testState.database,
  });

  return {
    auth,
    from: (tableName: string) => testState.database.table(tableName),
  };
}

/**
 * Setup function to be called in beforeEach
 */
export function setupIntegrationTest() {
  // Clear all test state
  testState.database.clear();
  testState.emailCapture.clear();
  testState.smsCapture.clear();

  // Reset all mocks
  vi.clearAllMocks();

  // Set up environment variables for tests
  process.env.NEXT_PUBLIC_SITE_URL = 'http://localhost:3000';
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

  cachedSupabaseMock = null;
}

/**
 * Teardown function to be called in afterEach
 */
export function teardownIntegrationTest() {
  // Clear all test state
  testState.database.clear();
  testState.emailCapture.clear();
  testState.smsCapture.clear();

  // Restore all mocks
  vi.restoreAllMocks();
}

/**
 * Create a complete mock Supabase client for integration tests
 */
export function createIntegrationSupabaseMock() {
  if (!cachedSupabaseMock) {
    cachedSupabaseMock = createMock();
  }
  return cachedSupabaseMock;
}

/**
 * Mock Next.js router for integration tests
 */
export function mockNextRouter(overrides: any = {}) {
  const router = {
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    pathname: '/',
    query: {},
    asPath: '/',
    route: '/',
    ...overrides,
  };

  vi.mock('next/navigation', () => ({
    useRouter: () => router,
    usePathname: () => router.pathname,
    useSearchParams: () => new URLSearchParams(),
    redirect: vi.fn((url: string) => {
      throw new Error(`NEXT_REDIRECT: ${url}`);
    }),
  }));

  return router;
}

/**
 * Mock Next.js cache functions
 */
export function mockNextCache() {
  vi.mock('next/cache', () => ({
    revalidatePath: vi.fn(),
    revalidateTag: vi.fn(),
  }));
}

/**
 * Helper to extract redirect URL from Next.js redirect error
 */
export function extractRedirectUrl(error: any): string | null {
  if (error?.message?.startsWith('NEXT_REDIRECT:')) {
    return error.message.replace('NEXT_REDIRECT:', '').trim();
  }
  return null;
}

/**
 * Helper to simulate a delay (for testing async operations)
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Helper to wait for a condition to be true
 */
export async function waitFor(
  condition: () => boolean | Promise<boolean>,
  options: { timeout?: number; interval?: number } = {}
): Promise<void> {
  const { timeout = 5000, interval = 100 } = options;
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    const result = await condition();
    if (result) {
      return;
    }
    await delay(interval);
  }

  throw new Error(`Timeout waiting for condition after ${timeout}ms`);
}

/**
 * Mock console methods to suppress expected errors in tests
 */
export function suppressConsoleErrors() {
  const originalError = console.error;
  const originalWarn = console.warn;

  beforeEach(() => {
    console.error = vi.fn((message, ...args) => {
      // Suppress specific expected errors
      if (
        typeof message === 'string' &&
        (message.includes('NEXT_REDIRECT') ||
          message.includes('Error creating user record') ||
          message.includes('OAuth callback error'))
      ) {
        return;
      }
      originalError(message, ...args);
    });

    console.warn = vi.fn((message, ...args) => {
      // Suppress specific expected warnings
      if (typeof message === 'string' && message.includes('ReactDOMTestUtils.act')) {
        return;
      }
      originalWarn(message, ...args);
    });
  });

  afterEach(() => {
    console.error = originalError;
    console.warn = originalWarn;
  });
}
