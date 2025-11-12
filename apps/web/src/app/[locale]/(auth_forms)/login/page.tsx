'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { countryCodes } from '@/data/countryCodes';
import { Sparkles, CheckCircle, AlertCircle, Clock, Mail, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoginPageProps {
  params: { locale: string };
}

export default function LoginPage({ params: { locale } }: LoginPageProps) {
  const router = useRouter();
  const [authMethod, setAuthMethod] = useState<'social' | 'email' | 'phone'>('social');
  const [email, setEmail] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpMethod, setOtpMethod] = useState<'whatsapp' | 'sms'>('whatsapp');
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [canResend, setCanResend] = useState(false);
  
  // Extract country code from selected country string
  const countryCode = selectedCountry ? selectedCountry.split(' ').pop() || '+1' : '+1';

  // Countdown timer for magic link expiration
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Resend timer (30 seconds)
  useEffect(() => {
    if (!canResend && (showSuccess && authMethod === 'phone')) {
      const timer = setTimeout(() => setCanResend(true), 30000);
      return () => clearTimeout(timer);
    }
  }, [canResend, showSuccess, authMethod]);

  const handleSocialLogin = (provider: string) => {
    console.log(`Logging in with ${provider}`);
    // Mock: Social login always succeeds
    router.push(`/${locale}/dashboard`);
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    // Mock: Send magic link
    console.log('Sending magic link to', email);
    
    // Simulate API call
    setTimeout(() => {
      setShowSuccess(true);
      setCountdown(300); // 5 minutes = 300 seconds
      setCanResend(false);
    }, 500);
  };

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCountry || !phoneNumber) {
      setShowError(true);
      setErrorMessage('Please select a country code and enter your phone number');
      return;
    }

    // Mock: Send OTP
    console.log(`Sending ${otpMethod} OTP to ${countryCode}${phoneNumber}`);
    
    // Simulate API call
    setTimeout(() => {
      setShowSuccess(true);
      setCanResend(false);
      // Redirect to OTP verification page after showing success
      setTimeout(() => {
        router.push(`/${locale}/verify_otp?phone=${encodeURIComponent(countryCode + phoneNumber)}&method=${otpMethod}`);
      }, 2000);
    }, 500);
  };

  const handleResendCode = () => {
    if (!canResend) return;
    
    if (authMethod === 'email') {
      console.log('Resending magic link to', email);
      setCountdown(300);
      setCanResend(false);
    } else if (authMethod === 'phone') {
      console.log(`Resending ${otpMethod} OTP to ${countryCode}${phoneNumber}`);
      setCanResend(false);
      setTimeout(() => setCanResend(true), 30000);
    }
  };

  const renderAuthMethod = () => {
    switch (authMethod) {
      case 'email':
        if (showSuccess) {
          return (
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
              {countdown === 0 && (
                <Button onClick={handleResendCode} className="w-full">
                  Request New Link
                </Button>
              )}
              <Button variant="ghost" className="w-full" onClick={() => {
                setShowSuccess(false);
                setAuthMethod('social');
              }}>
                Back to Login
              </Button>
            </div>
          );
        }

        return (
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">
                We&apos;ll send you a magic link (valid for 5 minutes)
              </p>
            </div>
            <Button type="submit" className="w-full">
              <Mail className="mr-2 h-4 w-4" />
              Send Magic Link
            </Button>
            <Button type="button" variant="ghost" className="w-full" onClick={() => setAuthMethod('social')}>
              Back
            </Button>
          </form>
        );
      
      case 'phone':
        if (showSuccess) {
          return (
            <div className="space-y-4">
              <div className="rounded-lg bg-green-50 dark:bg-green-950/20 p-4 border border-green-200 dark:border-green-800">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-500 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-green-900 dark:text-green-100 mb-1">
                      Code sent via {otpMethod === 'whatsapp' ? 'WhatsApp' : 'SMS'}!
                    </h3>
                    <p className="text-sm text-green-800 dark:text-green-200">
                      Check your {otpMethod === 'whatsapp' ? 'WhatsApp' : 'messages'} at <strong>{countryCode} {phoneNumber}</strong>
                    </p>
                  </div>
                </div>
              </div>
              <p className="text-xs text-center text-muted-foreground">
                Redirecting to verification page...
              </p>
            </div>
          );
        }

        if (showError) {
          return (
            <div className="space-y-4">
              <div className="rounded-lg bg-red-50 dark:bg-red-950/20 p-4 border border-red-200 dark:border-red-800">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-500 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-red-900 dark:text-red-100 mb-1">
                      Error
                    </h3>
                    <p className="text-sm text-red-800 dark:text-red-200">
                      {errorMessage}
                    </p>
                  </div>
                </div>
              </div>
              <Button onClick={() => setShowError(false)} className="w-full">
                Try Again
              </Button>
            </div>
          );
        }

        return (
          <form onSubmit={handlePhoneSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone number</Label>
              <div className="flex gap-2">
                <Select
                  onValueChange={(value) => setSelectedCountry(value)}
                  value={selectedCountry}
                >
                  <SelectTrigger className="w-1/3">
                    <SelectValue placeholder="Country" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {countryCodes.sort((a, b) => a.country.localeCompare(b.country)).map((country, index) => (
                      <SelectItem key={`${country.code}-${country.country}-${index}`} value={`${country.country} ${country.code}`}>
                        {country.country} {country.code}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Enter your phone number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="flex-2"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Send code via</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant={otpMethod === 'whatsapp' ? 'default' : 'outline'}
                  onClick={() => setOtpMethod('whatsapp')}
                  className="w-full"
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  WhatsApp
                </Button>
                <Button
                  type="button"
                  variant={otpMethod === 'sms' ? 'default' : 'outline'}
                  onClick={() => setOtpMethod('sms')}
                  className="w-full"
                >
                  <Mail className="mr-2 h-4 w-4" />
                  SMS
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                You&apos;ll receive a 6-digit verification code
              </p>
            </div>

            <Button type="submit" className="w-full">
              Send Code via {otpMethod === 'whatsapp' ? 'WhatsApp' : 'SMS'}
            </Button>
            <Button type="button" variant="ghost" className="w-full" onClick={() => setAuthMethod('social')}>
              Back
            </Button>
          </form>
        );

      case 'social':
      default:
        return (
          <>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => handleSocialLogin('Gmail')}
                className="flex items-center justify-center p-4 rounded-lg border bg-background hover:bg-accent transition-all"
                aria-label="Log in with Gmail"
              >
                <svg className="h-6 w-6" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              </button>
              <button
                onClick={() => handleSocialLogin('Apple')}
                className="flex items-center justify-center p-4 rounded-lg border bg-background hover:bg-accent transition-all"
                aria-label="Log in with Apple"
              >
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                </svg>
              </button>
              <button
                onClick={() => handleSocialLogin('Microsoft')}
                className="flex items-center justify-center p-4 rounded-lg border bg-background hover:bg-accent transition-all"
                aria-label="Log in with Microsoft"
              >
                <svg className="h-6 w-6" viewBox="0 0 24 24">
                  <path fill="#f25022" d="M0 0h11.377v11.372H0z"/>
                  <path fill="#00a4ef" d="M12.623 0H24v11.372H12.623z"/>
                  <path fill="#7fba00" d="M0 12.628h11.377V24H0z"/>
                  <path fill="#ffb900" d="M12.623 12.628H24V24H12.623z"/>
                </svg>
              </button>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex-grow border-t border-border"></div>
              <span className="relative z-10 bg-background px-2 text-xs uppercase text-muted-foreground rounded">OR</span>
              <div className="flex-grow border-t border-border"></div>
            </div>

            <Button variant="outline" className="w-full" onClick={() => setAuthMethod('email')}>
              Continue with Email
            </Button>
            <Button variant="outline" className="w-full" onClick={() => setAuthMethod('phone')}>
              Continue with Phone
            </Button>
            <Button type="button" variant="ghost" className="w-full" onClick={() => window.history.back()}>
              Back
            </Button>
          </>
        );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <Sparkles className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">
              Welcome to LTM Starter Kit
            </h1>
          </div>
          <p className="text-muted-foreground">Log in to your account</p>
        </div>

        <Card className="border bg-card text-card-foreground shadow-xl transition-colors">
          <CardContent className="space-y-6 pt-6">
            {renderAuthMethod()}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
