'use server';

import { createClient as createServiceRoleClient, type SupabaseClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import { z } from 'zod';

import { requireAdmin, getUser } from '@/lib/auth/server';
import { env } from '@/env';
import type { Database } from '@/types/database.types';

type Severity = 'critical' | 'error' | 'warning' | 'info';

export type ErrorLogRecord = {
  id: string;
  org_id: string;
  user_id: string | null;
  actor_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string;
  severity: Severity;
  message: string | null;
  stack_trace: string | null;
  component_stack: string | null;
  page_url: string | null;
  user_agent: string | null;
  metadata: Record<string, any>;
  resolved: boolean;
  occurrence_count: number;
  first_seen: string;
  last_seen: string;
  created_at: string;
  grouping_hash: string | null;
};

type ListSort = 'newest' | 'oldest' | 'severity' | 'occurrences';

const severityRank: Record<Severity, number> = {
  critical: 4,
  error: 3,
  warning: 2,
  info: 1,
};

let serviceRoleClient: SupabaseClient<Database> | null = null;

function getServiceRoleClient() {
  if (serviceRoleClient) return serviceRoleClient;

  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || env.SUPABASE_URL;
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    throw new Error('Supabase service role environment variables are not set');
  }

  serviceRoleClient = createServiceRoleClient<Database>(supabaseUrl, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return serviceRoleClient;
}

const severitySchema = z.enum(['critical', 'error', 'warning', 'info']);

const logInputSchema = z.object({
  orgId: z.string().uuid(),
  message: z.string().min(1).max(500),
  stackTrace: z.string().optional(),
  componentStack: z.string().optional(),
  severity: severitySchema.default('error'),
  pageUrl: z.string().max(1024).optional(),
  userAgent: z.string().max(512).optional(),
  metadata: z.record(z.any()).optional(),
});

const listInputSchema = z.object({
  orgId: z.string().uuid(),
  severity: severitySchema.optional(),
  resolved: z.boolean().optional(),
  userId: z.string().uuid().optional(),
  pageUrl: z.string().max(1024).optional(),
  search: z.string().max(200).optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  sort: z.enum(['newest', 'oldest', 'severity', 'occurrences']).default('newest'),
  limit: z.number().min(1).max(100).default(25),
  offset: z.number().min(0).max(10000).default(0),
});

const detailInputSchema = z.object({
  orgId: z.string().uuid(),
  id: z.string().uuid(),
});

const mutationInputSchema = z.object({
  orgId: z.string().uuid(),
  ids: z.array(z.string().uuid()).min(1),
});

const statsInputSchema = z.object({
  orgId: z.string().uuid(),
});

function sanitizeMetadata(meta: unknown): Record<string, any> {
  if (!meta || typeof meta !== 'object') return {};
  const forbidden = /(password|token|secret|authorization|cookie|apikey|api_key)/i;

  const recurse = (value: any): any => {
    if (Array.isArray(value)) {
      return value.map(recurse);
    }
    if (value && typeof value === 'object') {
      return Object.entries(value).reduce<Record<string, any>>((acc, [key, val]) => {
        if (forbidden.test(key)) {
          acc[key] = '[redacted]';
          return acc;
        }
        acc[key] = recurse(val);
        return acc;
      }, {});
    }
    if (typeof value === 'string' && forbidden.test(value)) {
      return '[redacted]';
    }
    return value;
  };

  return recurse(meta);
}

function sanitizeStackTrace(stack?: string | null): string | null {
  if (!stack) return null;
  // Remove absolute paths and query params
  return stack
    .replace(/file:\/\/\/[^\s)]+/g, '[redacted]')
    .replace(/\/[A-Za-z0-9._-]+\/(src|app|packages)\/[^\s)]+/g, '[redacted]')
    .slice(0, 8000);
}

function computeGroupingHash(message: string, stack?: string | null, componentStack?: string | null) {
  const basis = `${message}|${stack ?? ''}|${componentStack ?? ''}`;
  return crypto.createHash('sha256').update(basis).digest('hex').slice(0, 24);
}

const rateBuckets = new Map<string, { count: number; resetAt: number }>();
function checkRateLimit(key: string, windowMs = 60_000, max = 30) {
  const now = Date.now();
  const bucket = rateBuckets.get(key);
  if (!bucket || now > bucket.resetAt) {
    rateBuckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true };
  }
  if (bucket.count >= max) {
    return { allowed: false, retryAfterMs: bucket.resetAt - now };
  }
  bucket.count += 1;
  return { allowed: true };
}

function mapSortToOrder(sort: ListSort): { column: string; ascending: boolean } {
  switch (sort) {
    case 'oldest':
      return { column: 'created_at', ascending: true };
    case 'severity':
      return { column: 'severity', ascending: false };
    case 'occurrences':
      return { column: 'occurrence_count', ascending: false };
    case 'newest':
    default:
      return { column: 'last_seen', ascending: false };
  }
}

function mapRow(row: any): ErrorLogRecord {
  return {
    ...row,
    metadata: row.metadata ?? {},
  } as ErrorLogRecord;
}

