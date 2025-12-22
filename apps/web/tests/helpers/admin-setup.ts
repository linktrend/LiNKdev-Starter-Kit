import { Page, APIRequestContext } from '@playwright/test';
import { createClient, SupabaseClient, type AuthResponse } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const defaultOrgId = process.env.NEXT_PUBLIC_DEFAULT_ORG_ID || 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
const ORG_STORAGE_KEY = 'console.currentOrgId';

type EnsureUserOptions = {
  email: string;
  password: string;
  fullName?: string;
  accountType?: 'super_admin' | 'admin' | 'user';
};

function requireEnv(value: string | undefined, name: string) {
  if (!value) {
    throw new Error(`Missing ${name} environment variable for Playwright auth helper`);
  }
  return value;
}

function getProjectRef(url: string) {
  const host = new URL(url).hostname; // e.g. xxx.supabase.co
  return host.split('.')[0];
}

function storageKey(url: string) {
  return `sb-${getProjectRef(url)}-auth-token`;
}

function getServiceClient(): SupabaseClient {
  return createClient(requireEnv(supabaseUrl, 'NEXT_PUBLIC_SUPABASE_URL'), requireEnv(serviceRoleKey, 'SUPABASE_SERVICE_ROLE_KEY'), {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

function getBrowserClient(): SupabaseClient {
  return createClient(requireEnv(supabaseUrl, 'NEXT_PUBLIC_SUPABASE_URL'), requireEnv(supabaseAnonKey, 'NEXT_PUBLIC_SUPABASE_ANON_KEY'));
}

async function ensureUserWithProfile(options: EnsureUserOptions, orgId = defaultOrgId) {
  const service = getServiceClient();
  const { email, password, fullName = 'Console Admin', accountType = 'admin' } = options;

  // Create auth user if missing
  await service.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName, seed: true },
  });

  // Upsert profile
  const userId = (
    await service.from('users').select('id').eq('email', email).maybeSingle()
  ).data?.id;

  const profileId =
    userId ||
    (
      await service
        .from('users')
        .insert({
          email,
          full_name: fullName,
          account_type: accountType,
          onboarding_completed: true,
          profile_completed: true,
        })
        .select('id')
        .maybeSingle()
    ).data?.id;

  if (!profileId) {
    throw new Error(`Failed to create profile for ${email}`);
  }

  await service
    .from('users')
    .upsert(
      {
        id: profileId,
        email,
        full_name: fullName,
        account_type: accountType,
        onboarding_completed: true,
        profile_completed: true,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    );

  // Ensure primary org exists
  await service
    .from('organizations')
    .upsert(
      {
        id: orgId,
        name: 'Playwright Console Org',
        slug: 'console-org',
        org_type: 'business',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    );

  // Secondary org used by security screen placeholder
  const securityOrgId = 'placeholder-org-id';
  await service
    .from('organizations')
    .upsert(
      {
        id: securityOrgId,
        name: 'Security Placeholder Org',
        slug: 'security-org',
        org_type: 'business',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    );

  // Ensure membership (owner for admins, viewer otherwise)
  const role = accountType === 'admin' || accountType === 'super_admin' ? 'owner' : 'viewer';
  await service
    .from('organization_members')
    .upsert(
      {
        org_id: orgId,
        user_id: profileId,
        role,
        created_at: new Date().toISOString(),
      },
      { onConflict: 'org_id,user_id' }
    );

  await service
    .from('organization_members')
    .upsert(
      {
        org_id: securityOrgId,
        user_id: profileId,
        role,
        created_at: new Date().toISOString(),
      },
      { onConflict: 'org_id,user_id' }
    );

  return { userId: profileId, orgId };
}

async function setSessionStorage(page: Page, session: AuthResponse['data']['session']) {
  if (!session || !supabaseUrl) return;

  const key = storageKey(supabaseUrl);
  const payload = {
    currentSession: session,
    currentUser: session.user,
    expiresAt: session.expires_at,
  };

  await page.addInitScript(
    ([storageKey, value]) => {
      window.localStorage.setItem(storageKey, value);
    },
    [key, JSON.stringify(payload)]
  );
}

async function setOrgSelection(page: Page, orgId: string) {
  await page.addInitScript(
    ([storageKey, value]) => {
      window.localStorage.setItem(storageKey, value);
    },
    [ORG_STORAGE_KEY, orgId],
  );
}

async function setAuthCookie(page: Page, session: AuthResponse['data']['session']) {
  if (!session || !supabaseUrl) return;
  const name = storageKey(supabaseUrl);
  const cookieValue = JSON.stringify({
    access_token: session.access_token,
    refresh_token: session.refresh_token,
    expires_at: session.expires_at,
    token_type: 'bearer',
    provider_token: null,
    user: session.user,
  });

  const url = new URL(process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000');
  await page.context().addCookies([
    {
      name,
      value: cookieValue,
      domain: url.hostname,
      path: '/',
      httpOnly: false,
      secure: url.protocol === 'https:',
      sameSite: 'Lax',
      expires: Math.floor(Date.now() / 1000) + (session.expires_in ?? 3600),
    },
  ]);
}

async function signInForBrowser(email: string, password: string) {
  const browserClient = getBrowserClient();
  const { data, error } = await browserClient.auth.signInWithPassword({ email, password });
  if (error || !data.session) {
    throw new Error(`Failed to sign in ${email}: ${error?.message}`);
  }
  return data.session;
}

export async function loginAsAdmin(page: Page, options?: Partial<EnsureUserOptions>) {
  const email = options?.email || 'admin1@ltm.dev';
  const password = options?.password || 'Admin1Password123!';
  const { orgId } = await ensureUserWithProfile({ email, password, fullName: 'Playwright Admin', accountType: 'admin' });
  const session = await signInForBrowser(email, password);
  await setSessionStorage(page, session);
  await setOrgSelection(page, orgId);
  await setAuthCookie(page, session);
}

export async function loginAsUser(page: Page, options?: Partial<EnsureUserOptions>) {
  const email = options?.email || 'user1@ltm.dev';
  const password = options?.password || 'User1Password123!';
  const { orgId } = await ensureUserWithProfile({ email, password, fullName: 'Playwright User', accountType: 'user' });
  const session = await signInForBrowser(email, password);
  await setSessionStorage(page, session);
  await setOrgSelection(page, orgId);
  await setAuthCookie(page, session);
}

export async function setupAdminAndUser() {
  const admin = await ensureUserWithProfile({ email: 'admin1@ltm.dev', password: 'Admin1Password123!', accountType: 'admin' });
  const user = await ensureUserWithProfile({ email: 'user1@ltm.dev', password: 'User1Password123!', accountType: 'user' }, admin.orgId);
  return { admin, user, orgId: admin.orgId };
}

export async function apiLogin(request: APIRequestContext, email: string, password: string) {
  const anon = requireEnv(supabaseAnonKey, 'NEXT_PUBLIC_SUPABASE_ANON_KEY');
  const url = requireEnv(supabaseUrl, 'NEXT_PUBLIC_SUPABASE_URL');
  const res = await request.post(`${url}/auth/v1/token?grant_type=password`, {
    data: { email, password },
    headers: {
      apikey: anon,
      accept: 'json',
      'content-type': 'application/json',
    },
  });
  if (res.status() >= 400) {
    throw new Error(`Failed to login via API (${res.status()}): ${await res.text()}`);
  }
  const json = (await res.json()) as any;
  return json as { access_token: string; refresh_token: string; expires_in: number; expires_at: number; user: any };
}

export function getDefaultOrgId() {
  return defaultOrgId;
}
