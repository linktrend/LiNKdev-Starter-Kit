import { logError, type Severity } from '@/app/actions/errors';
import { env } from '@/env';

type LogContext = Record<string, unknown>;

function toError(input: unknown): Error {
  if (input instanceof Error) return input;
  if (typeof input === 'string') return new Error(input);
  try {
    return new Error(JSON.stringify(input));
  } catch {
    return new Error('Unknown error');
  }
}

function sanitizeContext(context?: LogContext): LogContext {
  if (!context || typeof context !== 'object') return {};
  const forbidden = /(password|token|secret|authorization|cookie|apikey|api_key)/i;

  return Object.entries(context).reduce<LogContext>((acc, [key, value]) => {
    if (forbidden.test(key)) {
      acc[key] = '[redacted]';
      return acc;
    }
    if (typeof value === 'string' && forbidden.test(value)) {
      acc[key] = '[redacted]';
    } else {
      acc[key] = value;
    }
    return acc;
  }, {});
}

interface LogServerErrorParams {
  error: unknown;
  orgId: string;
  severity?: Severity;
  pageUrl?: string;
  userAgent?: string;
  metadata?: LogContext;
  componentStack?: string;
}

export async function logServerError(params: LogServerErrorParams) {
  const { error, orgId, severity = 'error', pageUrl, userAgent, metadata, componentStack } = params;
  if (process.env.TEMPLATE_OFFLINE === '1') {
    return { success: false, error: 'offline' as const };
  }

  const err = toError(error);
  const sanitizedMetadata = sanitizeContext(metadata);

  return logError({
    orgId,
    message: err.message || 'Unknown server error',
    stackTrace: err.stack ?? undefined,
    componentStack,
    severity,
    pageUrl,
    userAgent,
    metadata: sanitizedMetadata,
  });
}

/**
 * Helper for API/route handlers to capture failures with request context.
 */
export async function logApiError(
  orgId: string,
  error: unknown,
  context: { endpoint?: string; method?: string; statusCode?: number; userAgent?: string } = {},
) {
  return logServerError({
    orgId,
    error,
    severity: 'error',
    pageUrl: context.endpoint,
    userAgent: context.userAgent,
    metadata: sanitizeContext({
      endpoint: context.endpoint,
      method: context.method,
      statusCode: context.statusCode,
    }),
  });
}

export const defaultOrgId = env.NEXT_PUBLIC_DEFAULT_ORG_ID;
