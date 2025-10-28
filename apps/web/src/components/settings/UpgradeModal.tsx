'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UpgradeModal({ isOpen, onClose }: UpgradeModalProps) {
  const [mounted, setMounted] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const handleConfirm = async () => {
    setProcessing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log('Upgrading to Pro plan...');
    alert('Your plan has been upgraded to Pro!');
    setProcessing(false);
    onClose();
  };

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
        className="relative w-full max-w-2xl rounded-lg border shadow-2xl overflow-hidden modal-bg"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            <h2 className="text-xl font-bold">Upgrade</h2>
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
          <div className="flex items-baseline justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold mb-1">Pro</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold">$29</span>
                <span className="text-base text-muted-foreground">/month</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">Billed monthly</p>
            </div>
            <button className="px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors">
              View other plans
            </button>
          </div>

          <div className="mb-6">
            <h4 className="font-semibold mb-3">Features included:</h4>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm">
                <svg className="h-5 w-5 text-success flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span>Unlimited projects</span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <svg className="h-5 w-5 text-success flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span>Advanced analytics</span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <svg className="h-5 w-5 text-success flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span>10GB storage</span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <svg className="h-5 w-5 text-success flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span>Priority support</span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <svg className="h-5 w-5 text-success flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span>Custom domain</span>
              </li>
            </ul>
          </div>

          <div className="bg-primary/10 rounded-lg p-4 mb-6">
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold">Note:</span> You'll be charged immediately. Your current plan will be prorated.
            </p>
          </div>
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
            onClick={handleConfirm}
            className="flex-1"
            disabled={processing}
          >
            {processing ? 'Processing...' : 'Confirm Upgrade'}
          </Button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

