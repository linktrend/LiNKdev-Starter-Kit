import { describe, it, expect } from 'vitest';
import { handleAuthError, getErrorMessage } from '@/lib/auth/errors';

describe('Auth Error Handling', () => {
  it('should identify rate limit errors', () => {
    const error = { status: 429, message: 'Too many requests' };
    const result = handleAuthError(error);
    
    expect(result.type).toBe('rate_limit');
    expect(result.message).toBe('Too many attempts. Please try again later.');
    expect(result.retryAfter).toBe(60);
  });

  it('should identify invalid credentials errors', () => {
    const error = { message: 'Invalid login credentials' };
    const result = handleAuthError(error);
    
    expect(result.type).toBe('invalid_credentials');
    expect(result.message).toBe('Invalid login credentials');
  });

  it('should identify expired token errors', () => {
    const error = { message: 'Token has expired' };
    const result = handleAuthError(error);
    
    expect(result.type).toBe('expired');
    expect(result.message).toBe('This link or code has expired. Please request a new one.');
  });

  it('should identify network errors', () => {
    const error = { message: 'Network request failed' };
    const result = handleAuthError(error);
    
    expect(result.type).toBe('network');
    expect(result.message).toBe('Network error. Please check your connection and try again.');
  });

  it('should handle unknown errors', () => {
    const error = { message: 'Something went wrong' };
    const result = handleAuthError(error);
    
    expect(result.type).toBe('unknown');
    expect(result.message).toBe('Something went wrong');
  });

  it('should extract error messages', () => {
    const error = { message: 'Test error message' };
    expect(getErrorMessage(error)).toBe('Test error message');
  });
});
