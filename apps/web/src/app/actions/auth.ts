'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

import { createClient } from '@/lib/auth/server'
import { logUsage } from '@/lib/usage/server'
import { routing } from '@/i18n/routing'

type FormErrors = Record<string, string[]>

export type AuthFormState = {
  error?: FormErrors
  success?: boolean
  message?: string
}

const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  fullName: z.string().min(2, 'Full name is required'),
})

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

const resetPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
})

const updatePasswordSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

type SupportedLocale = (typeof routing)['locales'][number]

const supportedLocales = routing.locales as ReadonlyArray<SupportedLocale>
const defaultLocale = (routing.defaultLocale || 'en') as SupportedLocale

function resolveLocale(value?: FormData | FormDataEntryValue | null): SupportedLocale {
  if (value instanceof FormData) {
    return resolveLocale(value.get('locale'))
  }

  const raw =
    typeof value === 'string' ? value.toLowerCase() : undefined

  if (raw) {
    const match = supportedLocales.find((locale) => locale === raw)
    if (match) {
      return match
    }
  }

  return defaultLocale
}

function getSiteUrl() {
  const envUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '')

  return envUrl?.replace(/\/$/, '') || 'http://localhost:3000'
}

export async function signup(_: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const supabase = createClient()
  const locale = resolveLocale(formData)

  const validated = signupSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
    fullName: formData.get('fullName'),
  })

  if (!validated.success) {
    return {
      error: validated.error.flatten().fieldErrors,
    } satisfies AuthFormState
  }

  const { email, password, fullName } = validated.data

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: `${getSiteUrl()}/auth/callback`,
    },
  })

  if (error) {
    return {
      error: { form: [error.message] },
    } satisfies AuthFormState
  }

  revalidatePath('/', 'layout')
  redirect(`/${locale}/onboarding`)
  return {}
}

export async function login(_: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const supabase = createClient()
  const locale = resolveLocale(formData)

  const validated = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!validated.success) {
    return {
      error: validated.error.flatten().fieldErrors,
    } satisfies AuthFormState
  }

  const { email, password } = validated.data
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return {
      error: { form: [error.message] },
    } satisfies AuthFormState
  }

  if (data?.user) {
    logUsage({
      userId: data.user.id,
      eventType: 'user_active',
      metadata: { method: 'password' },
    }).catch(() => {
      // best effort
    })
  }

  revalidatePath('/', 'layout')
  redirect(`/${locale}/dashboard`)
  return {}
}

export async function logout(formData?: FormData) {
  const supabase = createClient()
  await supabase.auth.signOut()

  const locale = resolveLocale(formData?.get('locale'))

  revalidatePath('/', 'layout')
  redirect(`/${locale}/login`)
}

export async function requestPasswordReset(
  _: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const supabase = createClient()

  const validated = resetPasswordSchema.safeParse({
    email: formData.get('email'),
  })

  if (!validated.success) {
    return {
      error: validated.error.flatten().fieldErrors,
    } satisfies AuthFormState
  }

  const { email } = validated.data
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${getSiteUrl()}/auth/reset-password`,
  })

  if (error) {
    return {
      error: { form: [error.message] },
    } satisfies AuthFormState
  }

  return {
    success: true,
    message: 'Password reset email sent. Please check your inbox.',
  } satisfies AuthFormState
}

export async function updatePassword(
  _: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const supabase = createClient()

  const validated = updatePasswordSchema.safeParse({
    password: formData.get('password'),
  })

  if (!validated.success) {
    return {
      error: validated.error.flatten().fieldErrors,
    } satisfies AuthFormState
  }

  const { password } = validated.data
  const { error } = await supabase.auth.updateUser({ password })

  if (error) {
    return {
      error: { form: [error.message] },
    } satisfies AuthFormState
  }

  return {
    success: true,
    message: 'Password updated successfully.',
  } satisfies AuthFormState
}
