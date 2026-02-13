import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

import type { Database } from '@/types/database.types'

type UserRow = Database['public']['Tables']['users']['Row']
type Role = 'super_admin' | 'admin' | 'user'
type TypedSupabaseClient = ReturnType<typeof createServerClient<Database>>

function getSupabaseEnv() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables')
  }

  return { supabaseUrl, supabaseAnonKey }
}

export function createClient(): TypedSupabaseClient {
  const cookieStore = cookies()
  const { supabaseUrl, supabaseAnonKey } = getSupabaseEnv()

  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options?: any) {
        cookieStore.set(name, value, options)
      },
      remove(name: string, options?: any) {
        cookieStore.delete({ name, ...options })
      },
    },
  })
}

export async function getSession() {
  const supabase = createClient()
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession()

  if (error) {
    console.error('Error fetching session:', error)
    return null
  }

  return session
}

export async function getUser() {
  const supabase = createClient()
  const session = await getSession()

  if (!session?.user) {
    return null
  }

  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', session.user.id)
    .single()

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching user:', error)
  }

  if (!user) {
    return {
      id: session.user.id,
      username: null,
      display_name: null,
      personal_title: null,
      first_name: null,
      middle_name: null,
      last_name: null,
      full_name: session.user.user_metadata?.full_name ?? null,
      avatar_url: session.user.user_metadata?.avatar_url ?? null,
      email: session.user.email ?? null,
      phone_country_code: null,
      phone_number: null,
      personal_apt_suite: null,
      personal_street_address_1: null,
      personal_street_address_2: null,
      personal_city: null,
      personal_state: null,
      personal_postal_code: null,
      personal_country: null,
      bio: null,
      education: [],
      work_experience: [],
      preferences: null,
      business_position: null,
      business_company: null,
      business_apt_suite: null,
      business_street_address_1: null,
      business_street_address_2: null,
      business_city: null,
      business_state: null,
      business_postal_code: null,
      business_country: null,
      billing_address: null,
      payment_method: null,
      account_type: 'user',
      profile_completed: null,
      onboarding_completed: null,
      created_at: session.user.created_at ?? new Date().toISOString(),
      updated_at: null,
    } satisfies UserRow
  }

  const userRecord = user as UserRow

  return {
    ...userRecord,
    email: userRecord.email ?? session.user.email ?? '',
  }
}

export async function requireAuth() {
  const user = await getUser()
  if (!user) {
    throw new Error('Unauthorized')
  }
  return user
}

export async function requireAdmin() {
  const user = await requireAuth()
  if (!['super_admin', 'admin'].includes(user.account_type || '')) {
    throw new Error('Forbidden: Admin access required')
  }
  return user
}

export async function requireSuperAdmin() {
  const user = await requireAuth()
  if (user.account_type !== 'super_admin') {
    throw new Error('Forbidden: Super admin access required')
  }
  return user
}

export async function checkRole(requiredRole: Role) {
  const user = await getUser()
  if (!user) return false

  if (requiredRole === 'super_admin') {
    return user.account_type === 'super_admin'
  }

  if (requiredRole === 'admin') {
    return ['super_admin', 'admin'].includes(user.account_type || '')
  }

  return true
}
