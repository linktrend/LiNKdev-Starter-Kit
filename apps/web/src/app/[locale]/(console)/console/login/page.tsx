'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Shield, CheckCircle, AlertCircle, Clock, Mail } from 'lucide-react';
import Link from 'next/link';

interface ConsoleLoginPageProps {
  params: { locale: string };
}

// Mock admin whitelist
const mockAdminWhitelist = [
  'owner@example.com',
  'admin@example.com',
  'admin2@example.com',
];

export default function ConsoleLoginPage({ params: { locale } }: ConsoleLoginPageProps) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [countdown, setCountdown] = useState(0);
  
  // Countdown timer for magic link expiration
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    // Mock: Validate email against whitelist
    const isAuthorized = mockAdminWhitelist.includes(email.toLowerCase());

    if (!isAuthorized) {
      setShowError(true);
      setErrorMessage('This email is not authorized for admin access. Please contact your administrator.');
      return;
    }

    // Mock: Send magic link
    console.log('Sending magic link to authorized admin:', email);
    
    // Simulate API call
    setTimeout(() => {
      setShowSuccess(true);
      setCountdown(300); // 5 minutes = 300 seconds
    }, 500);
  };

  const handleResendLink = () => {
    console.log('Resending magic link to', email);
    setCountdown(300);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">
              Admin & Owner Access
            </h1>
          </div>
          <p className="text-muted-foreground">Authorized personnel only</p>
          <Badge variant="outline" className="mt-2">
            Email-only authentication
          </Badge>
        </div>

        <Card className="bg-gradient-to-br from-[hsl(var(--gradient-brand-from))]/12 to-[hsl(var(--gradient-brand-to))]/25">
          <CardContent className="space-y-6 pt-6">
            {showSuccess ? (
              <div className="space-y-4">
                <div className="rounded-lg bg-green-50 dark:bg-green-950/20 p-4 border border-green-200 dark:border-green-800">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-500 mt-0.5" />
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-green-900 dark:text-green-100 mb-1">
                        Magic link sent!
                      </h3>
                      <p className="text-sm text-green-800 dark:text-green-200 mb-2">
                        Check your email at <strong>{email}</strong> for the magic link.
                      </p>
                      {countdown > 0 ? (
                        <div className="flex items-center gap-2 text-xs text-green-700 dark:text-green-300">
                          <Clock className="h-3 w-3" />
                          <span>Link expires in {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, '0')}</span>
                        </div>
                      ) : (
                        <Badge variant="destructive" className="text-xs">
                          Link expired
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="rounded-md bg-blue-50 dark:bg-blue-950/20 p-3 border border-blue-200 dark:border-blue-800">
                  <p className="text-xs text-blue-800 dark:text-blue-200">
                    <strong>Note:</strong> 2FA will be required after login
                  </p>
                </div>
                {countdown === 0 && (
                  <Button onClick={handleResendLink} className="w-full">
                    Request New Link
                  </Button>
                )}
                <Button variant="ghost" className="w-full" onClick={() => {
                  setShowSuccess(false);
                  setEmail('');
                }}>
                  Back
                </Button>
              </div>
            ) : showError ? (
              <div className="space-y-4">
                <div className="rounded-lg bg-red-50 dark:bg-red-950/20 p-4 border border-red-200 dark:border-red-800">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-500 mt-0.5" />
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-red-900 dark:text-red-100 mb-1">
                        Access denied
                      </h3>
                      <p className="text-sm text-red-800 dark:text-red-200">
                        {errorMessage}
                      </p>
                    </div>
                  </div>
                </div>
                <Button onClick={() => {
                  setShowError(false);
                  setEmail('');
                }} className="w-full">
                  Try Again
                </Button>
                <div className="text-center">
                  <Link href="/contact" className="text-sm text-primary hover:underline">
                    Request access
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Authorized Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Only whitelisted emails can access the console
                  </p>
                </div>
                <Button type="submit" className="w-full">
                  <Mail className="mr-2 h-4 w-4" />
                  Send Magic Link
                </Button>
                <div className="rounded-md bg-amber-50 dark:bg-amber-950/20 p-3 border border-amber-200 dark:border-amber-800">
                  <div className="text-xs text-amber-800 dark:text-amber-200">
                    <p className="font-medium mb-1">Admin & Owner Requirements:</p>
                    <ul className="list-disc list-inside space-y-0.5">
                      <li>Email-only authentication (magic link)</li>
                      <li>Two-factor authentication (2FA) required</li>
                      <li>Access to both App and Console</li>
                    </ul>
                  </div>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
