import { describe, it, expect } from 'vitest';
import { parseAuthError, getErrorToastMessage, isRetryableError, getProviderDisplayName } from '@/lib/auth/errors';

describe('Auth Error Handling', () => {
  it('should identify rate limit errors', () => {
    const error = { message: 'Too many requests' };
    const result = parseAuthError(error);
    
    expect(result.type).toBe('rate_limit');
    expect(result.title).toBe('Too Many Attempts');
    expect(result.retryable).toBe(false);
  });

  it('should identify user cancelled errors', () => {
    const error = { code: 'access_denied', message: 'User cancelled' };
    const result = parseAuthError(error);
    
    expect(result.type).toBe('user_cancelled');
    expect(result.title).toBe('Sign-in Cancelled');
    expect(result.retryable).toBe(true);
  });

  it('should identify network errors', () => {
    const error = { message: 'Network request failed' };
    const result = parseAuthError(error);
    
    expect(result.type).toBe('network_error');
    expect(result.title).toBe('Network Error');
    expect(result.retryable).toBe(true);
  });

  it('should identify provider errors', () => {
    const error = { code: 'oauth_error', message: 'Provider error' };
    const result = parseAuthError(error);
    
    expect(result.type).toBe('provider_error');
    expect(result.title).toBe('Provider Error');
    expect(result.retryable).toBe(true);
  });

  it('should identify invalid session errors', () => {
    const error = { message: 'Invalid session token' };
    const result = parseAuthError(error);
    
    expect(result.type).toBe('invalid_session');
    expect(result.title).toBe('Authentication Failed');
    expect(result.retryable).toBe(true);
  });

  it('should handle unknown errors', () => {
    const error = { message: 'Something went wrong' };
    const result = parseAuthError(error);
    
    expect(result.type).toBe('unknown_error');
    expect(result.title).toBe('Authentication Error');
    expect(result.retryable).toBe(true);
  });

  it('should get toast messages', () => {
    const error = { message: 'Test error' };
    const toast = getErrorToastMessage(error);
    
    expect(toast.title).toBeDefined();
    expect(toast.description).toBeDefined();
  });

  it('should check if error is retryable', () => {
    expect(isRetryableError({ message: 'Network error' })).toBe(true);
    expect(isRetryableError({ message: 'rate limit exceeded' })).toBe(false);
  });

  it('should get provider display names', () => {
    expect(getProviderDisplayName('google')).toBe('Google');
    expect(getProviderDisplayName('azure')).toBe('Microsoft');
    expect(getProviderDisplayName('unknown')).toBe('unknown');
  });
});
