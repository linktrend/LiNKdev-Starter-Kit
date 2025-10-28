'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Shield, Smartphone, Mail, MessageSquare, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TwoFactorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TwoFactorModal({ isOpen, onClose }: TwoFactorModalProps) {
  const [mounted, setMounted] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<'authenticator' | 'sms' | 'email'>('authenticator');
  const [processing, setProcessing] = useState(false);
  const [codes, setCodes] = useState<string[]>([]);
  const [showCodes, setShowCodes] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const handleGenerate = async () => {
    setProcessing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    const mockCodes = Array.from({ length: 8 }, () => 
      Math.random().toString(36).substring(2, 8).toUpperCase()
    );
    setCodes(mockCodes);
    setShowCodes(true);
    alert('Backup codes generated successfully!');
    setProcessing(false);
  };

  const handleAuthenticator = async () => {
    setSelectedMethod('authenticator');
    await new Promise(resolve => setTimeout(resolve, 500));
    alert('Setting up Authenticator app...');
  };

  const handleSMS = async () => {
    setSelectedMethod('sms');
    await new Promise(resolve => setTimeout(resolve, 500));
    alert('SMS verification will be sent to your phone number.');
  };

  const handleEmail = async () => {
    setSelectedMethod('email');
    await new Promise(resolve => setTimeout(resolve, 500));
    alert('Verification code will be sent to your email.');
  };

  const showExtendedView = isEnabled;

  const modalContent = (
    <div 
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{ zIndex: 99999 }}
    >
      {/* Backdrop */}
      <div 
        className="fixed inset-0 modal-backdrop"
      />
      
      {/* Modal */}
      <div
        className="relative w-full max-w-md rounded-lg border shadow-2xl overflow-hidden modal-bg"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            <h2 className="text-xl font-bold">Two-Factor Authentication</h2>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Enable Toggle */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="font-semibold">Enable 2FA</p>
              <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
            </div>
            <button
              onClick={() => setIsEnabled(!isEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isEnabled ? 'bg-success' : 'bg-danger'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {showCodes && codes.length > 0 && (
            <div className="mb-6">
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
                <p className="text-sm font-semibold text-yellow-900 dark:text-yellow-300 mb-2">Save these codes!</p>
                <p className="text-xs text-yellow-900 dark:text-yellow-300">Keep these backup codes in a safe place.</p>
              </div>
              <div className="bg-muted rounded-lg p-4 grid grid-cols-2 gap-3">
                {codes.map((code, idx) => (
                  <div key={idx} className="font-mono text-sm">{code}</div>
                ))}
              </div>
              <button
                onClick={() => {
                  const text = codes.join('\n');
                  navigator.clipboard.writeText(text);
                  alert('Codes copied to clipboard!');
                }}
                className="mt-3 text-sm text-primary hover:underline"
              >
                Copy all codes
              </button>
            </div>
          )}

          {showExtendedView && (
            <>
              {/* Authentication Method */}
              <div className="mb-6">
                <p className="font-medium mb-3">Authentication Method</p>
                <div className="space-y-2">
                  <button
                    onClick={handleAuthenticator}
                    className={`w-full p-4 border-2 rounded-lg flex items-start gap-3 transition-all ${
                      selectedMethod === 'authenticator'
                        ? 'border-primary bg-muted'
                        : 'border-border hover:border-input'
                    }`}
                  >
                    <Smartphone className="h-5 w-5 flex-shrink-0 mt-0.5" />
                    <div className="text-left">
                      <p className="font-medium">Authenticator App</p>
                      <p className="text-sm text-muted-foreground">Google Authenticator, Authy, etc.</p>
                    </div>
                  </button>

                  <button
                    onClick={handleSMS}
                    className={`w-full p-4 border-2 rounded-lg flex items-start gap-3 transition-all ${
                      selectedMethod === 'sms'
                        ? 'border-primary bg-muted'
                        : 'border-border hover:border-input'
                    }`}
                  >
                    <MessageSquare className="h-5 w-5 flex-shrink-0 mt-0.5" />
                    <div className="text-left">
                      <p className="font-medium">SMS</p>
                      <p className="text-sm text-muted-foreground">Receive codes via text message</p>
                    </div>
                  </button>

                  <button
                    onClick={handleEmail}
                    className={`w-full p-4 border-2 rounded-lg flex items-start gap-3 transition-all ${
                      selectedMethod === 'email'
                        ? 'border-primary bg-muted'
                        : 'border-border hover:border-input'
                    }`}
                  >
                    <Mail className="h-5 w-5 flex-shrink-0 mt-0.5" />
                    <div className="text-left">
                      <p className="font-medium">Email</p>
                      <p className="text-sm text-muted-foreground">Receive codes via email</p>
                    </div>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t bg-muted">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1"
          >
            Cancel
          </Button>
          {showExtendedView ? (
            <Button
              onClick={handleGenerate}
              className="flex-1"
              disabled={processing}
            >
              {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Generate Backup Codes'}
            </Button>
          ) : (
            <Button
              onClick={() => setIsEnabled(true)}
              className="flex-1"
            >
              Save Changes
            </Button>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

