'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Shield, 
  Smartphone, 
  Key, 
  Copy, 
  Download, 
  AlertTriangle,
  CheckCircle,
  QrCode
} from 'lucide-react';
import { toast } from 'sonner';

const setup2FASchema = z.object({
  verificationCode: z.string().length(6, 'Verification code must be 6 digits'),
});

const disable2FASchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  confirmation: z.string().refine((val) => val === 'DISABLE', {
    message: 'Please type DISABLE to confirm',
  }),
});

type Setup2FAFormData = z.infer<typeof setup2FASchema>;
type Disable2FAFormData = z.infer<typeof disable2FASchema>;

interface Edit2FAModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  is2FAEnabled?: boolean;
}

export function Edit2FAModal({ open, onOpenChange, is2FAEnabled = false }: Edit2FAModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<'setup' | 'verify' | 'recovery' | 'disable'>('setup');

  const setupForm = useForm<Setup2FAFormData>({
    resolver: zodResolver(setup2FASchema),
    defaultValues: { verificationCode: '' },
  });

  const disableForm = useForm<Disable2FAFormData>({
    resolver: zodResolver(disable2FASchema),
    defaultValues: { currentPassword: '', confirmation: 'DISABLE' as const },
  });

  // Mock data - in real app, this would come from the server
  const qrCodeData = 'otpauth://totp/LiNKdev%20Starter%20Kit:user@example.com?secret=JBSWY3DPEHPK3PXP&issuer=LiNKdev%20Starter%20Kit';
  const recoveryCodes = [
    'ABCD-EFGH-IJKL',
    'MNOP-QRST-UVWX',
    'YZ12-3456-7890',
    'ABCD-EFGH-IJKL',
    'MNOP-QRST-UVWX',
    'YZ12-3456-7890',
    'ABCD-EFGH-IJKL',
    'MNOP-QRST-UVWX',
  ];

  const handleSetup2FA = async () => {
    setIsSubmitting(true);
    try {
      // TODO: Implement actual 2FA setup logic
      console.log('Setting up 2FA...');
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setStep('verify');
      toast.success('2FA setup initiated. Please verify with your authenticator app.');
    } catch (error) {
      console.error('2FA setup error:', error);
      toast.error('Failed to setup 2FA. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerify2FA = async (data: Setup2FAFormData) => {
    setIsSubmitting(true);
    try {
      // TODO: Implement actual 2FA verification logic
      console.log('Verifying 2FA code:', data.verificationCode);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setStep('recovery');
      toast.success('2FA enabled successfully!');
    } catch (error) {
      console.error('2FA verification error:', error);
      toast.error('Invalid verification code. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDisable2FA = async (data: Disable2FAFormData) => {
    setIsSubmitting(true);
    try {
      // TODO: Implement actual 2FA disable logic
      console.log('Disabling 2FA...');
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('2FA disabled successfully');
      onOpenChange(false);
    } catch (error) {
      console.error('2FA disable error:', error);
      toast.error('Failed to disable 2FA. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyRecoveryCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Recovery code copied to clipboard');
  };

  const downloadRecoveryCodes = () => {
    const content = recoveryCodes.join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '2fa-recovery-codes.txt';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Recovery codes downloaded');
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setStep('setup');
      setupForm.reset();
      disableForm.reset();
    }
    onOpenChange(newOpen);
  };

  if (is2FAEnabled) {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Manage Two-Factor Authentication
            </DialogTitle>
            <DialogDescription>
              Two-factor authentication is currently enabled
            </DialogDescription>
          </DialogHeader>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <CheckCircle className="h-5 w-5 text-green-500" />
                2FA Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Two-Factor Authentication</span>
                <Badge variant="default" className="bg-green-500">
                  Enabled
                </Badge>
              </div>
              
              <p className="text-sm text-muted-foreground">
                Your account is protected with two-factor authentication. You&apos;ll need to enter a code from your authenticator app when signing in.
              </p>

              <Separator />

              <div className="space-y-3">
                <h4 className="font-medium">Recovery Codes</h4>
                <p className="text-sm text-muted-foreground">
                  Save these recovery codes in a safe place. You can use them to access your account if you lose your authenticator device.
                </p>
                
                <div className="grid grid-cols-2 gap-2 text-sm font-mono">
                  {recoveryCodes.slice(0, 4).map((code, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                      <span>{code}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyRecoveryCode(code)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadRecoveryCodes}
                  className="w-full"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download All Codes
                </Button>
              </div>
            </CardContent>
          </Card>

          <form onSubmit={disableForm.handleSubmit(handleDisable2FA as any)} className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-destructive">Disable 2FA</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-2 p-3 bg-destructive/20 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-destructive mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-destructive">Warning</p>
                    <p className="text-destructive/80">
                      Disabling 2FA will make your account less secure. Are you sure you want to continue?
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    {...disableForm.register('currentPassword')}
                    placeholder="Enter your current password"
                  />
                  {disableForm.formState.errors.currentPassword && (
                    <p className="text-sm text-destructive">
                      {disableForm.formState.errors.currentPassword.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmation">Type DISABLE to confirm</Label>
                  <Input
                    id="confirmation"
                    {...disableForm.register('confirmation')}
                    placeholder="Type DISABLE"
                  />
                  {disableForm.formState.errors.confirmation && (
                    <p className="text-sm text-destructive">
                      {disableForm.formState.errors.confirmation.message}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="destructive"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Disabling...' : 'Disable 2FA'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Setup Two-Factor Authentication
          </DialogTitle>
          <DialogDescription>
            Add an extra layer of security to your account
          </DialogDescription>
        </DialogHeader>

        {step === 'setup' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Step 1: Install Authenticator App</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Download and install an authenticator app like Google Authenticator, Authy, or Microsoft Authenticator.
                </p>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Recommended Apps:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Google Authenticator</li>
                    <li>• Authy</li>
                    <li>• Microsoft Authenticator</li>
                    <li>• 1Password</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Step 2: Scan QR Code</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Open your authenticator app and scan this QR code:
                </p>
                
                <div className="flex justify-center p-4 bg-background rounded-lg">
                  <div className="w-48 h-48 bg-muted rounded flex items-center justify-center">
                    <QrCode className="h-24 w-24 text-muted-foreground" />
                  </div>
                </div>
                
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-2">
                    Can&apos;t scan? Enter this code manually:
                  </p>
                  <code className="text-sm bg-muted px-2 py-1 rounded">
                    JBSWY3DPEHPK3PXP
                  </code>
                </div>
              </CardContent>
            </Card>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSetup2FA}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Setting up...' : 'Continue'}
              </Button>
            </DialogFooter>
          </div>
        )}

        {step === 'verify' && (
          <form onSubmit={setupForm.handleSubmit(handleVerify2FA)} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Step 3: Verify Setup</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Enter the 6-digit code from your authenticator app to complete the setup:
                </p>
                
                <div className="space-y-2">
                  <Label htmlFor="verificationCode">Verification Code</Label>
                  <Input
                    id="verificationCode"
                    {...setupForm.register('verificationCode')}
                    placeholder="000000"
                    maxLength={6}
                    className="text-center text-lg tracking-widest"
                  />
                  {setupForm.formState.errors.verificationCode && (
                    <p className="text-sm text-destructive">
                      {setupForm.formState.errors.verificationCode.message}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep('setup')}
                disabled={isSubmitting}
              >
                Back
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Verifying...' : 'Verify & Enable'}
              </Button>
            </DialogFooter>
          </form>
        )}

        {step === 'recovery' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Step 4: Save Recovery Codes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Save these recovery codes in a safe place. You can use them to access your account if you lose your authenticator device.
                </p>
                
                <div className="grid grid-cols-2 gap-2 text-sm font-mono">
                  {recoveryCodes.map((code, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                      <span>{code}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyRecoveryCode(code)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadRecoveryCodes}
                  className="w-full"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download All Codes
                </Button>
              </CardContent>
            </Card>

            <DialogFooter>
              <Button
                onClick={() => onOpenChange(false)}
                className="w-full"
              >
                Complete Setup
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
