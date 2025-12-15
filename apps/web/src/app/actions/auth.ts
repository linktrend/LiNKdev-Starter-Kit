'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

import { createClient } from '@/lib/auth/server'
import { logUsage } from '@/lib/usage/server'
import { routing } from '@/i18n/routing'
import { isValidEmail, isValidE164Phone } from '@/lib/auth/validation'

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
  const rememberMe = formData.get('rememberMe') === 'on'

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
    options: {
      data: {
        remember_me: rememberMe,
      },
    },
  })

  if (error) {
    return {
      error: { form: [error.message] },
    } satisfies AuthFormState
  }

  if (data?.user) {
    // Check onboarding status
    const { data: userProfile } = await supabase
      .from('users')
      .select('onboarding_completed, profile_completed')
      .eq('id', data.user.id)
      .single()

    logUsage({
      userId: data.user.id,
      eventType: 'user_active',
      metadata: { method: 'password', remember_me: rememberMe },
    }).catch(() => {
      // best effort
    })

    revalidatePath('/', 'layout')

    // Redirect to onboarding if not completed
    if (userProfile && !userProfile.onboarding_completed) {
      redirect(`/${locale}/onboarding?step=2`)
    }

    redirect(`/${locale}/dashboard`)
  }

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

export async function sendMagicLink(
  _: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const supabase = createClient()
  const locale = resolveLocale(formData)

  const email = formData.get('email') as string

  if (!email || !isValidEmail(email)) {
    return {
      error: { email: ['Invalid email address'] },
    } satisfies AuthFormState
  }

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${getSiteUrl()}/auth/callback`,
    },
  })

  if (error) {
    return {
      error: { form: [error.message] },
    } satisfies AuthFormState
  }

  return {
    success: true,
    message: 'Check your email for the magic link.',
  } satisfies AuthFormState
}

export async function sendPhoneOTP(
  _: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const supabase = createClient()

  const phone = formData.get('phone') as string

  if (!phone || !isValidE164Phone(phone)) {
    return {
      error: { phone: ['Invalid phone number format'] },
    } satisfies AuthFormState
  }

  const { error } = await supabase.auth.signInWithOtp({ phone })

  if (error) {
    return {
      error: { form: [error.message] },
    } satisfies AuthFormState
  }

  return {
    success: true,
    message: 'OTP sent to your phone.',
  } satisfies AuthFormState
}

export async function verifyPhoneOTP(
  phone: string,
  token: string
): Promise<AuthFormState> {
  const supabase = createClient()

  const { error } = await supabase.auth.verifyOtp({
    phone,
    token,
    type: 'sms',
  })

  if (error) {
    return {
      error: { form: [error.message] },
    } satisfies AuthFormState
  }

  return { success: true } satisfies AuthFormState
}
