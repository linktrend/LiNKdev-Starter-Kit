'use server'

import { revalidatePath } from 'next/cache'

import { createClient, requireAuth } from '@/lib/auth/server'
import {
  onboardingStep2Schema,
  profileUpdateSchema,
  usernameSchema,
} from '@/lib/validation/profile'
import { routing } from '@/i18n/routing'
import type { Database } from '@/types/database.types'
import { createPersonalOrganization } from '@/app/actions/onboarding'

type UserUpdate = Database['public']['Tables']['users']['Update']

type FieldErrors = Record<string, string[]>

function resolveLocale(value?: FormDataEntryValue | null): string {
  if (value && typeof value === 'string') {
    return value
  }

  return routing.defaultLocale ?? 'en'
}

async function revalidateProfileViews(locale: string) {
  revalidatePath('/', 'layout')
  revalidatePath(`/${locale}/profile`)
  revalidatePath(`/${locale}/dashboard`)
  revalidatePath(`/${locale}/dashboard/profile`)
  revalidatePath(`/${locale}/settings/account`)
}

/**
 * Check if username is available
 */
export async function checkUsernameAvailability(username: string, options?: { excludeUserId?: string }) {
  const supabase = createClient()

  const validation = usernameSchema.safeParse(username)
  if (!validation.success) {
    return {
      available: false,
      error: validation.error.errors[0]?.message ?? 'Invalid username',
    }
  }

  const normalizedUsername = validation.data

  let query = supabase.from('users').select('id').eq('username', normalizedUsername)

  if (options?.excludeUserId) {
    query = query.neq('id', options.excludeUserId)
  }

  const { data, error } = await query.maybeSingle()

  if (error && error.code !== 'PGRST116') {
    console.error('Error checking username:', error)
    return {
      available: false,
      error: 'Error checking username availability',
    }
  }

  return {
    available: !data,
    error: null,
  }
}

/**
 * Complete onboarding step 2 (set username and basic profile)
 */
export async function completeOnboardingStep2(formData: FormData) {
  const user = await requireAuth()
  const supabase = createClient()
  const locale = resolveLocale(formData.get('locale'))

  const payload = {
    username: formData.get('username'),
    first_name: formData.get('first_name'),
    last_name: formData.get('last_name'),
    display_name: formData.get('display_name') || null,
  }

  const validation = onboardingStep2Schema.safeParse(payload)

  if (!validation.success) {
    return {
      error: validation.error.flatten().fieldErrors,
    }
  }

  const validated = validation.data

  const usernameCheck = await checkUsernameAvailability(validated.username, {
    excludeUserId: user.id,
  })
  if (!usernameCheck.available) {
    return {
      error: {
        username: [usernameCheck.error || 'Username is already taken'],
      } satisfies FieldErrors,
    }
  }

  const usersTable = supabase.from('users') as any

  // Update user profile with profile_completed flag
  const { error: updateError } = await usersTable
    .update({
      username: validated.username,
      first_name: validated.first_name,
      last_name: validated.last_name,
      display_name: validated.display_name,
      full_name: `${validated.first_name} ${validated.last_name}`.trim(),
      profile_completed: true,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)

  if (updateError) {
    console.error('Error updating profile:', updateError)
    return {
      error: {
        form: ['Failed to update profile. Please try again.'],
      } satisfies FieldErrors,
    }
  }

  // Create personal organization
  const orgResult = await createPersonalOrganization()

  if (orgResult.error) {
    return {
      error: {
        form: [orgResult.error],
      } satisfies FieldErrors,
    }
  }

  // Mark onboarding complete
  const { error: onboardingError } = await usersTable
    .update({
      onboarding_completed: true,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)

  if (onboardingError) {
    console.error('Error marking onboarding complete:', onboardingError)
    // Don't fail the request, just log the error
  }

  await revalidateProfileViews(locale)

  return {
    success: true,
    redirectTo: `/${locale}/dashboard`,
  }
}

/**
 * Update user profile
 */
export async function updateProfile(formData: FormData) {
  const user = await requireAuth()
  const supabase = createClient()
  const locale = resolveLocale(formData.get('locale'))
  const usersTable = supabase.from('users') as any

  const data: Record<string, unknown> = {}
  formData.forEach((value, key) => {
    if (key === 'education' || key === 'work_experience') {
      try {
        data[key] = value ? JSON.parse(value as string) : []
      } catch {
        data[key] = []
      }
      return
    }

    if (value === '' || value === null) {
      data[key] = null
      return
    }

    data[key] = value
  })

  const validation = profileUpdateSchema.safeParse(data)

  if (!validation.success) {
    return {
      error: validation.error.flatten().fieldErrors,
    }
  }

  const validated = validation.data

  if (validated.username && validated.username !== user.username) {
    const usernameCheck = await checkUsernameAvailability(validated.username, {
      excludeUserId: user.id,
    })

    if (!usernameCheck.available) {
      return {
        error: {
          username: [usernameCheck.error || 'Username is already taken'],
        } satisfies FieldErrors,
      }
    }
  }

  const updatePayload: UserUpdate = { ...validated }

  if (validated.first_name || validated.last_name) {
    const firstName = validated.first_name ?? user.first_name ?? ''
    const lastName = validated.last_name ?? user.last_name ?? ''
    updatePayload.full_name = `${firstName} ${lastName}`.trim()
  }

  const { error } = await usersTable
    .update({
      ...updatePayload,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)

  if (error) {
    console.error('Error updating profile:', error)
    return {
      error: {
        form: ['Failed to update profile. Please try again.'],
      } satisfies FieldErrors,
    }
  }

  await revalidateProfileViews(locale)

  return {
    success: true,
    message: 'Profile updated successfully',
  }
}

/**
 * Fetch the authenticated user's profile
 */
export async function getCurrentUserProfile() {
  const user = await requireAuth()
  return user
}

/**
 * Update avatar URL after upload completes
 */
export async function updateAvatarUrl(avatarUrl: string, locale?: string) {
  const user = await requireAuth()
  const supabase = createClient()
  const usersTable = supabase.from('users') as any

  const { error } = await usersTable
    .update({
      avatar_url: avatarUrl,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)

  if (error) {
    console.error('Error updating avatar:', error)
    return {
      error: 'Failed to update avatar',
    }
  }

  await revalidateProfileViews(locale ?? routing.defaultLocale ?? 'en')

  return {
    success: true,
  }
}
