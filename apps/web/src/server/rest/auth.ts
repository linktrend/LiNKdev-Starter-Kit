// REST API Authentication Utilities
// Handles JWT bearer token validation and org context extraction

import { NextRequest } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { TRPCError } from '@trpc/server';
import { cookies } from 'next/headers';

export interface RESTAuthContext {
  user: {
    id: string;
    email: string;
  };
  orgId: string;
  supabase: any;
}

export interface AuthError {
  code: string;
  message: string;
  status: number;
}

/**
 * Extract and validate JWT bearer token from Authorization header
 */
export function extractBearerToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  return authHeader.substring(7); // Remove 'Bearer ' prefix
}

/**
 * Extract organization ID from X-Org-ID header
 */
export function extractOrgId(request: NextRequest): string | null {
  return request.headers.get('x-org-id');
}

/**
 * Authenticate request and extract user/org context
 */
export async function authenticateRequest(request: NextRequest): Promise<RESTAuthContext> {
  // Extract bearer token
  const token = extractBearerToken(request);
  if (!token) {
    throw createAuthError('MISSING_TOKEN', 'Authorization header with Bearer token is required', 401);
  }

  // Extract org ID
  const orgId = extractOrgId(request);
  if (!orgId) {
    throw createAuthError('MISSING_ORG_ID', 'X-Org-ID header is required', 400);
  }

  // Validate JWT token
  const supabase = createClient({ cookies });
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      throw createAuthError('INVALID_TOKEN', 'Invalid or expired token', 401);
    }

    if (!user.email) {
      throw createAuthError('INVALID_TOKEN', 'User email is required', 401);
    }

    // Verify user is member of the organization
    const { data: membership, error: membershipError } = await supabase
      .from('organization_members')
      .select('org_id')
      .eq('org_id', orgId)
      .eq('user_id', user.id)
      .single();

    if (membershipError || !membership) {
      throw createAuthError('ORG_ACCESS_DENIED', 'User is not a member of the specified organization', 403);
    }

    return {
      user: {
        id: user.id,
        email: user.email,
      },
      orgId,
      supabase,
    };
  } catch (error) {
    if (error instanceof TRPCError) {
      throw error;
    }
    
    // Handle Supabase errors
    if (error instanceof Error) {
      throw createAuthError('AUTH_ERROR', `Authentication failed: ${error.message}`, 401);
    }
    
    throw createAuthError('AUTH_ERROR', 'Authentication failed', 401);
  }
}

/**
 * Create standardized auth error
 */
export function createAuthError(code: string, message: string, status: number): TRPCError {
  return new TRPCError({
    code: status === 401 ? 'UNAUTHORIZED' : status === 403 ? 'FORBIDDEN' : 'BAD_REQUEST',
    message,
    cause: { code, status },
  });
}

/**
 * Check if request is in offline mode
 */
export function isOfflineMode(): boolean {
  return process.env.TEMPLATE_OFFLINE === '1' || 
    !process.env.NEXT_PUBLIC_SUPABASE_URL || 
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
}

/**
 * Create mock auth context for offline mode
 */
export function createMockAuthContext(orgId: string): RESTAuthContext {
  return {
    user: {
      id: 'mock-user-123',
      email: 'user@example.com',
    },
    orgId,
    supabase: null, // Will use offline stores
  };
}

/**
 * Validate org ID format
 */
export function validateOrgId(orgId: string): boolean {
  // Basic UUID validation
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(orgId);
}

/**
 * Extract request metadata for logging
 */
export function extractRequestMetadata(request: NextRequest) {
  return {
    method: request.method,
    url: request.url,
    userAgent: request.headers.get('user-agent'),
    ip: request.headers.get('x-forwarded-for') || 
        request.headers.get('x-real-ip') || 
        'unknown',
    timestamp: new Date().toISOString(),
  };
}
