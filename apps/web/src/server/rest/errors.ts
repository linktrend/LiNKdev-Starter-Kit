// REST API Error Handling Utilities
// Standardized error responses and HTTP status codes

import { NextResponse } from 'next/server';
import { TRPCError } from '@trpc/server';

export interface RESTError {
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
}

export interface RESTErrorResponse extends Response {
  json(): Promise<RESTError>;
}

/**
 * Standard error codes and their HTTP status mappings
 */
export const ERROR_CODES = {
  // Authentication & Authorization
  MISSING_TOKEN: { status: 401, message: 'Authorization header with Bearer token is required' },
  INVALID_TOKEN: { status: 401, message: 'Invalid or expired token' },
  MISSING_ORG_ID: { status: 400, message: 'X-Org-ID header is required' },
  ORG_ACCESS_DENIED: { status: 403, message: 'User is not a member of the specified organization' },
  
  // Validation
  INVALID_REQUEST: { status: 400, message: 'Invalid request data' },
  MISSING_REQUIRED_FIELD: { status: 400, message: 'Required field is missing' },
  INVALID_FORMAT: { status: 400, message: 'Invalid data format' },
  
  // Resources
  RESOURCE_NOT_FOUND: { status: 404, message: 'Resource not found' },
  RESOURCE_CONFLICT: { status: 409, message: 'Resource conflict' },
  
  // Rate Limiting
  RATE_LIMIT_EXCEEDED: { status: 429, message: 'Rate limit exceeded' },
  
  // Server Errors
  INTERNAL_ERROR: { status: 500, message: 'Internal server error' },
  SERVICE_UNAVAILABLE: { status: 503, message: 'Service temporarily unavailable' },
} as const;

export type ErrorCode = keyof typeof ERROR_CODES;

/**
 * Create standardized REST error response
 */
export function createErrorResponse(
  code: ErrorCode,
  message?: string,
  details?: Record<string, any>
): NextResponse<RESTError> {
  const errorConfig = ERROR_CODES[code];
  const errorMessage = message || errorConfig.message;
  
  const error: RESTError = {
    error: {
      code: code.toLowerCase(),
      message: errorMessage,
      ...(details && { details }),
    },
  };

  return NextResponse.json(error, { 
    status: errorConfig.status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
  });
}

/**
 * Convert TRPC error to REST error response
 */
export function handleTRPCError(error: TRPCError): NextResponse<RESTError> {
  // Map TRPC error codes to REST error codes
  const codeMapping: Record<string, ErrorCode> = {
    'UNAUTHORIZED': 'INVALID_TOKEN',
    'FORBIDDEN': 'ORG_ACCESS_DENIED',
    'BAD_REQUEST': 'INVALID_REQUEST',
    'NOT_FOUND': 'RESOURCE_NOT_FOUND',
    'CONFLICT': 'RESOURCE_CONFLICT',
    'TOO_MANY_REQUESTS': 'RATE_LIMIT_EXCEEDED',
    'INTERNAL_SERVER_ERROR': 'INTERNAL_ERROR',
  };

  const restCode = codeMapping[error.code] || 'INTERNAL_ERROR';
  
  return createErrorResponse(
    restCode,
    error.message,
    error.cause ? { cause: error.cause } : undefined
  );
}

/**
 * Handle unknown errors
 */
export function handleUnknownError(error: unknown): NextResponse<RESTError> {
  console.error('Unknown error in REST API:', error);
  
  if (error instanceof TRPCError) {
    return handleTRPCError(error);
  }
  
  if (error instanceof Error) {
    return createErrorResponse('INTERNAL_ERROR', error.message);
  }
  
  return createErrorResponse('INTERNAL_ERROR');
}

/**
 * Create validation error response
 */
export function createValidationError(
  field: string,
  message: string,
  value?: any
): NextResponse<RESTError> {
  return createErrorResponse('INVALID_REQUEST', message, {
    field,
    value,
  });
}

/**
 * Create not found error response
 */
export function createNotFoundError(resource: string, id: string): NextResponse<RESTError> {
  return createErrorResponse('RESOURCE_NOT_FOUND', `${resource} with ID '${id}' not found`);
}

/**
 * Create conflict error response
 */
export function createConflictError(message: string, details?: Record<string, any>): NextResponse<RESTError> {
  return createErrorResponse('RESOURCE_CONFLICT', message, details);
}

/**
 * Create rate limit error response
 */
export function createRateLimitError(
  retryAfter?: number,
  limit?: number,
  remaining?: number
): NextResponse<RESTError> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store',
  };
  
  if (retryAfter) {
    headers['Retry-After'] = retryAfter.toString();
  }
  
  if (limit) {
    headers['X-RateLimit-Limit'] = limit.toString();
  }
  
  if (remaining !== undefined) {
    headers['X-RateLimit-Remaining'] = remaining.toString();
  }

  const error: RESTError = {
    error: {
      code: 'rate_limit_exceeded',
      message: 'Rate limit exceeded',
      details: {
        retryAfter,
        limit,
        remaining,
      },
    },
  };

  return new NextResponse(JSON.stringify(error), {
    status: 429,
    headers,
  });
}

/**
 * Create success response with data
 */
export function createSuccessResponse<T>(data: T, status: number = 200): NextResponse<T> {
  return NextResponse.json(data, {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
  });
}

/**
 * Create paginated response
 */
export function createPaginatedResponse<T>(
  data: T[],
  nextCursor?: string,
  total?: number
): NextResponse<{
  data: T[];
  nextCursor?: string;
  total?: number;
}> {
  return createSuccessResponse({
    data,
    ...(nextCursor && { nextCursor }),
    ...(total !== undefined && { total }),
  });
}

/**
 * Error handler wrapper for async route handlers
 */
export function withErrorHandling<T extends any[], R>(
  handler: (...args: T) => Promise<NextResponse>
) {
  return async (...args: T): Promise<NextResponse> => {
    try {
      return await handler(...args);
    } catch (error) {
      return handleUnknownError(error);
    }
  };
}
