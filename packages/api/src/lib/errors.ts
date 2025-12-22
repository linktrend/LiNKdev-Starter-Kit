import { TRPCError } from '@trpc/server';

export const notFoundError = (message = 'Resource not found'): TRPCError =>
  new TRPCError({ code: 'NOT_FOUND', message });

export const unauthorizedError = (message = 'Unauthorized'): TRPCError =>
  new TRPCError({ code: 'UNAUTHORIZED', message });

export const forbiddenError = (message = 'Forbidden'): TRPCError =>
  new TRPCError({ code: 'FORBIDDEN', message });

export const badRequestError = (message = 'Bad request'): TRPCError =>
  new TRPCError({ code: 'BAD_REQUEST', message });

export const internalError = (message = 'Internal server error'): TRPCError =>
  new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message });

/**
 * Convert a Supabase error to a TRPCError while avoiding leaking
 * sensitive internal details to callers.
 */
export function fromSupabase(
  error: { code?: string; message?: string } | null,
  fallbackMessage: string,
): TRPCError {
  if (!error) {
    return internalError(fallbackMessage);
  }

  // Handle common constraint/rls situations gracefully
  if (error.code === '23505') {
    return badRequestError('Duplicate record');
  }

  if (error.code === '42501') {
    return forbiddenError('Insufficient permissions');
  }

  return internalError(fallbackMessage);
}
