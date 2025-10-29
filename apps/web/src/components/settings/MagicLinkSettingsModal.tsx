'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Mail, Send, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface MagicLinkSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MagicLinkSettingsModal({ isOpen, onClose }: MagicLinkSettingsModalProps) {
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState('john.doe@example.com');
  const [linkExpiry, setLinkExpiry] = useState('24');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const handleSave = async () => {
    setSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log('Saving magic link settings...', { email, linkExpiry, emailNotifications });
    alert('Magic link settings saved successfully!');
    setSaving(false);
    onClose();
  };

  const handleSendTestLink = async () => {
    setSending(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log('Sending test magic link...');
    alert('Test magic link sent to your email!');
    setSending(false);
  };

  const modalContent = (
    <div 
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{ zIndex: 99999 }}
    >
      {/* Backdrop */}
      <div 
        className="fixed inset-0 modal-backdrop"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div
        className="relative w-full max-w-md rounded-lg border shadow-2xl modal-bg overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            <h2 className="text-xl font-bold">Magic Link Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Email Configuration */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-sm font-medium">
                Email Address for Magic Links *
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="linkExpiry" className="text-sm font-medium">
                Link Expiry Time (hours) *
              </Label>
              <Input
                id="linkExpiry"
                type="number"
                value={linkExpiry}
                onChange={(e) => setLinkExpiry(e.target.value)}
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Links will expire after {linkExpiry} hours
              </p>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="flex items-center justify-between p-4 bg-red-500 rounded-lg">
            <div>
              <p className="font-medium">Email Notifications</p>
              <p className="text-sm text-muted-foreground">Get notified when magic links are sent</p>
            </div>
            <button
              onClick={() => setEmailNotifications(!emailNotifications)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                emailNotifications ? 'bg-success' : 'bg-danger'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  emailNotifications ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Test Link */}
          <div className="border-t pt-4">
            <Button
              onClick={handleSendTestLink}
              variant="outline"
              className="w-full"
              disabled={sending}
            >
              {sending ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Test Magic Link
                </>
              )}
            </Button>
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
            onClick={handleSave}
            className="flex-1"
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

