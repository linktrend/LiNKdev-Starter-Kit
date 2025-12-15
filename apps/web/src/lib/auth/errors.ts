/**
 * Auth error types and utilities for handling OAuth and authentication errors
 */

export type AuthErrorType =
  | 'user_cancelled'
  | 'provider_error'
  | 'network_error'
  | 'rate_limit'
  | 'invalid_session'
  | 'configuration_error'
  | 'unknown_error';

export interface AuthError {
  type: AuthErrorType;
  title: string;
  message: string;
  retryable: boolean;
  action?: string;
}

/**
 * Parse Supabase auth errors into user-friendly messages
 */
export function parseAuthError(error: any): AuthError {
  const errorMessage = error?.message || error?.error_description || String(error);
  const errorCode = error?.code || error?.error;

  // User cancelled OAuth flow
  if (
    errorMessage.includes('cancelled') ||
    errorMessage.includes('denied') ||
    errorCode === 'access_denied'
  ) {
    return {
      type: 'user_cancelled',
      title: 'Sign-in Cancelled',
      message: 'Sign-in was cancelled. Please try again if you want to continue.',
      retryable: true,
      action: 'Try Again',
    };
  }

  // Rate limiting
  if (
    errorMessage.includes('rate limit') ||
    errorMessage.includes('too many requests') ||
    errorCode === 'rate_limit_exceeded'
  ) {
    return {
      type: 'rate_limit',
      title: 'Too Many Attempts',
      message: 'Too many sign-in attempts. Please wait a few minutes and try again.',
      retryable: false,
      action: 'Wait and Retry',
    };
  }

  // Network errors
  if (
    errorMessage.includes('network') ||
    errorMessage.includes('fetch') ||
    errorMessage.includes('connection') ||
    error instanceof TypeError
  ) {
    return {
      type: 'network_error',
      title: 'Network Error',
      message: 'Unable to connect. Please check your internet connection and try again.',
      retryable: true,
      action: 'Retry',
    };
  }

  // Provider-specific errors
  if (
    errorMessage.includes('provider') ||
    errorMessage.includes('oauth') ||
    errorCode === 'oauth_error'
  ) {
    return {
      type: 'provider_error',
      title: 'Provider Error',
      message: 'Unable to connect to the authentication provider. Please try again later.',
      retryable: true,
      action: 'Try Again',
    };
  }

  // Invalid session or token errors
  if (
    errorMessage.includes('session') ||
    errorMessage.includes('token') ||
    errorMessage.includes('invalid') ||
    errorCode === 'invalid_grant'
  ) {
    return {
      type: 'invalid_session',
      title: 'Authentication Failed',
      message: 'Your session is invalid or has expired. Please try signing in again.',
      retryable: true,
      action: 'Sign In Again',
    };
  }

  // Configuration errors (missing env vars, etc)
  if (
    errorMessage.includes('Missing') ||
    errorMessage.includes('configuration') ||
    errorMessage.includes('environment')
  ) {
    return {
      type: 'configuration_error',
      title: 'Configuration Error',
      message: 'Authentication is not properly configured. Please contact support.',
      retryable: false,
      action: 'Contact Support',
    };
  }

  // Default unknown error
  return {
    type: 'unknown_error',
    title: 'Authentication Error',
    message: errorMessage || 'An unexpected error occurred. Please try again.',
    retryable: true,
    action: 'Try Again',
  };
}

/**
 * Get user-friendly provider name
 */
export function getProviderDisplayName(provider: string): string {
  const providerMap: Record<string, string> = {
    google: 'Google',
    apple: 'Apple',
    azure: 'Microsoft',
    github: 'GitHub',
    gitlab: 'GitLab',
    bitbucket: 'Bitbucket',
    facebook: 'Facebook',
    twitter: 'Twitter',
    discord: 'Discord',
    twitch: 'Twitch',
    spotify: 'Spotify',
    linkedin: 'LinkedIn',
  };

  return providerMap[provider.toLowerCase()] || provider;
}

/**
 * Check if error is retryable
 */
export function isRetryableError(error: any): boolean {
  const parsedError = parseAuthError(error);
  return parsedError.retryable;
}

/**
 * Get error message for toast notifications
 */
export function getErrorToastMessage(error: any): { title: string; description: string } {
  const parsedError = parseAuthError(error);
  return {
    title: parsedError.title,
    description: parsedError.message,
  };
}
