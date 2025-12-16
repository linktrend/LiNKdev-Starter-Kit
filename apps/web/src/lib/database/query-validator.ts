/**
 * SQL Query Validator for Database Console
 * Enforces read-only queries and prevents SQL injection
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  sanitizedQuery?: string;
}

// Dangerous SQL keywords that should be blocked
const WRITE_OPERATIONS = [
  'INSERT',
  'UPDATE',
  'DELETE',
  'DROP',
  'CREATE',
  'ALTER',
  'TRUNCATE',
  'GRANT',
  'REVOKE',
  'EXECUTE',
  'EXEC',
  'CALL',
  'MERGE',
  'REPLACE',
  'RENAME',
  'COMMENT',
];

// Additional dangerous patterns
const DANGEROUS_PATTERNS = [
  /;\s*(INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|TRUNCATE|GRANT|REVOKE)/gi,
  /--\s*$/gm, // SQL comments at end of line
  /\/\*[\s\S]*?\*\//g, // Block comments (can hide malicious code)
];

const MAX_QUERY_LENGTH = 10000; // 10KB max
const MAX_RESULT_LIMIT = 1000;

/**
 * Validate SQL query for read-only operations
 */
export function validateQuery(query: string): ValidationResult {
  if (!query || typeof query !== 'string') {
    return {
      isValid: false,
      error: 'Query must be a non-empty string',
    };
  }

  const trimmedQuery = query.trim();

  // Check query length
  if (trimmedQuery.length === 0) {
    return {
      isValid: false,
      error: 'Query cannot be empty',
    };
  }

  if (trimmedQuery.length > MAX_QUERY_LENGTH) {
    return {
      isValid: false,
      error: `Query exceeds maximum length of ${MAX_QUERY_LENGTH} characters`,
    };
  }

  // Remove comments for validation (but keep original for execution)
  const queryWithoutComments = removeComments(trimmedQuery);

  // Check for write operations
  const writeOpCheck = checkForWriteOperations(queryWithoutComments);
  if (!writeOpCheck.isValid) {
    return writeOpCheck;
  }

  // Check for dangerous patterns
  const patternCheck = checkDangerousPatterns(queryWithoutComments);
  if (!patternCheck.isValid) {
    return patternCheck;
  }

  // Ensure query starts with SELECT or WITH (for CTEs)
  const startsWithSelect = /^\s*(SELECT|WITH)\s+/i.test(queryWithoutComments);
  if (!startsWithSelect) {
    return {
      isValid: false,
      error: 'Only SELECT queries are allowed. Query must start with SELECT or WITH.',
    };
  }

  // Check for LIMIT clause and enforce maximum
  const limitCheck = validateLimit(queryWithoutComments);
  if (!limitCheck.isValid) {
    return limitCheck;
  }

  return {
    isValid: true,
    sanitizedQuery: trimmedQuery,
  };
}

/**
 * Remove SQL comments from query
 */
function removeComments(query: string): string {
  // Remove single-line comments
  let cleaned = query.replace(/--[^\n]*/g, '');
  // Remove block comments
  cleaned = cleaned.replace(/\/\*[\s\S]*?\*\//g, '');
  return cleaned;
}

/**
 * Check for write operations in query
 */
function checkForWriteOperations(query: string): ValidationResult {
  const upperQuery = query.toUpperCase();

  for (const operation of WRITE_OPERATIONS) {
    // Use word boundaries to avoid false positives (e.g., "inserted_at" column name)
    const regex = new RegExp(`\\b${operation}\\b`, 'i');
    if (regex.test(upperQuery)) {
      return {
        isValid: false,
        error: `Write operation detected: ${operation}. Only read-only SELECT queries are allowed.`,
      };
    }
  }

  return { isValid: true };
}

/**
 * Check for dangerous SQL patterns
 */
function checkDangerousPatterns(query: string): ValidationResult {
  for (const pattern of DANGEROUS_PATTERNS) {
    if (pattern.test(query)) {
      return {
        isValid: false,
        error: 'Query contains potentially dangerous patterns. Please review your query.',
      };
    }
  }

  return { isValid: true };
}

/**
 * Validate and enforce LIMIT clause
 */
function validateLimit(query: string): ValidationResult {
  const limitMatch = query.match(/LIMIT\s+(\d+)/i);

  if (limitMatch) {
    const limit = parseInt(limitMatch[1], 10);
    if (limit > MAX_RESULT_LIMIT) {
      return {
        isValid: false,
        error: `LIMIT clause cannot exceed ${MAX_RESULT_LIMIT} rows. Please reduce your LIMIT value.`,
      };
    }
  } else {
    // If no LIMIT clause, warn but allow (will be enforced server-side)
    // This is just a validation warning
  }

  return { isValid: true };
}

/**
 * Sanitize error messages to prevent information leakage
 */
export function sanitizeErrorMessage(error: unknown): string {
  if (!error) {
    return 'An unknown error occurred';
  }

  const errorMessage = error instanceof Error ? error.message : String(error);

  // Remove connection strings
  let sanitized = errorMessage.replace(
    /postgresql:\/\/[^\s]+/gi,
    '[connection string removed]'
  );

  // Remove potential passwords
  sanitized = sanitized.replace(/password[=:]\s*[^\s;]+/gi, 'password=[redacted]');

  // Remove host information
  sanitized = sanitized.replace(/host[=:]\s*[^\s;]+/gi, 'host=[redacted]');

  // Remove port information
  sanitized = sanitized.replace(/port[=:]\s*\d+/gi, 'port=[redacted]');

  // If error contains "relation" (table doesn't exist), keep it as it's useful
  // If error contains "column" (column doesn't exist), keep it as it's useful
  // Otherwise, provide a generic message

  if (sanitized.includes('relation') || sanitized.includes('column')) {
    return sanitized;
  }

  if (sanitized.includes('syntax error')) {
    return 'SQL syntax error. Please check your query syntax.';
  }

  if (sanitized.includes('permission denied')) {
    return 'Permission denied. You may not have access to this resource.';
  }

  if (sanitized.includes('timeout') || sanitized.includes('timed out')) {
    return 'Query execution timed out. Please simplify your query or add more specific filters.';
  }

  // Return sanitized message if it seems safe
  if (sanitized.length < 200 && !sanitized.includes('postgresql://')) {
    return sanitized;
  }

  return 'An error occurred while executing the query. Please check your syntax and try again.';
}

/**
 * Get maximum allowed result limit
 */
export function getMaxResultLimit(): number {
  return MAX_RESULT_LIMIT;
}
