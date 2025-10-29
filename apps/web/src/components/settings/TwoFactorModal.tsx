'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Shield, Smartphone, Mail, MessageSquare, Loader2, Copy, QrCode } from 'lucide-react';
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
  const [showQRCode, setShowQRCode] = useState(false);
  const [setupKey, setSetupKey] = useState('');
  const [showSMSForm, setShowSMSForm] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+1');
  const [verificationCode, setVerificationCode] = useState('');
  const [showVerificationForm, setShowVerificationForm] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [emailAddress, setEmailAddress] = useState('');
  const [showEmailVerificationForm, setShowEmailVerificationForm] = useState(false);
  const [authenticatorEnabled, setAuthenticatorEnabled] = useState(false);
  const [smsEnabled, setSmsEnabled] = useState(false);
  const [emailEnabled, setEmailEnabled] = useState(false);

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
    setProcessing(false);
  };

  const handleAuthenticator = async () => {
    setSelectedMethod('authenticator');
    setProcessing(true);
    // Simulate API call to generate QR code and setup key
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Generate a mock setup key (32 characters, base32 encoded)
    const mockSetupKey = Array.from({ length: 32 }, () => 
      'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'[Math.floor(Math.random() * 32)]
    ).join('');
    
    setSetupKey(mockSetupKey);
    setShowQRCode(true);
    setProcessing(false);
    // Note: Authenticator would be enabled after user scans QR and enters verification code
  };

  const handleSMS = async () => {
    setSelectedMethod('sms');
    setProcessing(true);
    // Simulate loading user's verified phone number
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock verified phone number from profile (if exists)
    const verifiedPhone = '+1 (555) 123-4567';
    if (verifiedPhone) {
      const parts = verifiedPhone.match(/^(\+\d{1,3})\s*\((\d{3})\)\s*(\d{3})-(\d{4})$/);
      if (parts) {
        setCountryCode(parts[1]);
        setPhoneNumber(`${parts[2]}${parts[3]}${parts[4]}`);
      }
    }
    
    setShowSMSForm(true);
    setProcessing(false);
  };

  const handleEmail = async () => {
    setSelectedMethod('email');
    setProcessing(true);
    // Simulate loading user's verified email
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock verified email from profile
    const verifiedEmail = 'john.doe@example.com';
    setEmailAddress(verifiedEmail);
    
    setShowEmailForm(true);
    setProcessing(false);
  };

  const handleSendSMS = async () => {
    if (!phoneNumber) {
      alert('Please enter a phone number');
      return;
    }
    setProcessing(true);
    // Simulate sending SMS
    await new Promise(resolve => setTimeout(resolve, 1000));
    setShowVerificationForm(true);
    setProcessing(false);
  };

  const handleVerifySMS = async () => {
    if (!verificationCode) {
      alert('Please enter the verification code');
      return;
    }
    setProcessing(true);
    // Simulate verification
    await new Promise(resolve => setTimeout(resolve, 1000));
    setShowVerificationForm(false);
    setShowSMSForm(false);
    setProcessing(false);
    setSmsEnabled(true);
    // SMS method is now verified
  };

  const handleSendEmail = async () => {
    if (!emailAddress) {
      alert('Please enter an email address');
      return;
    }
    setProcessing(true);
    // Simulate sending email
    await new Promise(resolve => setTimeout(resolve, 1000));
    setShowEmailVerificationForm(true);
    setProcessing(false);
  };

  const handleVerifyEmail = async () => {
    if (!verificationCode) {
      alert('Please enter the verification code');
      return;
    }
    setProcessing(true);
    // Simulate verification
    await new Promise(resolve => setTimeout(resolve, 1000));
    setShowEmailVerificationForm(false);
    setShowEmailForm(false);
    setProcessing(false);
    setEmailEnabled(true);
    // Email method is now verified
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
        className="relative w-full max-w-md max-h-[90vh] rounded-lg border shadow-2xl overflow-hidden modal-bg flex flex-col"
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
        <div className="p-6 overflow-y-auto flex-1">
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

          {showQRCode && setupKey && (
            <div className="mb-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
                <p className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">Scan QR Code</p>
                <p className="text-xs text-blue-900 dark:text-blue-300">Use your authenticator app to scan this QR code</p>
              </div>
              
              {/* QR Code Placeholder */}
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 mb-4 flex items-center justify-center">
                <div className="text-center">
                  <QrCode className="h-24 w-24 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">QR Code would appear here</p>
                  <p className="text-xs text-gray-400 mt-1">otpauth://totp/LTMStarterKit:user@example.com?secret={setupKey}&issuer=LTMStarterKit</p>
                </div>
              </div>

              {/* Setup Key */}
              <div className="bg-red-500 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium">Setup Key</p>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(setupKey);
                    }}
                    className="p-1 text-primary hover:bg-primary/10 rounded transition-colors"
                    title="Copy setup key"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
                <div className="bg-background border border-border rounded p-3 font-mono text-sm break-all">
                  {setupKey}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  If you can't scan the QR code, manually enter this key into your authenticator app
                </p>
              </div>
            </div>
          )}

          {showSMSForm && (
            <div className="mb-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
                <p className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">SMS Verification</p>
                <p className="text-xs text-blue-900 dark:text-blue-300">Enter your phone number to receive verification codes</p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-muted-foreground mb-1">Phone Number</label>
                  <div className="flex gap-2">
                    <select
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      className="px-3 py-2 rounded-lg border border-input bg-background text-sm"
                    >
                      <option value="+1">🇺🇸 +1</option>
                      <option value="+44">🇬🇧 +44</option>
                      <option value="+33">🇫🇷 +33</option>
                      <option value="+49">🇩🇪 +49</option>
                      <option value="+81">🇯🇵 +81</option>
                      <option value="+86">🇨🇳 +86</option>
                      <option value="+91">🇮🇳 +91</option>
                      <option value="+55">🇧🇷 +55</option>
                      <option value="+61">🇦🇺 +61</option>
                      <option value="+39">🇮🇹 +39</option>
                    </select>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="5551234567"
                      className="flex-1 px-4 py-2 rounded-lg border border-input bg-background"
                    />
                  </div>
                </div>
                
                {!showVerificationForm ? (
                  <Button
                    onClick={handleSendSMS}
                    disabled={processing}
                    className="w-full"
                  >
                    {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Send Verification Code'}
                  </Button>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm text-muted-foreground mb-1">Verification Code</label>
                      <input
                        type="text"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        placeholder="Enter 6-digit code"
                        className="w-full px-4 py-2 rounded-lg border border-input bg-background"
                        maxLength={6}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={handleVerifySMS}
                        disabled={processing}
                        className="flex-1"
                      >
                        {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Verify Code'}
                      </Button>
                      <Button
                        onClick={() => setShowVerificationForm(false)}
                        variant="outline"
                        className="flex-1"
                      >
                        Resend Code
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {showEmailForm && (
            <div className="mb-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
                <p className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">Email Verification</p>
                <p className="text-xs text-blue-900 dark:text-blue-300">Enter your email address to receive verification codes</p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-muted-foreground mb-1">Email Address</label>
                  <input
                    type="email"
                    value={emailAddress}
                    onChange={(e) => setEmailAddress(e.target.value)}
                    placeholder="user@example.com"
                    className="w-full px-4 py-2 rounded-lg border border-input bg-background"
                  />
                </div>
                
                {!showEmailVerificationForm ? (
                  <Button
                    onClick={handleSendEmail}
                    disabled={processing}
                    className="w-full"
                  >
                    {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Send Verification Code'}
                  </Button>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm text-muted-foreground mb-1">Verification Code</label>
                      <input
                        type="text"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        placeholder="Enter 6-digit code"
                        className="w-full px-4 py-2 rounded-lg border border-input bg-background"
                        maxLength={6}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={handleVerifyEmail}
                        disabled={processing}
                        className="flex-1"
                      >
                        {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Verify Code'}
                      </Button>
                      <Button
                        onClick={() => setShowEmailVerificationForm(false)}
                        variant="outline"
                        className="flex-1"
                      >
                        Resend Code
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {showCodes && codes.length > 0 && (
            <div className="mb-6">
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
                <p className="text-sm font-semibold text-yellow-900 dark:text-yellow-300 mb-2">Save these codes!</p>
                <p className="text-xs text-yellow-900 dark:text-yellow-300">Keep these backup codes in a safe place.</p>
              </div>
              <div className="bg-red-500 rounded-lg p-4 grid grid-cols-2 gap-3">
                {codes.map((code, idx) => (
                  <div key={idx} className="font-mono text-sm">{code}</div>
                ))}
              </div>
              <button
                onClick={() => {
                  const text = codes.join('\n');
                  navigator.clipboard.writeText(text);
                }}
                className="mt-3 p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors inline-flex items-center"
                title="Copy all codes"
              >
                <Copy className="h-4 w-4" />
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
                    className="w-full p-4 border-2 rounded-lg flex items-start gap-3 transition-all border-border hover:border-input"
                  >
                    <Smartphone className="h-5 w-5 flex-shrink-0 mt-0.5" />
                    <div className="text-left flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Authenticator App</p>
                          <p className="text-sm text-muted-foreground">Google Authenticator, Authy, etc.</p>
                        </div>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                          authenticatorEnabled 
                            ? 'bg-success/20 text-success border border-success/30' 
                            : 'bg-danger/20 text-danger border border-danger/30'
                        }`}>
                          {authenticatorEnabled ? 'Enabled' : 'Disabled'}
                        </div>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={handleSMS}
                    className="w-full p-4 border-2 rounded-lg flex items-start gap-3 transition-all border-border hover:border-input"
                  >
                    <MessageSquare className="h-5 w-5 flex-shrink-0 mt-0.5" />
                    <div className="text-left flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">SMS</p>
                          <p className="text-sm text-muted-foreground">Receive codes via text message</p>
                        </div>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                          smsEnabled 
                            ? 'bg-success/20 text-success border border-success/30' 
                            : 'bg-danger/20 text-danger border border-danger/30'
                        }`}>
                          {smsEnabled ? 'Enabled' : 'Disabled'}
                        </div>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={handleEmail}
                    className="w-full p-4 border-2 rounded-lg flex items-start gap-3 transition-all border-border hover:border-input"
                  >
                    <Mail className="h-5 w-5 flex-shrink-0 mt-0.5" />
                    <div className="text-left flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Email</p>
                          <p className="text-sm text-muted-foreground">Receive codes via email</p>
                        </div>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                          emailEnabled 
                            ? 'bg-success/20 text-success border border-success/30' 
                            : 'bg-danger/20 text-danger border border-danger/30'
                        }`}>
                          {emailEnabled ? 'Enabled' : 'Disabled'}
                        </div>
                      </div>
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

