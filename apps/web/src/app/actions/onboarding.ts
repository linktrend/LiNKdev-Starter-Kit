'use server'

import { createClient, requireAuth } from '@/lib/auth/server'
import { generateUniqueSlug } from '@/utils/onboarding'

/**
 * Create personal organization for user after onboarding Step 2
 */
export async function createPersonalOrganization() {
  const user = await requireAuth()
  const supabase = createClient()
  
  // Check if personal org already exists
  const { data: existingOrg } = await supabase
    .from('organizations')
    .select('id')
    .eq('owner_id', user.id)
    .eq('is_personal', true)
    .maybeSingle()
  
  if (existingOrg) {
    return { success: true, organization: existingOrg }
  }
  
  // Generate unique slug
  const slug = await generateUniqueSlug(user.username || user.id)
  
  // Create organization
  const { data: org, error: orgError } = await supabase
    .from('organizations')
    .insert({
      name: `${user.full_name || user.username || 'User'}'s Workspace`,
      owner_id: user.id,
      is_personal: true,
      org_type: 'personal',
      slug,
    })
    .select()
    .single()
  
  if (orgError) {
    console.error('Error creating organization:', orgError)
    return { error: 'Failed to create organization' }
  }
  
  // Add user as owner in organization_members
  const { error: memberError } = await supabase
    .from('organization_members')
    .insert({
      org_id: org.id,
      user_id: user.id,
      role: 'owner',
    })
  
  if (memberError) {
    console.error('Error adding user as organization owner:', memberError)
    // Rollback org creation
    await supabase.from('organizations').delete().eq('id', org.id)
    return { error: 'Failed to add user as organization owner' }
  }
  
  // Create free subscription for personal org
  const { error: subscriptionError } = await supabase
    .from('org_subscriptions')
    .insert({
      org_id: org.id,
      plan_name: 'free',
      status: 'active',
      billing_interval: 'monthly',
      seats: 1,
      current_period_start: new Date().toISOString(),
      current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
    })
  
  if (subscriptionError) {
    console.error('Error creating subscription:', subscriptionError)
    // Rollback org and membership
    await supabase.from('organization_members').delete().eq('org_id', org.id).eq('user_id', user.id)
    await supabase.from('organizations').delete().eq('id', org.id)
    return { error: 'Failed to create organization subscription' }
  }
  
  return { success: true, organization: org }
}
