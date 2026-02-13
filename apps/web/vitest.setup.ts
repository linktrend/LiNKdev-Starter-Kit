import React from 'react';

// Mock React's cache function for server components
vi.mock('react', async () => {
  const actual = await vi.importActual('react');
  return {
    ...actual,
    cache: (fn: any) => fn,
  };
});

// Avoid real network in tests
vi.stubGlobal("fetch", vi.fn(async () => ({ ok: true, json: async () => ({}) })));

// Suppress ReactDOMTestUtils.act deprecation warnings
const originalWarn = console.warn;
console.warn = (...args) => {
  const message = args[0];
  if (typeof message === 'string') {
    if (message.includes('ReactDOMTestUtils.act is deprecated')) return;
    if (message.includes('Not implemented: HTMLFormElement.prototype.requestSubmit')) return;
  }
  originalWarn(...args);
};

// Export mock functions for cache operations
export const mockRevalidatePath = vi.fn();
export const mockRevalidateTag = vi.fn();
export const mockUnstableCache = vi.fn((fn: any) => fn);

// Mock Next.js runtime helpers for Vitest
vi.mock('next/cache', () => ({
  revalidatePath: mockRevalidatePath,
  revalidateTag: mockRevalidateTag,
  unstable_noStore: vi.fn(),
  cache: (fn: any) => fn,
  unstable_cache: mockUnstableCache,
}));

vi.mock('next/headers', () => ({
  cookies: () => ({
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
  }),
  headers: () => new Headers(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
  redirect: vi.fn(),
  notFound: vi.fn(),
}));

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => 'en',
  useMessages: () => ({}),
  NextIntlClientProvider: ({ children }: { children: React.ReactNode }) => children,
}));

vi.mock('next-intl/navigation', () => ({
  createNavigation: () => ({
    Link: ({ href, children }: { href: string; children: React.ReactNode }) =>
      React.createElement('a', { href }, children),
    redirect: vi.fn(),
    usePathname: () => '/',
    useRouter: () => ({
      push: vi.fn(),
      replace: vi.fn(),
      prefetch: vi.fn(),
      back: vi.fn(),
    }),
  }),
}));

vi.mock('next-intl/server', () => ({
  getTranslations: vi.fn(async () => (key: string) => key),
  getLocale: vi.fn(async () => 'en'),
  getMessages: vi.fn(async () => ({})),
  unstable_setRequestLocale: vi.fn(),
}));

vi.mock('next/server', () => {
  type CookieValue = { value: string };

  function createCookieStore() {
    const store = new Map<string, string>();
    return {
      get: vi.fn((name: string): CookieValue | undefined => {
        const v = store.get(name);
        return v === undefined ? undefined : { value: v };
      }),
      set: vi.fn((name: string, value: string) => {
        store.set(name, value);
      }),
      delete: vi.fn((name: string) => {
        store.delete(name);
      }),
    };
  }

  function createMockResponse(init?: { status?: number; headers?: HeadersInit }) {
    const headers = new Headers(init?.headers);
    const cookies = createCookieStore();

    return {
      status: init?.status ?? 200,
      headers,
      cookies,
      // For convenience in tests that treat this like a fetch Response.
      json: vi.fn(async () => ({})),
      text: vi.fn(async () => ''),
    };
  }

  class NextRequest {
    url: string;
    nextUrl: URL & { clone: () => URL };
    headers: Headers;
    method: string;
    cookies = createCookieStore();
    private _bodyText: string | null;

    constructor(input: URL | string, init?: any) {
      const url = new URL(input.toString());
      this.url = url.toString();
      this.headers = new Headers(init?.headers);
      this.method = init?.method ?? 'GET';
      this._bodyText = typeof init?.body === 'string' ? init.body : null;

      const nextUrl = new URL(this.url) as URL & { clone: () => URL };
      nextUrl.clone = () => new URL(nextUrl.toString());
      this.nextUrl = nextUrl;
    }

    async json() {
      if (!this._bodyText) return null;
      return JSON.parse(this._bodyText);
    }

    async text() {
      return this._bodyText ?? '';
    }
  }

  const NextResponse = {
    next: vi.fn((init?: any) => {
      // next-intl middleware expects status 200 for pass-through.
      const res = createMockResponse({ status: 200 });
      // Preserve requested headers if provided.
      if (init?.request?.headers) {
        for (const [k, v] of new Headers(init.request.headers)) {
          res.headers.set(k, v);
        }
      }
      return res;
    }),
    redirect: vi.fn((url: string | URL, status?: number) => {
      const res = createMockResponse({ status: status ?? 307 });
      res.headers.set('location', url.toString());
      return res;
    }),
    json: vi.fn((data: any, init?: any) => {
      const res = createMockResponse({ status: init?.status ?? 200, headers: init?.headers });
      if (!res.headers.has('Content-Type')) {
        res.headers.set('Content-Type', 'application/json');
      }
      res.json = vi.fn(async () => data);
      return res;
    }),
  };

  return { NextRequest, NextResponse };
});

// Mock window properties for tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Some tests rely on localStorage but certain environments/mocks can clobber it.
if (typeof (globalThis as any).localStorage === 'undefined' || typeof (globalThis as any).localStorage?.clear !== 'function') {
  const store = new Map<string, string>();
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => (store.has(key) ? store.get(key)! : null),
    setItem: (key: string, value: string) => {
      store.set(key, String(value));
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
    clear: () => {
      store.clear();
    },
    key: (index: number) => Array.from(store.keys())[index] ?? null,
    get length() {
      return store.size;
    },
  });
}

// Mock environment variables for tests
process.env.NEXT_PUBLIC_SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
process.env.NEXT_PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://test.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'test-anon-key';
process.env.SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'test-service-role-key';
process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_mock';
process.env.STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || 'sk_test_mock';
process.env.STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_test_mock';
process.env.STRIPE_PRICE_PRO_MONTHLY = process.env.STRIPE_PRICE_PRO_MONTHLY || 'price_test_pro_monthly';
process.env.STRIPE_PRICE_PRO_ANNUAL = process.env.STRIPE_PRICE_PRO_ANNUAL || 'price_test_pro_annual';
process.env.STRIPE_PRICE_BUSINESS_MONTHLY = process.env.STRIPE_PRICE_BUSINESS_MONTHLY || 'price_test_business_monthly';
process.env.STRIPE_PRICE_BUSINESS_ANNUAL = process.env.STRIPE_PRICE_BUSINESS_ANNUAL || 'price_test_business_annual';
