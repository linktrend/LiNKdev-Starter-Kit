'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { countryCodes } from '@/data/countryCodes';
import { Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { signInWithOAuth } from '@/utils/auth-helpers/client';
import { useToast } from '@/components/ui/use-toast';
import { getClient } from '@/lib/auth/client';
import { isValidEmail, isValidE164Phone, sanitizePhoneNumber } from '@/lib/auth/validation';
import { parseAuthError } from '@/lib/auth/errors';
import { EmailSentConfirmation } from '@/components/auth/EmailSentConfirmation';

const handleAuthError = (authError: { message?: string }) => ({
  message: authError?.message ?? 'Authentication failed. Please try again.',
});

interface LoginPageProps {
  params: { locale: string };
}

export default function LoginPage({ params: { locale } }: LoginPageProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [authMethod, setAuthMethod] = useState<'social' | 'email' | 'phone' | 'email-sent'>('social');
  const [email, setEmail] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Extract country code from selected country string
  const countryCode = selectedCountry ? selectedCountry.split(' ').pop() || '+1' : '+1';

  const handleSocialLogin = async (provider: 'google' | 'apple' | 'azure') => {
    setIsLoading(true);
    setLoadingProvider(provider);

    try {
      await signInWithOAuth(provider);
      // OAuth redirect will happen automatically
    } catch (error) {
      console.error('OAuth error:', error);
      setIsLoading(false);
      setLoadingProvider(null);
      
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      
      toast({
        title: 'Login Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!email || !isValidEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const supabase = getClient();
      const { error: authError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      
      if (authError) {
        const errorInfo = handleAuthError(authError);
        setError(errorInfo.message);
        return;
      }
      
      // Show "Check your email" state
      setAuthMethod('email-sent');
    } catch (err: any) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendEmail = async () => {
    const supabase = getClient();
    const { error: authError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    
    if (authError) {
      const errorInfo = parseAuthError(authError);
      setError(errorInfo.message);
      throw authError;
    }
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!selectedCountry) {
      setError('Please select a country code');
      return;
    }
    
    if (!phoneNumber) {
      setError('Please enter your phone number');
      return;
    }
    
    // Validate phone format (E.164)
    const sanitizedPhone = sanitizePhoneNumber(phoneNumber);
    const fullPhone = `${countryCode}${sanitizedPhone}`;
    
    if (!isValidE164Phone(fullPhone)) {
      setError('Invalid phone number format');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const supabase = getClient();
      const { error: authError } = await supabase.auth.signInWithOtp({
        phone: fullPhone,
      });
      
      if (authError) {
        const errorInfo = parseAuthError(authError);
        setError(errorInfo.message);
        return;
      }
      
      // Redirect to OTP verification page
      router.push(`/${locale}/verify_otp?phone=${encodeURIComponent(fullPhone)}`);
    } catch (err: any) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderAuthMethod = () => {
    switch (authMethod) {
      case 'email-sent':
        return (
          <EmailSentConfirmation
            email={email}
            onResend={handleResendEmail}
            onBack={() => setAuthMethod('social')}
          />
        );
      
      case 'email':
        return (
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg bg-red-50 dark:bg-red-950/20 p-3 border border-red-200 dark:border-red-800">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-500 mt-0.5" />
                  <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Sending...' : 'Send Magic Link'}
            </Button>
            <Button type="button" variant="ghost" className="w-full" onClick={() => setAuthMethod('social')} disabled={isLoading}>
              Back
            </Button>
          </form>
        );
      
      case 'phone':
        return (
          <form onSubmit={handlePhoneSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg bg-red-50 dark:bg-red-950/20 p-3 border border-red-200 dark:border-red-800">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-500 mt-0.5" />
                  <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="phone">Phone number</Label>
              <div className="flex gap-2">
                <Select value={selectedCountry || undefined} onValueChange={setSelectedCountry} disabled={isLoading}>
                  <SelectTrigger className="w-[100px]">
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
                  className="flex-1"
                  disabled={isLoading}
                  required
                />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Sending...' : 'Send Verification Code'}
            </Button>
            <Button type="button" variant="ghost" className="w-full" onClick={() => setAuthMethod('social')} disabled={isLoading}>
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
                onClick={() => handleSocialLogin('google')}
                disabled={isLoading}
                className="flex items-center justify-center p-4 rounded-lg border bg-background hover:bg-accent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Log in with Google"
              >
                {loadingProvider === 'google' ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <svg className="h-6 w-6 text-primary" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                )}
              </button>
              <button
                onClick={() => handleSocialLogin('apple')}
                disabled={isLoading}
                className="flex items-center justify-center p-4 rounded-lg border bg-background hover:bg-accent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Log in with Apple"
              >
                {loadingProvider === 'apple' ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                  </svg>
                )}
              </button>
              <button
                onClick={() => handleSocialLogin('azure')}
                disabled={isLoading}
                className="flex items-center justify-center p-4 rounded-lg border bg-background hover:bg-accent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Log in with Microsoft"
              >
                {loadingProvider === 'azure' ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <svg className="h-6 w-6 text-primary" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M0 0h11.377v11.372H0z" />
                    <path d="M12.623 0H24v11.372H12.623z" />
                    <path d="M0 12.628h11.377V24H0z" />
                    <path d="M12.623 12.628H24V24H12.623z" />
                  </svg>
                )}
              </button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">OR</span>
              </div>
            </div>

            <Button variant="outline" className="w-full" onClick={() => setAuthMethod('email')}>
              Continue with Email
            </Button>
            <Button variant="outline" className="w-full" onClick={() => setAuthMethod('phone')}>
              Continue with Phone
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

        <Card>
          <CardHeader>
            <CardDescription className="text-2xl font-semibold leading-none tracking-tight">
              Welcome back! Please log in to continue
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {renderAuthMethod()}
            
            <div className="flex items-start space-x-2">
              <Checkbox 
                id="terms" 
                defaultChecked={true}
              />
              <label
                htmlFor="terms"
                className="text-sm text-muted-foreground leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                By continuing, I agree to the{" "}
                <Link href={`/${locale}/terms`} className="text-primary hover:underline">
                  Terms of Use
                </Link>{" "}
                and{" "}
                <Link href={`/${locale}/privacy`} className="text-primary hover:underline">
                  Privacy Policy
                </Link>
              </label>
            </div>
            
            <div className="text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link href={`/${locale}/signup`} className="text-primary hover:underline">
                Sign up
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
