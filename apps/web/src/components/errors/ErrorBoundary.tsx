'use client';

import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

import { logClientError } from '@/lib/errors/client-logger';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type ErrorBoundaryProps = {
  children: React.ReactNode;
  orgId?: string;
  fallback?: React.ReactNode;
  onError?: (error: Error) => void;
};

type ErrorBoundaryState = {
  hasError: boolean;
  message?: string;
};

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, message: error.message };
  }

  async componentDidCatch(error: Error, info: React.ErrorInfo) {
    await logClientError(error, {
      orgId: this.props.orgId || undefined,
      componentStack: info.componentStack || undefined,
      metadata: { boundary: 'app-root' },
    });

    this.props.onError?.(error);
  }

  private handleReset = () => {
    this.setState({ hasError: false, message: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="min-h-screen flex items-center justify-center p-6">
          <Card className="max-w-md w-full">
            <CardHeader className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                <CardTitle>Something went wrong</CardTitle>
              </div>
              <p className="text-sm text-muted-foreground">
                The console encountered an unexpected error. A report was sent to the error tracker.
              </p>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <div className="text-xs text-muted-foreground">
                {this.state.message ?? 'Unknown error'}
              </div>
              <Button variant="outline" size="sm" onClick={this.handleReset}>
                <RefreshCw className="h-4 w-4 mr-1" />
                Retry
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