/**
 * Log an error occurrence (client or server) with grouping and rate limiting.
 * Does not require admin; intended for app-wide logging.
 */
export async function logError(input: z.input<typeof logInputSchema>) {
  const parsed = logInputSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.message };
  }

  const payload = parsed.data;
  const supabase = getServiceRoleClient();

  // Capture user context (best effort)
  const user = await getUser().catch(() => null);
  const userId = user?.id ?? null;
  const orgId = payload.orgId ?? env.NEXT_PUBLIC_DEFAULT_ORG_ID;

  if (!orgId) {
    return { success: false, error: 'orgId is required for logging' };
  }

  const sanitizedStack = sanitizeStackTrace(payload.stackTrace);
  const sanitizedComponentStack = sanitizeStackTrace(payload.componentStack);
  const groupingHash = computeGroupingHash(payload.message, sanitizedStack, sanitizedComponentStack);
  const rateKey = `${orgId}:${groupingHash}`;
  const rate = checkRateLimit(rateKey);
  if (!rate.allowed) {
    return { success: false, error: 'Rate limit exceeded', retryAfterMs: rate.retryAfterMs };
  }

  const metadata = sanitizeMetadata(payload.metadata);
  const nowIso = new Date().toISOString();

  const { data: existing } = await supabase
    .from('audit_logs')
    .select(
      'id, occurrence_count, first_seen, last_seen, severity, resolved',
    )
    .eq('entity_type', 'error')
    .eq('org_id', orgId)
    .eq('grouping_hash', groupingHash)
    .order('last_seen', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existing) {
    const nextCount = (existing.occurrence_count ?? 1) + 1;
    const { error: updateError } = await supabase
      .from('audit_logs')
      .update({
        occurrence_count: nextCount,
        last_seen: nowIso,
        severity: payload.severity,
        message: payload.message,
        stack_trace: sanitizedStack,
        component_stack: sanitizedComponentStack,
        page_url: payload.pageUrl,
        user_agent: payload.userAgent,
        metadata,
        resolved: existing.resolved ?? false,
      })
      .eq('id', existing.id);

    if (updateError) {
      console.error('Error updating error log', updateError);
      return { success: false, error: 'Failed to update error record' };
    }

    return { success: true, id: existing.id, groupingHash };
  }

  const { error: insertError, data } = await supabase
    .from('audit_logs')
    .insert({
      org_id: orgId,
      user_id: userId,
      actor_id: userId,
      action: 'error.logged',
      entity_type: 'error',
      entity_id: groupingHash,
      severity: payload.severity,
      message: payload.message,
      stack_trace: sanitizedStack,
      component_stack: sanitizedComponentStack,
      page_url: payload.pageUrl,
      user_agent: payload.userAgent,
      metadata,
      resolved: false,
      occurrence_count: 1,
      first_seen: nowIso,
      last_seen: nowIso,
      grouping_hash: groupingHash,
    })
    .select('id')
    .maybeSingle();

  if (insertError) {
    console.error('Error inserting error log', insertError);
    return { success: false, error: 'Failed to log error' };
  }

  return { success: true, id: data?.id ?? null, groupingHash };
}

/**
 * List errors with filtering, search, and pagination.
 */
export async function listErrors(input: z.input<typeof listInputSchema>) {
  await requireAdmin();
  const parsed = listInputSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.message };
  }
  const { orgId, severity, resolved, userId, pageUrl, search, from, to, sort, limit, offset } =
    parsed.data;

  const supabase = getServiceRoleClient();
  const order = mapSortToOrder(sort);

  let query = supabase
    .from('audit_logs')
    .select(
      'id, org_id, user_id, actor_id, action, entity_type, entity_id, severity, message, stack_trace, component_stack, page_url, user_agent, metadata, resolved, occurrence_count, first_seen, last_seen, created_at, grouping_hash',
      { count: 'exact' },
    )
    .eq('entity_type', 'error')
    .eq('org_id', orgId)
    .order(order.column, { ascending: order.ascending })
    .range(offset, offset + limit - 1);

  if (severity) query = query.eq('severity', severity);
  if (resolved !== undefined) query = query.eq('resolved', resolved);
  if (userId) query = query.eq('user_id', userId);
  if (pageUrl) query = query.ilike('page_url', `%${pageUrl}%`);
  if (from) query = query.gte('created_at', from);
  if (to) query = query.lte('created_at', to);
  if (search) {
    const term = `%${search}%`;
    query = query.or(
      [
        `message.ilike.${term}`,
        `stack_trace.ilike.${term}`,
        `page_url.ilike.${term}`,
        `user_agent.ilike.${term}`,
      ].join(','),
    );
  }

  const { data, error, count } = await query;
  if (error) {
    console.error('listErrors query failed', error);
    return { success: false, error: 'Failed to load errors' };
  }

  const items = (data ?? []).map(mapRow);
  const hasMore = count !== null ? offset + limit < count : false;

  return {
    success: true,
    items,
    total: count ?? items.length,
    hasMore,
    nextOffset: hasMore ? offset + limit : null,
  };
}

