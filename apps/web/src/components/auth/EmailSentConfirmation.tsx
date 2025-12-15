'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mail, CheckCircle, Clock } from 'lucide-react';
import { useResendCountdown } from '@/lib/auth/rate-limit';

interface EmailSentConfirmationProps {
  email: string;
  onResend: () => Promise<void>;
  onBack: () => void;
}

export function EmailSentConfirmation({ email, onResend, onBack }: EmailSentConfirmationProps) {
  const [isResending, setIsResending] = useState(false);
  const { secondsRemaining, canResend, reset } = useResendCountdown(30);

  const handleResend = async () => {
    setIsResending(true);
    try {
      await onResend();
      reset();
    } catch (error) {
      // Error handling done by parent
    } finally {
      setIsResending(false);
    }
  };

  return (
    <Card className="bg-gradient-to-br from-[hsl(var(--gradient-brand-from))]/12 to-[hsl(var(--gradient-brand-to))]/25">
      <CardContent className="space-y-6 pt-6">
        <div className="text-center space-y-4">
          <div className="flex justify-center pt-4">
            <div className="rounded-full bg-green-100 dark:bg-green-900/20 p-4">
              <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-500" />
            </div>
          </div>
          
          <div>
            <h2 className="text-2xl font-bold mb-2">Check your email</h2>
            <p className="text-muted-foreground mb-2">
              We sent a magic link to
            </p>
            <Badge variant="outline" className="text-sm font-medium">
              <Mail className="h-3 w-3 mr-1" />
              {email}
            </Badge>
          </div>

          <div className="rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground">
            <p className="mb-2">Click the link in your email to sign in.</p>
            <p>The link will expire in 1 hour.</p>
          </div>
        </div>

        <div className="space-y-2">
          <Button
            variant="outline"
            className="w-full"
            onClick={handleResend}
            disabled={!canResend || isResending}
          >
            {isResending ? (
              'Sending...'
            ) : canResend ? (
              'Resend magic link'
            ) : (
              <>
                <Clock className="h-4 w-4 mr-2" />
                Resend in {secondsRemaining}s
              </>
            )}
          </Button>

          <Button
            variant="ghost"
            className="w-full"
            onClick={onBack}
          >
            Back to login
          </Button>
        </div>

        <p className="text-xs text-center text-muted-foreground">
          Didn&apos;t receive the email? Check your spam folder or try resending.
        </p>
      </CardContent>
    </Card>
  );
}
