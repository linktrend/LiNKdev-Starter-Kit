'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, CheckCircle, AlertCircle, XCircle, Loader2, Clock } from 'lucide-react';

interface MagicLinkPageProps {
  params: { locale: string };
}

export default function MagicLinkPage({ params: { locale } }: MagicLinkPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const expires = searchParams.get('expires');

  const [status, setStatus] = useState<'verifying' | 'success' | 'expired' | 'invalid' | 'used'>('verifying');
  const [countdown, setCountdown] = useState(2);
  const [timeRemaining, setTimeRemaining] = useState(0);

  // Calculate time remaining
  useEffect(() => {
    if (expires) {
      const expiryTime = parseInt(expires);
      const now = Date.now();
      const remaining = Math.max(0, Math.floor((expiryTime - now) / 1000));
      setTimeRemaining(remaining);
    }
  }, [expires]);

  // Countdown for time remaining
  useEffect(() => {
    if (timeRemaining > 0) {
      const timer = setTimeout(() => setTimeRemaining(timeRemaining - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeRemaining]);

  // Verify magic link
  useEffect(() => {
    if (!token || !expires) {
      setStatus('invalid');
      return;
    }

    const expiryTime = parseInt(expires);
    const now = Date.now();

    // Mock verification logic
    setTimeout(() => {
      if (now > expiryTime) {
        setStatus('expired');
      } else if (token === 'used') {
        setStatus('used');
      } else {
        setStatus('success');
      }
    }, 1500);
  }, [token, expires]);

  // Countdown for redirect
  useEffect(() => {
    if (status === 'success' && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (status === 'success' && countdown === 0) {
      router.push(`/${locale}/dashboard`);
    }
  }, [status, countdown, router, locale]);

  const renderContent = () => {
    switch (status) {
      case 'verifying':
        return (
          <div className="text-center space-y-4">
            <div className="flex justify-center pt-4">
              <Loader2 className="h-12 w-12 text-primary animate-spin" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-2">Verifying your link...</h2>
              <p className="text-muted-foreground">
                Please wait while we verify your magic link
              </p>
            </div>
            {timeRemaining > 0 && (
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>
                  Link valid for {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
                </span>
              </div>
            )}
          </div>
        );

      case 'success':
        return (
          <div className="text-center space-y-4">
            <div className="flex justify-center pt-4">
              <div className="rounded-full bg-green-100 dark:bg-green-900/20 p-4">
                <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-500" />
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-2">You&apos;re logged in!</h2>
              <p className="text-muted-foreground mb-4">
                Redirecting you to your dashboard...
              </p>
              <Badge variant="outline" className="text-sm">
                Redirecting in {countdown}s
              </Badge>
            </div>
          </div>
        );

      case 'expired':
        return (
          <div className="text-center space-y-4">
            <div className="flex justify-center pt-4">
              <div className="rounded-full bg-amber-100 dark:bg-amber-900/20 p-4">
                <AlertCircle className="h-12 w-12 text-amber-600 dark:text-amber-500" />
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-2">Link expired</h2>
              <p className="text-muted-foreground mb-6">
                This magic link has expired. Magic links are valid for 5 minutes.
              </p>
              <Button asChild className="w-full">
                <Link href={`/${locale}/login`}>
                  Request new link
                </Link>
              </Button>
            </div>
          </div>
        );

      case 'used':
        return (
          <div className="text-center space-y-4">
            <div className="flex justify-center pt-4">
              <div className="rounded-full bg-blue-100 dark:bg-blue-900/20 p-4">
                <CheckCircle className="h-12 w-12 text-blue-600 dark:text-blue-500" />
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-2">Link already used</h2>
              <p className="text-muted-foreground mb-6">
                This magic link has already been used. Each link can only be used once.
              </p>
              <Button asChild className="w-full">
                <Link href={`/${locale}/login`}>
                  Return to login
                </Link>
              </Button>
            </div>
          </div>
        );

      case 'invalid':
        return (
          <div className="text-center space-y-4">
            <div className="flex justify-center pt-4">
              <div className="rounded-full bg-red-100 dark:bg-red-900/20 p-4">
                <XCircle className="h-12 w-12 text-red-600 dark:text-red-500" />
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-2">Invalid link</h2>
              <p className="text-muted-foreground mb-6">
                This magic link is invalid or malformed. Please request a new one.
              </p>
              <Button asChild className="w-full">
                <Link href={`/${locale}/login`}>
                  Return to login
                </Link>
              </Button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <Sparkles className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">
              LTM Starter Kit
            </h1>
          </div>
        </div>

        <Card className="bg-gradient-to-br from-[hsl(var(--gradient-brand-from))]/12 to-[hsl(var(--gradient-brand-to))]/25">
          <CardContent className="p-8">
            {renderContent()}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
