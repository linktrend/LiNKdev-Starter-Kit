// REST API Pagination Utilities
// Cursor-based pagination helpers

export interface PaginationParams {
  limit: number;
  cursor?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  nextCursor?: string;
  total?: number;
}

export interface PaginationInfo {
  limit: number;
  cursor?: string;
  hasMore: boolean;
  nextCursor?: string;
  total?: number;
}

/**
 * Extract pagination parameters from URL search params
 */
export function extractPaginationParams(searchParams: URLSearchParams): PaginationParams {
  const limit = Math.min(
    Math.max(parseInt(searchParams.get('limit') || '50'), 1),
    100
  );
  
  const cursor = searchParams.get('cursor') || undefined;
  
  return { limit, cursor };
}

/**
 * Create pagination info from results
 */
export function createPaginationInfo<T>(
  results: T[],
  limit: number,
  cursor?: string,
  total?: number
): PaginationInfo {
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  const nextCursor = hasMore && data.length > 0 ? 
    (data[data.length - 1] as any)?.id || 
    (data[data.length - 1] as any)?.created_at : 
    undefined;

  return {
    limit,
    cursor,
    hasMore,
    nextCursor,
    total,
  };
}

/**
 * Create paginated response
 */
export function createPaginatedResponse<T>(
  results: T[],
  limit: number,
  cursor?: string,
  total?: number
): PaginatedResponse<T> {
  const paginationInfo = createPaginationInfo(results, limit, cursor, total);
  
  return {
    data: paginationInfo.hasMore ? results.slice(0, limit) : results,
    nextCursor: paginationInfo.nextCursor,
    total: paginationInfo.total,
  };
}

/**
 * Apply cursor-based pagination to data
 */
export function applyCursorPagination<T>(
  data: T[],
  cursor?: string,
  limit: number = 50,
  sortField: keyof T = 'created_at' as keyof T,
  sortOrder: 'asc' | 'desc' = 'desc'
): T[] {
  // Sort data by the specified field
  const sortedData = [...data].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    if (aValue === bValue) return 0;
    
    const comparison = aValue < bValue ? -1 : 1;
    return sortOrder === 'desc' ? -comparison : comparison;
  });

  if (!cursor) {
    return sortedData.slice(0, limit);
  }

  // Find the cursor position
  const cursorIndex = sortedData.findIndex(item => {
    const itemValue = item[sortField];
    return sortOrder === 'desc' ? 
      itemValue < cursor : 
      itemValue > cursor;
  });

  if (cursorIndex === -1) {
    return sortedData.slice(0, limit);
  }

  return sortedData.slice(cursorIndex, cursorIndex + limit);
}

/**
 * Generate next cursor from the last item
 */
export function generateNextCursor<T>(
  items: T[],
  sortField: keyof T = 'created_at' as keyof T
): string | undefined {
  if (items.length === 0) {
    return undefined;
  }

  const lastItem = items[items.length - 1];
  const value = lastItem[sortField];
  
  if (typeof value === 'string') {
    return value;
  }
  
  if (typeof value === 'number') {
    return value.toString();
  }
  
  if (value instanceof Date) {
    return value.toISOString();
  }
  
  // Fallback to ID if available
  if ('id' in lastItem && typeof lastItem.id === 'string') {
    return lastItem.id;
  }
  
  return undefined;
}

/**
 * Parse cursor value based on field type
 */
export function parseCursor(
  cursor: string,
  fieldType: 'string' | 'number' | 'date' = 'string'
): string | number | Date {
  switch (fieldType) {
    case 'number':
      return parseInt(cursor, 10);
    case 'date':
      return new Date(cursor);
    default:
      return cursor;
  }
}

/**
 * Create pagination headers for response
 */
export function createPaginationHeaders(
  paginationInfo: PaginationInfo
): Record<string, string> {
  const headers: Record<string, string> = {
    'X-Pagination-Limit': paginationInfo.limit.toString(),
    'X-Pagination-HasMore': paginationInfo.hasMore.toString(),
  };

  if (paginationInfo.nextCursor) {
    headers['X-Pagination-NextCursor'] = paginationInfo.nextCursor;
  }

  if (paginationInfo.total !== undefined) {
    headers['X-Pagination-Total'] = paginationInfo.total.toString();
  }

  return headers;
}

/**
 * Validate pagination parameters
 */
export function validatePaginationParams(params: {
  limit?: number;
  cursor?: string;
}): { valid: boolean; error?: string; params?: PaginationParams } {
  const limit = params.limit || 50;
  
  if (limit < 1 || limit > 100) {
    return {
      valid: false,
      error: 'Limit must be between 1 and 100',
    };
  }

  return {
    valid: true,
    params: {
      limit,
      cursor: params.cursor,
    },
  };
}

/**
 * Calculate offset for cursor-based pagination
 */
export function calculateOffset(
  data: any[],
  cursor?: string,
  sortField: string = 'created_at',
  sortOrder: 'asc' | 'desc' = 'desc'
): number {
  if (!cursor) {
    return 0;
  }

  const cursorIndex = data.findIndex(item => {
    const itemValue = item[sortField];
    return sortOrder === 'desc' ? 
      itemValue < cursor : 
      itemValue > cursor;
  });

  return cursorIndex === -1 ? 0 : cursorIndex;
}

/**
 * Create pagination metadata for API responses
 */
export function createPaginationMetadata(
  currentPage: number,
  totalPages: number,
  totalItems: number,
  itemsPerPage: number
): {
  page: number;
  pages: number;
  total: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
} {
  return {
    page: currentPage,
    pages: totalPages,
    total: totalItems,
    limit: itemsPerPage,
    hasNext: currentPage < totalPages,
    hasPrev: currentPage > 1,
  };
}
