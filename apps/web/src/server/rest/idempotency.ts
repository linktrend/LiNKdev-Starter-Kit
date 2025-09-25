// REST API Idempotency System
// Handles idempotency keys for mutating operations

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { hashRequest } from './middleware';

export interface IdempotencyRecord {
  key: string;
  method: string;
  path: string;
  status: number;
  response: any;
  created_at: string;
  org_id: string;
  user_id: string;
  request_hash: string;
}

export interface IdempotencyStore {
  get(key: string): Promise<IdempotencyRecord | null>;
  set(key: string, record: IdempotencyRecord): Promise<void>;
  delete(key: string): Promise<void>;
  cleanup(): Promise<void>;
}

/**
 * In-memory idempotency store for offline mode
 */
class InMemoryIdempotencyStore implements IdempotencyStore {
  private store = new Map<string, IdempotencyRecord>();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Clean up expired records every hour
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60 * 60 * 1000);
  }

  async get(key: string): Promise<IdempotencyRecord | null> {
    const record = this.store.get(key);
    
    if (!record) {
      return null;
    }

    // Check if record is expired (24 hours)
    const now = new Date();
    const createdAt = new Date(record.created_at);
    const ageHours = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
    
    if (ageHours > 24) {
      this.store.delete(key);
      return null;
    }

    return record;
  }

  async set(key: string, record: IdempotencyRecord): Promise<void> {
    this.store.set(key, record);
  }

  async delete(key: string): Promise<void> {
    this.store.delete(key);
  }

  async cleanup(): Promise<void> {
    const now = new Date();
    const expiredKeys: string[] = [];

    for (const [key, record] of this.store.entries()) {
      const createdAt = new Date(record.created_at);
      const ageHours = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
      
      if (ageHours > 24) {
        expiredKeys.push(key);
      }
    }

    expiredKeys.forEach(key => this.store.delete(key));
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }
}

/**
 * Database-backed idempotency store
 */
class DatabaseIdempotencyStore implements IdempotencyStore {
  private supabase: any;

  constructor(supabase: any) {
    this.supabase = supabase;
  }

  async get(key: string): Promise<IdempotencyRecord | null> {
    const { data, error } = await this.supabase
      .from('idempotency_keys')
      .select('*')
      .eq('key', key)
      .single();

    if (error || !data) {
      return null;
    }

    // Check if record is expired (24 hours)
    const now = new Date();
    const createdAt = new Date(data.created_at);
    const ageHours = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
    
    if (ageHours > 24) {
      await this.delete(key);
      return null;
    }

    return data;
  }

  async set(key: string, record: IdempotencyRecord): Promise<void> {
    await this.supabase
      .from('idempotency_keys')
      .upsert(record);
  }

  async delete(key: string): Promise<void> {
    await this.supabase
      .from('idempotency_keys')
      .delete()
      .eq('key', key);
  }

  async cleanup(): Promise<void> {
    // Use the database function for cleanup
    await this.supabase.rpc('cleanup_expired_idempotency_keys');
  }
}

// Global store instances
let memoryStore: InMemoryIdempotencyStore | null = null;
let databaseStore: DatabaseIdempotencyStore | null = null;

/**
 * Get the appropriate idempotency store
 */
function getIdempotencyStore(supabase?: any): IdempotencyStore {
  if (supabase) {
    if (!databaseStore) {
      databaseStore = new DatabaseIdempotencyStore(supabase);
    }
    return databaseStore;
  } else {
    if (!memoryStore) {
      memoryStore = new InMemoryIdempotencyStore();
    }
    return memoryStore;
  }
}

/**
 * Extract idempotency key from request headers
 */
export function extractIdempotencyKey(request: NextRequest): string | null {
  return request.headers.get('idempotency-key');
}

/**
 * Generate idempotency key from request
 */
export function generateIdempotencyKey(
  method: string,
  path: string,
  orgId: string,
  userId: string,
  body?: any
): string {
  const bodyHash = body ? JSON.stringify(body) : '';
  const keyData = `${method}:${path}:${orgId}:${userId}:${bodyHash}`;
  
  // Simple hash function (in production, use crypto.createHash)
  let hash = 0;
  for (let i = 0; i < keyData.length; i++) {
    const char = keyData.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  return `idem_${Math.abs(hash).toString(36)}_${Date.now()}`;
}

/**
 * Check if request is idempotent
 */
export async function checkIdempotency(
  request: NextRequest,
  orgId: string,
  userId: string,
  supabase?: any
): Promise<IdempotencyRecord | null> {
  const key = extractIdempotencyKey(request);
  
  if (!key) {
    return null;
  }

  const store = getIdempotencyStore(supabase);
  return await store.get(key);
}

/**
 * Store idempotency result
 */
export async function storeIdempotencyResult(
  key: string,
  method: string,
  path: string,
  status: number,
  response: any,
  orgId: string,
  userId: string,
  requestHash: string,
  supabase?: any
): Promise<void> {
  const record: IdempotencyRecord = {
    key,
    method,
    path,
    status,
    response,
    created_at: new Date().toISOString(),
    org_id: orgId,
    user_id: userId,
    request_hash: requestHash,
  };

  const store = getIdempotencyStore(supabase);
  await store.set(key, record);
}

/**
 * Create idempotency middleware
 */
export function withIdempotency(
  handler: (request: NextRequest, ...args: any[]) => Promise<NextResponse>
) {
  return async (request: NextRequest, ...args: any[]): Promise<NextResponse> => {
    const key = extractIdempotencyKey(request);
    
    if (!key) {
      return await handler(request, ...args as any);
    }

    // Extract org and user from request (this would be done by auth middleware)
    const orgId = request.headers.get('x-org-id');
    const userId = 'user-id'; // This would come from auth context
    
    if (!orgId || !userId) {
      return await handler(request, ...args as any);
    }

    // Check for existing idempotency record
    const existingRecord = await checkIdempotency(request, orgId, userId);
    
    if (existingRecord) {
      return NextResponse.json(existingRecord.response, {
        status: existingRecord.status,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store',
          'X-Idempotency-Key': key,
        },
      });
    }

    // Generate request hash
    const requestBody = await request.clone().json().catch(() => ({}));
    const requestHash = hashRequest(requestBody, Object.fromEntries(request.headers.entries()), ['content-type', 'authorization']);

    // Execute handler and store result
    const response = await handler(request, ...args as any);
    const responseData = await response.clone().json();
    
    await storeIdempotencyResult(
      key,
      request.method,
      new URL(request.url).pathname,
      response.status,
      responseData,
      orgId,
      userId,
      requestHash
    );

    return response;
  };
}

/**
 * Cleanup expired idempotency records
 */
export async function cleanupIdempotencyRecords(supabase?: any): Promise<void> {
  const store = getIdempotencyStore(supabase);
  await store.cleanup();
}