/**
 * Fetch error details by id (scoped to org).
 */
export async function getErrorDetails(input: z.input<typeof detailInputSchema>) {
  await requireAdmin();
  const parsed = detailInputSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.message };
  }

  const { orgId, id } = parsed.data;
  const supabase = getServiceRoleClient();

  const { data, error } = await supabase
    .from('audit_logs')
    .select(
      'id, org_id, user_id, actor_id, action, entity_type, entity_id, severity, message, stack_trace, component_stack, page_url, user_agent, metadata, resolved, occurrence_count, first_seen, last_seen, created_at, grouping_hash',
    )
    .eq('entity_type', 'error')
    .eq('org_id', orgId)
    .eq('id', id)
    .maybeSingle();

  if (error || !data) {
    console.error('getErrorDetails failed', error);
    return { success: false, error: 'Error not found' };
  }

  return { success: true, item: mapRow(data) };
}

/**
 * Resolve (mark closed) one or more errors.
 */
export async function resolveErrors(input: z.input<typeof mutationInputSchema>) {
  await requireAdmin();
  const parsed = mutationInputSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.message };
  }
  const { orgId, ids } = parsed.data;
  const supabase = getServiceRoleClient();

  const { error } = await supabase
    .from('audit_logs')
    .update({ resolved: true, last_seen: new Date().toISOString() })
    .eq('entity_type', 'error')
    .eq('org_id', orgId)
    .in('id', ids);

  if (error) {
    console.error('resolveErrors failed', error);
    return { success: false, error: 'Failed to resolve errors' };
  }

  return { success: true };
}

/**
 * Delete error records (admin only).
 */
export async function deleteErrors(input: z.input<typeof mutationInputSchema>) {
  await requireAdmin();
  const parsed = mutationInputSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.message };
  }
  const { orgId, ids } = parsed.data;
  const supabase = getServiceRoleClient();

  const { error } = await supabase
    .from('audit_logs')
    .delete()
    .eq('entity_type', 'error')
    .eq('org_id', orgId)
    .in('id', ids);

  if (error) {
    console.error('deleteErrors failed', error);
    return { success: false, error: 'Failed to delete errors' };
  }

  return { success: true };
}

/**
 * Error statistics for dashboards (24h/7d/30d, severities, trend).
 */
export async function getErrorStats(input: z.input<typeof statsInputSchema>) {
  await requireAdmin();
  const parsed = statsInputSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.message };
  }
  const { orgId } = parsed.data;
  const supabase = getServiceRoleClient();

  const since30d = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const { data, error } = await supabase
    .from('audit_logs')
    .select(
      'id, severity, occurrence_count, created_at, last_seen, grouping_hash, message, user_id',
    )
    .eq('entity_type', 'error')
    .eq('org_id', orgId)
    .gte('created_at', since30d);

  if (error) {
    console.error('getErrorStats failed', error);
    return { success: false, error: 'Failed to load stats' };
  }

  const now = Date.now();
  const hours24 = now - 24 * 60 * 60 * 1000;
  const hours7d = now - 7 * 24 * 60 * 60 * 1000;

  let last24h = 0;
  let last7d = 0;
  let last30d = data?.length ?? 0;
  const bySeverity: Record<Severity, number> = { critical: 0, error: 0, warning: 0, info: 0 };
  const trend = new Map<string, number>();
  const topErrors = new Map<
    string,
    { grouping_hash: string; message: string | null; count: number; severity: Severity; last_seen: string }
  >();
  const affectedUsers = new Set<string>();

  for (const row of data ?? []) {
    const created = new Date(row.created_at).getTime();
    if (created >= hours24) last24h += 1;
    if (created >= hours7d) last7d += 1;

    const sev = (row.severity as Severity) ?? 'error';
    bySeverity[sev] = (bySeverity[sev] ?? 0) + 1;

    const dayKey = new Date(row.created_at).toISOString().slice(0, 10);
    trend.set(dayKey, (trend.get(dayKey) ?? 0) + 1);

    if (row.grouping_hash) {
      const current = topErrors.get(row.grouping_hash);
      const count = (row.occurrence_count ?? 1) as number;
      if (!current || count > current.count) {
        topErrors.set(row.grouping_hash, {
          grouping_hash: row.grouping_hash,
          message: row.message ?? 'Unknown error',
          count,
          severity: sev,
          last_seen: row.last_seen,
        });
      }
    }

    if (row.user_id) {
      affectedUsers.add(row.user_id);
    }
  }

  const trendPoints = Array.from(trend.entries())
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([date, count]) => ({ date, count }));

  const topList = Array.from(topErrors.values()).sort((a, b) => b.count - a.count).slice(0, 5);

  return {
    success: true,
    totals: {
      last24h,
      last7d,
      last30d,
    },
    bySeverity,
    trend: trendPoints,
    topErrors: topList,
    affectedUsers: affectedUsers.size,
  };
}
