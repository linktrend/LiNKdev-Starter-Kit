'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Fingerprint, Smartphone, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BiometricLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BiometricLoginModal({ isOpen, onClose }: BiometricLoginModalProps) {
  const [mounted, setMounted] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [selectedType, setSelectedType] = useState<'fingerprint' | 'faceid'>('fingerprint');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const handleSave = async () => {
    setSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log(`Saving biometric settings with ${selectedType}...`);
    alert(`Biometric login enabled with ${selectedType}!`);
    setSaving(false);
    onClose();
  };

  const handleFingerprint = async () => {
    setSelectedType('fingerprint');
    await new Promise(resolve => setTimeout(resolve, 500));
    alert('Setting up Fingerprint authentication...');
  };

  const handleFaceID = async () => {
    setSelectedType('faceid');
    await new Promise(resolve => setTimeout(resolve, 500));
    alert('Setting up Face ID authentication...');
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
            <Fingerprint className="h-5 w-5" />
            <h2 className="text-xl font-bold">Biometric Login</h2>
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
              <p className="font-semibold">Enable Biometric Login</p>
              <p className="text-sm text-muted-foreground">Use your device&apos;s biometric authentication</p>
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

          {showExtendedView && (
            <>
              {/* Biometric Type Selection */}
              <div className="mb-6">
                <p className="font-medium mb-3">Biometric Type</p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleFingerprint}
                    className={`p-4 border-2 rounded-lg flex flex-col items-center gap-2 transition-all ${
                      selectedType === 'fingerprint'
                        ? 'border-primary bg-red-500'
                        : 'border-border hover:border-input'
                    }`}
                  >
                    <Fingerprint className="h-8 w-8" />
                    <span className="text-sm font-medium">Fingerprint</span>
                  </button>
                  <button
                    onClick={handleFaceID}
                    className={`p-4 border-2 rounded-lg flex flex-col items-center gap-2 transition-all ${
                      selectedType === 'faceid'
                        ? 'border-primary bg-red-500'
                        : 'border-border hover:border-input'
                    }`}
                  >
                    <Smartphone className="h-8 w-8" />
                    <span className="text-sm font-medium">Face ID</span>
                  </button>
                </div>
              </div>

              {/* Note */}
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  <span className="font-semibold">Note:</span> Make sure your device supports the selected biometric authentication method.
                </p>
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
          <Button
            onClick={handleSave}
            className="flex-1"
            disabled={saving}
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Changes'}
          </Button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

