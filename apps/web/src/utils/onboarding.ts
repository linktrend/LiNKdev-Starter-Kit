import { createClient } from '@/lib/auth/server'
import { generateOrgSlug as generateOrgSlugClient } from './onboarding-client';

// Re-export client-safe utilities
export { generateUsername, checkUsernameAvailability, generateOrgSlug } from './onboarding-client';

/**
 * Generate unique organization slug
 */
export async function generateUniqueSlug(baseUsername: string): Promise<string> {
  const supabase = createClient()
  let slug = generateOrgSlugClient(baseUsername)
  let counter = 1
  let hasConflict = true
  
  while (hasConflict) {
    const { data } = await supabase
      .from('organizations')
      .select('id')
      .eq('slug', slug)
      .maybeSingle()
    
    hasConflict = Boolean(data)
    if (!hasConflict) {
      return slug
    }
    
    slug = `${generateOrgSlugClient(baseUsername)}-${counter}`
    counter++
  }

  return slug
}

