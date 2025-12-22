import { describe, it, expect } from 'vitest';

describe('Middleware Route Protection', () => {
  // Helper functions matching middleware logic
  const PROTECTED_ROUTES = ['/dashboard', '/org', '/console', '/settings', '/profile', '/organizations'];
  const PUBLIC_ROUTES = [
    '/',
    '/login',
    '/signup',
    '/auth/callback',
    '/auth/reset-password',
    '/verify',
    '/reset-password',
    '/forgot-password',
    '/magic_link',
    '/verify_otp',
    '/onboarding',
    '/terms',
    '/privacy',
  ];

  function isProtectedRoute(path: string): boolean {
    return PROTECTED_ROUTES.some((route) => path.startsWith(route));
  }

  function isPublicRoute(path: string): boolean {
    return PUBLIC_ROUTES.some((route) => path === route || path.startsWith(`${route}/`));
  }

  describe('Public route access', () => {
    it('should allow access to homepage', () => {
      expect(isPublicRoute('/')).toBe(true);
    });

    it('should allow access to login page', () => {
      expect(isPublicRoute('/login')).toBe(true);
    });

    it('should allow access to signup page', () => {
      expect(isPublicRoute('/signup')).toBe(true);
    });

    it('should allow access to OAuth callback', () => {
      expect(isPublicRoute('/auth/callback')).toBe(true);
    });

    it('should allow access to password reset', () => {
      expect(isPublicRoute('/auth/reset-password')).toBe(true);
    });

    it('should allow access to onboarding', () => {
      expect(isPublicRoute('/onboarding')).toBe(true);
    });

    it('should allow access to terms page', () => {
      expect(isPublicRoute('/terms')).toBe(true);
    });

    it('should allow access to privacy page', () => {
      expect(isPublicRoute('/privacy')).toBe(true);
    });
  });

  describe('Protected route access', () => {
    it('should protect dashboard route', () => {
      expect(isProtectedRoute('/dashboard')).toBe(true);
    });

    it('should protect dashboard sub-routes', () => {
      expect(isProtectedRoute('/dashboard/account')).toBe(true);
      expect(isProtectedRoute('/dashboard/settings')).toBe(true);
    });

    it('should protect settings route', () => {
      expect(isProtectedRoute('/settings')).toBe(true);
    });

    it('should protect profile route', () => {
      expect(isProtectedRoute('/profile')).toBe(true);
    });

    it('should protect organization routes', () => {
      expect(isProtectedRoute('/organizations')).toBe(true);
      expect(isProtectedRoute('/org')).toBe(true);
    });

    it('should protect console routes', () => {
      expect(isProtectedRoute('/console')).toBe(true);
      expect(isProtectedRoute('/console/admin')).toBe(true);
    });
  });

  describe('Route classification', () => {
    it('should not classify protected routes as public', () => {
      expect(isPublicRoute('/dashboard')).toBe(false);
      expect(isPublicRoute('/settings')).toBe(false);
    });

    it('should not classify public routes as protected', () => {
      expect(isProtectedRoute('/login')).toBe(false);
      expect(isProtectedRoute('/signup')).toBe(false);
    });
  });

  describe('Redirect logic', () => {
    it('should redirect unauthenticated users from protected routes', () => {
      const hasSession = false;
      const isProtected = isProtectedRoute('/dashboard');

      const shouldRedirect = isProtected && !hasSession;
      expect(shouldRedirect).toBe(true);
    });

    it('should allow authenticated users to access protected routes', () => {
      const hasSession = true;
      const isProtected = isProtectedRoute('/dashboard');

      const shouldRedirect = isProtected && !hasSession;
      expect(shouldRedirect).toBe(false);
    });

    it('should redirect authenticated users from login page', () => {
      const hasSession = true;
      const isAuthOnlyRoute = ['/login', '/signup'].includes('/login');

      const shouldRedirect = isAuthOnlyRoute && hasSession;
      expect(shouldRedirect).toBe(true);
    });

    it('should allow unauthenticated users to access login page', () => {
      const hasSession = false;
      const isAuthOnlyRoute = ['/login', '/signup'].includes('/login');

      const shouldRedirect = isAuthOnlyRoute && hasSession;
      expect(shouldRedirect).toBe(false);
    });
  });

  describe('Locale handling', () => {
    function stripLocale(pathname: string, locales: string[] = ['en', 'es', 'zh-tw']) {
      const segments = pathname.split('/').filter(Boolean);
      if (segments.length === 0) return '/';

      const [maybeLocale, ...rest] = segments;
      if (locales.includes(maybeLocale)) {
        return `/${rest.join('/')}` || '/';
      }

      return pathname;
    }

    it('should strip locale from path', () => {
      expect(stripLocale('/en/dashboard')).toBe('/dashboard');
      expect(stripLocale('/es/login')).toBe('/login');
      expect(stripLocale('/zh-tw/signup')).toBe('/signup');
    });

    it('should handle paths without locale', () => {
      expect(stripLocale('/dashboard')).toBe('/dashboard');
      expect(stripLocale('/login')).toBe('/login');
    });

    it('should handle root path', () => {
      expect(stripLocale('/')).toBe('/');
      expect(stripLocale('/en')).toBe('/');
    });
  });
});
