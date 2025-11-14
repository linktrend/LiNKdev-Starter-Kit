import { createServerClient } from '@supabase/ssr'
import createMiddleware from 'next-intl/middleware'
import { type NextRequest, NextResponse } from 'next/server'

import { routing } from './src/i18n/routing'

const intlMiddleware = createMiddleware(routing)

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

  const {
    data: { session },
  } = await supabase.auth.getSession()

  const pathname = request.nextUrl.pathname
  const locale = resolveLocale(pathname)
  const pathWithoutLocale = stripLocale(pathname)
  const isConsoleRoute = pathWithoutLocale.startsWith('/console')
  const isConsoleLogin = pathWithoutLocale.startsWith('/console/login')

  if (isConsoleRoute && !isConsoleLogin) {
    if (!session) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = `/${locale}/login`
      redirectUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(redirectUrl)
    }

    const { data: user } = await supabase
      .from('users')
      .select('account_type')
      .eq('id', session.user.id)
      .single()

    if (!user || !['super_admin', 'admin'].includes(user.account_type)) {
      const destination = new URL(`/${locale}/dashboard`, request.url)
      return NextResponse.redirect(destination)
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
