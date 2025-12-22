import { describe, it, expect } from 'vitest';
import { parseRateLimitError } from '@/lib/auth/rate-limit';

describe('Rate Limit Utilities', () => {
  it('should detect rate limit errors by status code', () => {
    const error = { status: 429, message: 'Too many requests' };
    const result = parseRateLimitError(error);
    
    expect(result.isRateLimited).toBe(true);
    expect(result.retryAfter).toBe(60);
  });

  it('should detect rate limit errors by message', () => {
    const error = { message: 'rate limit exceeded' };
    const result = parseRateLimitError(error);
    
    expect(result.isRateLimited).toBe(true);
    expect(result.retryAfter).toBe(60);
  });

  it('should detect "too many" errors', () => {
    const error = { message: 'too many attempts' };
    const result = parseRateLimitError(error);
    
    expect(result.isRateLimited).toBe(true);
  });

  it('should not detect non-rate-limit errors', () => {
    const error = { message: 'Invalid credentials' };
    const result = parseRateLimitError(error);
    
    expect(result.isRateLimited).toBe(false);
    expect(result.retryAfter).toBeUndefined();
  });

  it('should use custom retryAfter if provided', () => {
    const error = { status: 429, retryAfter: 120 };
    const result = parseRateLimitError(error);
    
    expect(result.isRateLimited).toBe(true);
    expect(result.retryAfter).toBe(120);
  });
});
