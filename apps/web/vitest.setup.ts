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

vi.mock('next-intl/server', () => ({
  getTranslations: vi.fn(async () => (key: string) => key),
  getLocale: vi.fn(async () => 'en'),
  getMessages: vi.fn(async () => ({})),
  unstable_setRequestLocale: vi.fn(),
}));

vi.mock('next/server', () => {
  class NextRequest {
    url: URL;
    nextUrl: URL;
    cookies = {
      get: vi.fn(),
      set: vi.fn(),
      delete: vi.fn(),
    };

    constructor(url: URL | string) {
      this.url = new URL(url.toString());
      this.nextUrl = this.url;
    }
  }

  const NextResponse = {
    next: vi.fn((init?: any) => init ?? {}),
    redirect: vi.fn((url: string | URL, status?: number) => {
      const urlString = url.toString();
      const headers = new Headers();
      headers.set('location', urlString);
      return {
        url: urlString,
        status: status ?? 307,
        headers,
      };
    }),
    json: vi.fn((data: any, init?: any) => ({ ...init, body: data })),
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

// Mock environment variables for tests
process.env.NEXT_PUBLIC_SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
process.env.NEXT_PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://test.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'test-anon-key';
process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_mock';
process.env.STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || 'sk_test_mock';
process.env.STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_test_mock';
process.env.STRIPE_PRO_MONTHLY_PRICE_ID = process.env.STRIPE_PRO_MONTHLY_PRICE_ID || 'price_test_pro_monthly';
process.env.STRIPE_PRO_YEARLY_PRICE_ID = process.env.STRIPE_PRO_YEARLY_PRICE_ID || 'price_test_pro_yearly';
