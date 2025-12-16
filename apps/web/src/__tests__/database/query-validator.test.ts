/**
 * Query Validator Tests
 * Tests for SQL query validation and security checks
 */

import { describe, it, expect } from 'vitest';
import {
  validateQuery,
  sanitizeErrorMessage,
  getMaxResultLimit,
} from '@/lib/database/query-validator';

describe('validateQuery', () => {
  describe('valid queries', () => {
    it('should accept simple SELECT queries', () => {
      const result = validateQuery('SELECT * FROM users');
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should accept SELECT with WHERE clause', () => {
      const result = validateQuery('SELECT id, name FROM users WHERE active = true');
      expect(result.isValid).toBe(true);
    });

    it('should accept SELECT with JOIN', () => {
      const result = validateQuery(
        'SELECT u.id, o.name FROM users u JOIN organizations o ON u.org_id = o.id'
      );
      expect(result.isValid).toBe(true);
    });

    it('should accept SELECT with LIMIT', () => {
      const result = validateQuery('SELECT * FROM users LIMIT 100');
      expect(result.isValid).toBe(true);
    });

    it('should accept CTE queries starting with WITH', () => {
      const result = validateQuery(
        'WITH active_users AS (SELECT * FROM users WHERE active = true) SELECT * FROM active_users'
      );
      expect(result.isValid).toBe(true);
    });

    it('should accept queries with valid LIMIT under maximum', () => {
      const result = validateQuery('SELECT * FROM users LIMIT 500');
      expect(result.isValid).toBe(true);
    });
  });

  describe('write operations blocking', () => {
    it('should block INSERT queries', () => {
      const result = validateQuery('INSERT INTO users (name) VALUES (\'test\')');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('INSERT');
    });

    it('should block UPDATE queries', () => {
      const result = validateQuery('UPDATE users SET name = \'test\' WHERE id = 1');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('UPDATE');
    });

    it('should block DELETE queries', () => {
      const result = validateQuery('DELETE FROM users WHERE id = 1');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('DELETE');
    });

    it('should block DROP queries', () => {
      const result = validateQuery('DROP TABLE users');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('DROP');
    });

    it('should block CREATE queries', () => {
      const result = validateQuery('CREATE TABLE test (id INT)');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('CREATE');
    });

    it('should block ALTER queries', () => {
      const result = validateQuery('ALTER TABLE users ADD COLUMN test TEXT');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('ALTER');
    });

    it('should block TRUNCATE queries', () => {
      const result = validateQuery('TRUNCATE TABLE users');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('TRUNCATE');
    });

    it('should block GRANT queries', () => {
      const result = validateQuery('GRANT ALL ON users TO public');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('GRANT');
    });

    it('should block REVOKE queries', () => {
      const result = validateQuery('REVOKE ALL ON users FROM public');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('REVOKE');
    });
  });

  describe('SQL injection prevention', () => {
    it('should block queries with multiple statements', () => {
      const result = validateQuery('SELECT * FROM users; DROP TABLE users;');
      expect(result.isValid).toBe(false);
    });

    it('should allow column names with write operation keywords', () => {
      // "inserted_at" contains "INSERT" but should be allowed
      const result = validateQuery('SELECT inserted_at, updated_at FROM users');
      expect(result.isValid).toBe(true);
    });
  });

  describe('LIMIT enforcement', () => {
    it('should reject queries with LIMIT exceeding maximum', () => {
      const maxLimit = getMaxResultLimit();
      const result = validateQuery(`SELECT * FROM users LIMIT ${maxLimit + 1}`);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('LIMIT');
    });

    it('should accept queries with LIMIT at maximum', () => {
      const maxLimit = getMaxResultLimit();
      const result = validateQuery(`SELECT * FROM users LIMIT ${maxLimit}`);
      expect(result.isValid).toBe(true);
    });
  });

  describe('input validation', () => {
    it('should reject empty queries', () => {
      const result = validateQuery('');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('empty');
    });

    it('should reject whitespace-only queries', () => {
      const result = validateQuery('   \n  \t  ');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('empty');
    });

    it('should reject non-string queries', () => {
      const result = validateQuery(null as any);
      expect(result.isValid).toBe(false);
    });

    it('should reject queries that do not start with SELECT or WITH', () => {
      const result = validateQuery('EXPLAIN SELECT * FROM users');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('SELECT');
    });

    it('should reject extremely long queries', () => {
      const longQuery = 'SELECT * FROM users WHERE ' + 'id = 1 OR '.repeat(10000) + 'id = 2';
      const result = validateQuery(longQuery);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('length');
    });
  });
});

describe('sanitizeErrorMessage', () => {
  it('should remove connection strings', () => {
    const error = new Error(
      'Connection failed: postgresql://user:password@localhost:5432/dbname'
    );
    const sanitized = sanitizeErrorMessage(error);
    expect(sanitized).not.toContain('postgresql://');
    expect(sanitized).toContain('[connection string removed]');
  });

  it('should remove passwords', () => {
    const error = new Error('Authentication failed: password=secret123');
    const sanitized = sanitizeErrorMessage(error);
    expect(sanitized).not.toContain('secret123');
    expect(sanitized).toContain('[redacted]');
  });

  it('should remove host information', () => {
    const error = new Error('Connection refused: host=192.168.1.1');
    const sanitized = sanitizeErrorMessage(error);
    expect(sanitized).not.toContain('192.168.1.1');
    expect(sanitized).toContain('[redacted]');
  });

  it('should keep useful error messages about relations', () => {
    const error = new Error('relation "nonexistent_table" does not exist');
    const sanitized = sanitizeErrorMessage(error);
    expect(sanitized).toContain('relation');
    expect(sanitized).toContain('nonexistent_table');
  });

  it('should keep useful error messages about columns', () => {
    const error = new Error('column "invalid_column" does not exist');
    const sanitized = sanitizeErrorMessage(error);
    expect(sanitized).toContain('column');
    expect(sanitized).toContain('invalid_column');
  });

  it('should provide generic message for syntax errors', () => {
    const error = new Error('syntax error at or near "FROM"');
    const sanitized = sanitizeErrorMessage(error);
    expect(sanitized).toContain('syntax error');
  });

  it('should handle timeout errors', () => {
    const error = new Error('Query execution timed out after 10 seconds');
    const sanitized = sanitizeErrorMessage(error);
    expect(sanitized).toContain('timed out');
  });

  it('should handle permission errors', () => {
    const error = new Error('permission denied for table users');
    const sanitized = sanitizeErrorMessage(error);
    expect(sanitized).toContain('Permission denied');
  });

  it('should handle non-Error objects', () => {
    const sanitized = sanitizeErrorMessage('Simple error string');
    expect(sanitized).toBeTruthy();
  });

  it('should handle null/undefined errors', () => {
    const sanitized = sanitizeErrorMessage(null);
    expect(sanitized).toContain('unknown error');
  });
});

describe('getMaxResultLimit', () => {
  it('should return a positive number', () => {
    const limit = getMaxResultLimit();
    expect(limit).toBeGreaterThan(0);
  });

  it('should return 1000 as the maximum limit', () => {
    const limit = getMaxResultLimit();
    expect(limit).toBe(1000);
  });
});
