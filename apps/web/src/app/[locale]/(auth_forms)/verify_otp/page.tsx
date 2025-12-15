'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Sparkles, CheckCircle, AlertCircle, Clock, MessageSquare, Mail } from 'lucide-react';
import { getClient } from '@/lib/auth/client';
import { parseAuthError } from '@/lib/auth/errors';
import { formatPhoneForDisplay } from '@/lib/auth/validation';
import { useResendCountdown } from '@/lib/auth/rate-limit';

interface VerifyOTPPageProps {
  params: { locale: string };
}

export default function VerifyOTPPage({ params: { locale } }: VerifyOTPPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const phone = searchParams.get('phone') || '';

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(600); // 10 minutes = 600 seconds
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { secondsRemaining: resendSeconds, canResend, reset: resetResend } = useResendCountdown(30);

  // Countdown timer for OTP expiry
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Auto-focus first input
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // Handle OTP input change
  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste
      const pastedData = value.slice(0, 6).split('');
      const newOtp = [...otp];
      pastedData.forEach((char, i) => {
        if (index + i < 6 && /^\d$/.test(char)) {
          newOtp[index + i] = char;
        }
      });
      setOtp(newOtp);
      
      // Focus last filled input or next empty
      const nextIndex = Math.min(index + pastedData.length, 5);
      inputRefs.current[nextIndex]?.focus();
      
      // Auto-submit if all filled
      if (newOtp.every(digit => digit !== '')) {
        handleVerify(newOtp.join(''));
      }
      return;
    }

    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Move to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all filled
    if (newOtp.every(digit => digit !== '')) {
      handleVerify(newOtp.join(''));
    }
  };

  // Handle backspace
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Verify OTP
  const handleVerify = async (code: string) => {
    if (isVerifying) return;
    
    setIsVerifying(true);
    setShowError(false);
    
    try {
      const supabase = getClient();
      const { data, error } = await supabase.auth.verifyOtp({
        phone,
        token: code,
        type: 'sms',
      });
      
      if (error) {
        if (error.message.includes('expired') || error.message.includes('Expired')) {
          setErrorMessage('Code expired. Please request a new one.');
        } else if (error.message.includes('invalid') || error.message.includes('Invalid')) {
          setErrorMessage('Incorrect code. Please try again.');
        } else {
          const errorInfo = parseAuthError(error);
          setErrorMessage(errorInfo.message);
        }
        setShowError(true);
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
        return;
      }
      
      // Success - redirect to dashboard
      setShowSuccess(true);
      setTimeout(() => {
        router.push(`/${locale}/dashboard`);
      }, 2000);
    } catch (err: any) {
      setErrorMessage('Verification failed. Please try again.');
      setShowError(true);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsVerifying(false);
    }
  };

  // Resend code
  const handleResend = async () => {
    if (!canResend) return;

    try {
      const supabase = getClient();
      const { error } = await supabase.auth.signInWithOtp({
        phone,
      });
      
      if (error) {
        const errorInfo = parseAuthError(error);
        setErrorMessage(errorInfo.message);
        setShowError(true);
        return;
      }
      
      resetResend();
      setCountdown(600);
      setOtp(['', '', '', '', '', '']);
      setShowError(false);
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      setErrorMessage('Failed to resend code. Please try again.');
      setShowError(true);
    }
  };

  // Mask phone number
  const maskedPhone = formatPhoneForDisplay(phone);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <Sparkles className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">
              Verify Your Phone
            </h1>
          </div>
          <p className="text-muted-foreground">
            Enter the 6-digit code sent to
          </p>
          <p className="text-sm font-medium mt-1">{maskedPhone}</p>
          <Badge variant="outline" className="mt-2">
            <MessageSquare className="h-3 w-3 mr-1" />
            SMS
          </Badge>
        </div>

        <Card className="bg-gradient-to-br from-[hsl(var(--gradient-brand-from))]/12 to-[hsl(var(--gradient-brand-to))]/25">
          <CardContent className="space-y-6 pt-6">
            {showSuccess ? (
              <div className="rounded-lg bg-green-50 dark:bg-green-950/20 p-4 border border-green-200 dark:border-green-800">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-500 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-green-900 dark:text-green-100 mb-1">
                      Code verified!
                    </h3>
                    <p className="text-sm text-green-800 dark:text-green-200">
                      Logging you in...
                    </p>
                  </div>
                </div>
              </div>
            ) : showError ? (
              <div className="space-y-4">
                <div className="rounded-lg bg-red-50 dark:bg-red-950/20 p-4 border border-red-200 dark:border-red-800">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-500 mt-0.5" />
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-red-900 dark:text-red-100 mb-1">
                        Verification failed
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
            ) : (
              <>
                {/* OTP Input */}
                <div className="flex justify-center gap-2">
                  {otp.map((digit, index) => (
                    <Input
                      key={index}
                      ref={(el) => {
                        inputRefs.current[index] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className="w-12 h-14 text-center text-xl font-semibold"
                    />
                  ))}
                </div>

                {/* Timer */}
                <div className="text-center">
                  {countdown > 0 ? (
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>
                        Code expires in {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, '0')}
                      </span>
                    </div>
                  ) : (
                    <Badge variant="destructive">
                      Code expired
                    </Badge>
                  )}
                </div>

                {/* Resend */}
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleResend}
                    disabled={!canResend || countdown === 0}
                  >
                    {canResend ? "Resend code" : `Resend in ${resendSeconds}s`}
                  </Button>
                </div>

                {/* Back */}
                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={() => router.push(`/${locale}/login`)}
                >
                  Back to Login
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {!showSuccess && !showError && (
          <p className="text-xs text-center text-muted-foreground mt-4">
            Didn&apos;t receive the code? Check your messages or try resending.
          </p>
        )}
      </div>
    </div>
  );
}
