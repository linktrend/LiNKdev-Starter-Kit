import { createServerClient } from '@supabase/ssr'
import createMiddleware from 'next-intl/middleware'
import { type NextRequest, NextResponse } from 'next/server'

import { routing } from './src/i18n/routing'

const intlMiddleware = createMiddleware(routing)

// Route configuration
const PROTECTED_ROUTES = ['/dashboard', '/org', '/console', '/settings', '/profile', '/organizations']
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
]
const AUTH_ONLY_ROUTES = ['/login', '/signup']

// Token refresh threshold: 5 minutes (300 seconds)
const TOKEN_REFRESH_THRESHOLD = 300

function stripLocale(pathname: string) {
  const segments = pathname.split('/').filter(Boolean)
  if (segments.length === 0) {
    return '/'
  }

  const [maybeLocale, ...rest] = segments
  if (routing.locales.includes(maybeLocale)) {
    return `/${rest.join('/')}` || '/'
  }

  return pathname
}

function resolveLocale(pathname: string) {
  const segments = pathname.split('/').filter(Boolean)
  const candidate = segments[0]
  return routing.locales.includes(candidate) ? candidate : routing.defaultLocale
}

function isProtectedRoute(path: string): boolean {
  return PROTECTED_ROUTES.some((route) => path.startsWith(route))
}

function isPublicRoute(path: string): boolean {
  return PUBLIC_ROUTES.some((route) => path === route || path.startsWith(`${route}/`))
}

function isAuthOnlyRoute(path: string): boolean {
  return AUTH_ONLY_ROUTES.some((route) => path === route)
}

export async function middleware(request: NextRequest) {
  const intlResponse = intlMiddleware(request)

  if (intlResponse && intlResponse.status !== 200) {
    return intlResponse
  }

  let response = intlResponse ??
    NextResponse.next({
      request: {
        headers: request.headers,
      },
    })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    return response
  }

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value
      },
      set(name: string, value: string, options: any) {
        request.cookies.set(name, value)
        response.cookies.set(name, value, options)
      },
      remove(name: string, options: any) {
        request.cookies.set(name, '', options)
        response.cookies.set(name, '', { ...options, maxAge: 0 })
      },
    },
  })

  const pathname = request.nextUrl.pathname
  const locale = resolveLocale(pathname)
  const pathWithoutLocale = stripLocale(pathname)

  // Get session (this automatically refreshes if needed)
  let {
    data: { session },
  } = await supabase.auth.getSession()

  // For protected routes, validate session with getUser() for better security
  const isProtected = isProtectedRoute(pathWithoutLocale)
  if (isProtected && session) {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      // Session is invalid, clear it
      console.error('Session validation failed:', userError)
      session = null
      await supabase.auth.signOut()
    }
  }

  // Token refresh logic - check if token expires within 5 minutes
  if (session?.expires_at) {
    const expiresAt = session.expires_at
    const now = Math.floor(Date.now() / 1000)
    const shouldRefresh = expiresAt - now < TOKEN_REFRESH_THRESHOLD

    if (shouldRefresh) {
      const { data, error } = await supabase.auth.refreshSession()
      
      if (error) {
        console.error('Token refresh failed:', error)
        // Clear session on refresh failure
        session = null
        await supabase.auth.signOut()
      } else if (data.session) {
        session = data.session
      }
    }
  }

  // Route protection logic
  const isPublic = isPublicRoute(pathWithoutLocale)
  const isAuthOnly = isAuthOnlyRoute(pathWithoutLocale)

  // Redirect authenticated users away from auth-only routes (login/signup)
  if (isAuthOnly && session) {
    const destination = new URL(`/${locale}/dashboard`, request.url)
    return NextResponse.redirect(destination)
  }

  // Protect routes that require authentication
  if (isProtected && !session) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = `/${locale}/login`
    // Preserve original destination for redirect after login
    redirectUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Check onboarding completion for authenticated users on protected routes
  if (session && isProtected && pathWithoutLocale !== '/onboarding') {
    const { data: user } = await supabase
      .from('users')
      .select('onboarding_completed, account_type')
      .eq('id', session.user.id)
      .single()

    if (user) {
      // Check onboarding completion
      if (user.onboarding_completed === false) {
        const destination = new URL(`/${locale}/onboarding`, request.url)
        return NextResponse.redirect(destination)
      }

      // Console route admin check
      if (pathWithoutLocale.startsWith('/console')) {
        if (!['super_admin', 'admin'].includes(user.account_type)) {
          const destination = new URL(`/${locale}/dashboard`, request.url)
          return NextResponse.redirect(destination)
        }
      }
    }
  }

  response.headers.set('x-current-path', pathname)
  return response
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
