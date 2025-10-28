'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, CreditCard, Trash2, Plus, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AddPaymentMethodModal } from './AddPaymentMethodModal';

interface ManageBillingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ManageBillingModal({ isOpen, onClose }: ManageBillingModalProps) {
  const [mounted, setMounted] = useState(false);
  const [view, setView] = useState<'main' | 'plans'>('main');
  const [isAddPaymentModalOpen, setIsAddPaymentModalOpen] = useState(false);
  const [upgrading, setUpgrading] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleUpgrade = async (planId: string) => {
    setUpgrading(planId);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log(`Upgrading to ${planId} plan...`);
    alert(`Your plan has been upgraded to ${planId}!`);
    setUpgrading(null);
    onClose();
  };

  if (!isOpen || !mounted) return null;

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
        className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-lg border shadow-2xl modal-bg"
      >
        {view === 'main' && (
          <>
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b sticky top-0 modal-bg z-10">
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                <h2 className="text-xl font-bold">Billing & Plans</h2>
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
              {/* Current Plan */}
              <div className="mb-8">
                <h3 className="text-lg font-bold mb-4">Current Plan</h3>
                <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 rounded-lg border border-purple-100 dark:border-purple-800">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="text-2xl font-bold mb-1 text-foreground">Free</h4>
                      <p className="text-3xl font-bold mb-2 text-foreground">$0<span className="text-lg font-normal text-muted-foreground">/month</span></p>
                    </div>
                    <button
                      onClick={() => setView('plans')}
                      className="px-4 py-2 bg-background border border-input rounded-lg text-sm font-medium hover:bg-muted transition-colors"
                    >
                      View other plans
                    </button>
                  </div>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-success" />
                      <span>3 projects</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-success" />
                      <span>Basic analytics</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-success" />
                      <span>1GB storage</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-success" />
                      <span>Community support</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Plans Grid */}
              <div className="mb-8">
                <div className="mb-4">
                  <h3 className="text-lg font-bold">Available Plans</h3>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {/* Pro Plan */}
                  <div className="p-4 bg-muted rounded-lg border border-border">
                    <h4 className="font-bold mb-1">Pro</h4>
                    <p className="text-2xl font-bold mb-2">$29<span className="text-sm font-normal text-muted-foreground">/month</span></p>
                    <ul className="space-y-1 text-xs mb-3">
                      <li className="flex items-center gap-1">
                        <Check className="h-3 w-3 text-success" />
                        <span>Unlimited projects</span>
                      </li>
                      <li className="flex items-center gap-1">
                        <Check className="h-3 w-3 text-success" />
                        <span>Advanced analytics</span>
                      </li>
                      <li className="flex items-center gap-1">
                        <Check className="h-3 w-3 text-success" />
                        <span>10GB storage</span>
                      </li>
                    </ul>
                    <Button 
                      className="w-full"
                      onClick={() => handleUpgrade('pro')}
                      disabled={upgrading !== null}
                    >
                      {upgrading === 'pro' ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Upgrade'}
                    </Button>
                  </div>

                  {/* Business Plan */}
                  <div className="p-4 bg-muted rounded-lg border border-border">
                    <h4 className="font-bold mb-1">Business</h4>
                    <p className="text-2xl font-bold mb-2">$99<span className="text-sm font-normal text-muted-foreground">/month</span></p>
                    <ul className="space-y-1 text-xs mb-3">
                      <li className="flex items-center gap-1">
                        <Check className="h-3 w-3 text-success" />
                        <span>Everything in Pro</span>
                      </li>
                      <li className="flex items-center gap-1">
                        <Check className="h-3 w-3 text-success" />
                        <span>Team collaboration</span>
                      </li>
                      <li className="flex items-center gap-1">
                        <Check className="h-3 w-3 text-success" />
                        <span>100GB storage</span>
                      </li>
                    </ul>
                    <Button 
                      className="w-full"
                      onClick={() => handleUpgrade('business')}
                      disabled={upgrading !== null}
                    >
                      {upgrading === 'business' ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Upgrade'}
                    </Button>
                  </div>

                  {/* Enterprise Plan */}
                  <div className="p-4 bg-muted rounded-lg border border-border">
                    <h4 className="font-bold mb-1">Enterprise</h4>
                    <p className="text-2xl font-bold mb-2">$299<span className="text-sm font-normal text-muted-foreground">/month</span></p>
                    <ul className="space-y-1 text-xs mb-3">
                      <li className="flex items-center gap-1">
                        <Check className="h-3 w-3 text-success" />
                        <span>Everything in Business</span>
                      </li>
                      <li className="flex items-center gap-1">
                        <Check className="h-3 w-3 text-success" />
                        <span>Unlimited users</span>
                      </li>
                      <li className="flex items-center gap-1">
                        <Check className="h-3 w-3 text-success" />
                        <span>Unlimited storage</span>
                      </li>
                    </ul>
                    <Button 
                      className="w-full"
                      onClick={() => handleUpgrade('enterprise')}
                      disabled={upgrading !== null}
                    >
                      {upgrading === 'enterprise' ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Upgrade'}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Payment Methods */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold">Payment Methods</h3>
                  <Button 
                    className="flex items-center gap-2"
                    onClick={() => setIsAddPaymentModalOpen(true)}
                  >
                    <Plus className="h-4 w-4" />
                    Add Payment Method
                  </Button>
                </div>
                <div className="space-y-3">
                  {/* Payment Method 1 */}
                  <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <CreditCard className="h-8 w-8 text-muted-foreground" />
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">Visa ••••4242</p>
                          <span className="px-2 py-0.5 bg-success/20 text-success text-xs font-medium rounded-full">
                            Default
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">Expires 12/25</p>
                      </div>
                    </div>
                    <button className="p-2 text-danger hover:bg-danger/10 rounded-lg transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Payment Method 2 */}
                  <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <CreditCard className="h-8 w-8 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Mastercard ••••5555</p>
                        <p className="text-sm text-muted-foreground">Expires 09/26</p>
                      </div>
                    </div>
                    <button className="p-2 text-danger hover:bg-danger/10 rounded-lg transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {view === 'plans' && (
          <>
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b sticky top-0 modal-bg z-10">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setView('main')}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  ←
                </button>
                <h2 className="text-xl font-bold">Choose Your Plan</h2>
              </div>
              <button
                onClick={onClose}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Full Plans View */}
            <div className="p-6">
              <div className="grid grid-cols-4 gap-4">
                {/* Free Plan */}
                <div className="p-6 bg-muted rounded-lg border border-border">
                  <h4 className="text-xl font-bold mb-2">Free</h4>
                  <p className="text-3xl font-bold mb-4">$0<span className="text-sm font-normal text-muted-foreground">/month</span></p>
                  <ul className="space-y-2 text-sm mb-4">
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-success" />
                      <span>3 projects</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-success" />
                      <span>Basic analytics</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-success" />
                      <span>1GB storage</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-success" />
                      <span>Community support</span>
                    </li>
                  </ul>
                  <button className="w-full px-4 py-2 border border-input rounded-lg text-sm font-medium" disabled>
                    Current Plan
                  </button>
                </div>

                {/* Pro Plan */}
                <div className="p-6 bg-muted rounded-lg border border-border">
                  <h4 className="text-xl font-bold mb-2">Pro</h4>
                  <p className="text-3xl font-bold mb-4">$29<span className="text-sm font-normal text-muted-foreground">/month</span></p>
                  <ul className="space-y-2 text-sm mb-4">
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-success" />
                      <span>Unlimited projects</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-success" />
                      <span>Advanced analytics</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-success" />
                      <span>10GB storage</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-success" />
                      <span>Priority support</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-success" />
                      <span>Custom domain</span>
                    </li>
                  </ul>
                  <Button className="w-full">
                    Upgrade
                  </Button>
                </div>

                {/* Business Plan */}
                <div className="p-6 bg-muted rounded-lg border border-border">
                  <h4 className="text-xl font-bold mb-2">Business</h4>
                  <p className="text-3xl font-bold mb-4">$99<span className="text-sm font-normal text-muted-foreground">/month</span></p>
                  <ul className="space-y-2 text-sm mb-4">
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-success" />
                      <span>Everything in Pro</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-success" />
                      <span>Team collaboration (up to 10 users)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-success" />
                      <span>100GB storage</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-success" />
                      <span>Advanced security</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-success" />
                      <span>API access</span>
                    </li>
                  </ul>
                  <Button className="w-full">
                    Upgrade
                  </Button>
                </div>

                {/* Enterprise Plan */}
                <div className="p-6 bg-muted rounded-lg border border-border">
                  <h4 className="text-xl font-bold mb-2">Enterprise</h4>
                  <p className="text-3xl font-bold mb-4">$299<span className="text-sm font-normal text-muted-foreground">/month</span></p>
                  <ul className="space-y-2 text-sm mb-4">
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-success" />
                      <span>Everything in Business</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-success" />
                      <span>Unlimited users</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-success" />
                      <span>Unlimited storage</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-success" />
                      <span>Custom integrations</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-success" />
                      <span>Dedicated support</span>
                    </li>
                  </ul>
                  <Button className="w-full">
                    Upgrade
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );

  return (
    <>
      {createPortal(modalContent, document.body)}
      <AddPaymentMethodModal
        isOpen={isAddPaymentModalOpen}
        onClose={() => setIsAddPaymentModalOpen(false)}
        onAdd={(method, data) => {
          console.log('Adding payment method:', method, data);
          // Handle the payment method addition here
        }}
      />
    </>
  );
}

