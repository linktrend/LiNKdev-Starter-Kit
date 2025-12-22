'use client';

import { AlertCircle, RefreshCw, XCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { parseAuthError, type AuthErrorType } from '@/lib/auth/errors';

interface AuthErrorProps {
  error: any;
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
}

/**
 * Reusable error display component for authentication errors
 */
export function AuthError({ error, onRetry, onDismiss, className }: AuthErrorProps) {
  const parsedError = parseAuthError(error);

  const getIcon = (type: AuthErrorType) => {
    switch (type) {
      case 'rate_limit':
      case 'configuration_error':
        return <XCircle className="h-5 w-5" />;
      default:
        return <AlertCircle className="h-5 w-5" />;
    }
  };

  const getVariant = (type: AuthErrorType): 'default' | 'destructive' => {
    switch (type) {
      case 'user_cancelled':
        return 'default';
      default:
        return 'destructive';
    }
  };

  return (
    <Alert variant={getVariant(parsedError.type)} className={className}>
      <div className="flex items-start gap-3">
        {getIcon(parsedError.type)}
        <div className="flex-1">
          <AlertTitle>{parsedError.title}</AlertTitle>
          <AlertDescription className="mt-1">{parsedError.message}</AlertDescription>
          {(parsedError.retryable && onRetry) || onDismiss ? (
            <div className="mt-3 flex gap-2">
              {parsedError.retryable && onRetry && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onRetry}
                  className="gap-2"
                >
                  <RefreshCw className="h-3 w-3" />
                  {parsedError.action || 'Try Again'}
                </Button>
              )}
              {onDismiss && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={onDismiss}
                >
                  Dismiss
                </Button>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </Alert>
  );
}

/**
 * Inline error message for forms
 */
export function InlineAuthError({ error, className }: { error: any; className?: string }) {
  const parsedError = parseAuthError(error);

  return (
    <div className={`flex items-start gap-2 text-sm text-destructive ${className || ''}`}>
      <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
      <p>{parsedError.message}</p>
    </div>
  );
}
