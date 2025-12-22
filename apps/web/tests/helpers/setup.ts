import crypto from 'crypto';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { randomOrgSlug } from './test-data';
import type { Database } from '../../src/types/database.types';

type DB = SupabaseClient<Database>;

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.PLAYWRIGHT_BASE_URL ||
  'http://localhost:3000';

function assertEnv() {
  if (!SUPABASE_URL) {
    throw new Error('SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL is required for E2E helpers.');
  }
  if (!SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for E2E helpers.');
  }
  if (!ANON_KEY) {
    throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is required for E2E helpers.');
  }
}

assertEnv();

const adminClient: DB = createClient<Database>(SUPABASE_URL!, SERVICE_ROLE_KEY!, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const anonClient: DB = createClient<Database>(SUPABASE_URL!, ANON_KEY!, {
  auth: { autoRefreshToken: false, persistSession: false },
});

export function getAdminClient() {
  return adminClient;
}

export function getAnonClient() {
  return anonClient;
}

export async function createTestUser(options?: {
  email?: string;
  password?: string;
  fullName?: string;
}) {
  const email =
    options?.email ?? `e2e-${Date.now()}-${Math.floor(Math.random() * 1_000_000)}@example.com`;
  const password = options?.password ?? `P@ssw0rd-${Math.random().toString(36).slice(2, 8)}!`;
  const fullName = options?.fullName ?? 'E2E User';

  const { data, error } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });

  if (error || !data.user) {
    throw error ?? new Error('Failed to create test user');
  }

  const user = data.user;

  // Ensure profile row exists
  await adminClient.from('users').upsert({
    id: user.id,
    email,
    full_name: fullName,
    account_type: 'user',
    onboarding_completed: false,
    profile_completed: false,
    created_at: new Date().toISOString(),
  });

  return { id: user.id, email, password };
}

export async function findUserByEmail(email: string) {
  const { data, error } = await adminClient.auth.admin.listUsers({ page: 1, perPage: 100 });
  if (error) throw error;
  return data.users.find((u) => u.email === email);
}

export async function deleteUserCascade(userId: string) {
  // Remove org memberships and orgs
  await adminClient.from('organization_members').delete().eq('user_id', userId);
  await adminClient.from('organizations').delete().eq('owner_id', userId);
  await adminClient.from('invites').delete().eq('created_by', userId);
  await adminClient.from('users').delete().eq('id', userId);
  await adminClient.auth.admin.deleteUser(userId);
}

export async function generateMagicLink(email: string, type: 'magiclink' | 'signup' = 'magiclink') {
  const { data, error } = await adminClient.auth.admin.generateLink({
    type,
    email,
    options: {
      emailRedirectTo: `${SITE_URL}/auth/callback`,
    },
  } as any);

  if (error) throw error;

  return (
    data?.properties?.action_link ||
    (data as { action_link?: string })?.action_link ||
    (data as { data?: { action_link?: string } })?.data?.action_link ||
    ''
  );
}

export async function generatePasswordResetLink(email: string) {
  const { data, error } = await adminClient.auth.admin.generateLink({
    type: 'recovery',
    email,
    options: { redirectTo: `${SITE_URL}/auth/reset-password` },
  } as any);

  if (error) throw error;
  return (
    data?.properties?.action_link ||
    (data as { action_link?: string })?.action_link ||
    (data as { data?: { action_link?: string } })?.data?.action_link ||
    ''
  );
}

export async function createOrganizationForUser(params: {
  ownerId: string;
  name: string;
  slug?: string;
  orgType?: Database['public']['Enums']['org_type'];
}) {
  const slug = params.slug ?? randomOrgSlug('org');

  const { data, error } = await adminClient
    .from('organizations')
    .insert({
      owner_id: params.ownerId,
      name: params.name,
      slug,
      org_type: params.orgType ?? 'business',
      is_personal: false,
    })
    .select('*')
    .single();

  if (error || !data) {
    throw error ?? new Error('Failed to create organization');
  }

  await adminClient.from('organization_members').upsert({
    org_id: data.id,
    user_id: params.ownerId,
    role: 'owner',
  });

  return data;
}

export async function addMemberToOrg(orgId: string, userId: string, role: 'owner' | 'admin' | 'editor' | 'viewer' = 'viewer') {
  await adminClient.from('organization_members').upsert({
    org_id: orgId,
    user_id: userId,
    role,
  });
}

export async function createInviteToken(orgId: string, email: string, createdBy: string, role: 'admin' | 'editor' | 'viewer' = 'viewer') {
  const token = crypto.randomUUID?.() ?? Math.random().toString(36).slice(2);
  const { data, error } = await adminClient
    .from('invites')
    .insert({
      org_id: orgId,
      email,
      role,
      token,
      status: 'pending',
      created_by: createdBy,
    })
    .select('*')
    .single();

  if (error || !data) {
    throw error ?? new Error('Failed to create invite');
  }

  return {
    ...data,
    acceptUrl: `${SITE_URL}/auth/callback?token=${token}&type=signup`,
  };
}

export async function signInWithPassword(email: string, password: string) {
  const { data, error } = await anonClient.auth.signInWithPassword({ email, password });
  if (error || !data.session) {
    throw error ?? new Error('Failed to sign in');
  }
  return data.session;
}
