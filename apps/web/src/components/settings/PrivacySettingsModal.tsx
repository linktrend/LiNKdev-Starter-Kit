'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Shield, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PrivacySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PrivacySettingsModal({ isOpen, onClose }: PrivacySettingsModalProps) {
  const [mounted, setMounted] = useState(false);
  const [settings, setSettings] = useState({
    showEmail: false,
    dataCollection: true,
    thirdPartySharing: false,
    analytics: true,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const handleSave = async () => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log('Saving privacy settings...', settings);
    alert('Privacy settings saved successfully!');
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
        className="relative w-full max-w-md rounded-lg border shadow-2xl overflow-hidden modal-bg"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            <h2 className="text-xl font-bold">Privacy Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Profile Visibility */}
          <div>
            <label className="block text-sm text-muted-foreground mb-2">Profile Visibility</label>
            <select className="w-full px-4 py-2.5 bg-background text-foreground border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary">
              <option selected>Public</option>
              <option>Private</option>
            </select>
          </div>

          {/* Show Email Address */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold">Show Email Address</p>
              <p className="text-sm text-muted-foreground">Display email on profile</p>
            </div>
            <button
              onClick={() => setSettings({ ...settings, showEmail: !settings.showEmail })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.showEmail ? 'bg-success' : 'bg-danger'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.showEmail ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Data Collection */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold">Data Collection</p>
              <p className="text-sm text-muted-foreground">Allow collection of usage data</p>
            </div>
            <button
              onClick={() => setSettings({ ...settings, dataCollection: !settings.dataCollection })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.dataCollection ? 'bg-success' : 'bg-danger'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.dataCollection ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Third-Party Sharing */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold">Third-Party Sharing</p>
              <p className="text-sm text-muted-foreground">Share data with partners</p>
            </div>
            <button
              onClick={() => setSettings({ ...settings, thirdPartySharing: !settings.thirdPartySharing })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.thirdPartySharing ? 'bg-success' : 'bg-danger'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.thirdPartySharing ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Analytics */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold">Analytics</p>
              <p className="text-sm text-muted-foreground">Help improve with anonymous analytics</p>
            </div>
            <button
              onClick={() => setSettings({ ...settings, analytics: !settings.analytics })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.analytics ? 'bg-success' : 'bg-danger'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.analytics ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Privacy Policy Link */}
          <button
            onClick={() => window.open('https://example.com/privacy', '_blank')}
            className="w-full p-3 bg-blue-50 text-blue-900 rounded-lg flex items-center justify-between hover:bg-blue-100 transition-colors"
          >
            <span className="text-sm font-medium">View Full Privacy Policy</span>
            <ExternalLink className="h-4 w-4" />
          </button>
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
          >
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
