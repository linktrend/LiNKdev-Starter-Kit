'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Bell, Mail, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NotificationPreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationPreferencesModal({ isOpen, onClose }: NotificationPreferencesModalProps) {
  const [mounted, setMounted] = useState(false);
  const [notifications, setNotifications] = useState({
    marketing: { email: true, inApp: false },
    features: { email: true, inApp: true },
    security: { email: true, inApp: true },
    legal: { email: true, inApp: false },
    updates: { email: false, inApp: true },
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const handleSave = async () => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log('Saving notification preferences...', notifications);
    alert('Notification preferences saved successfully!');
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
            <Bell className="h-5 w-5" />
            <h2 className="text-xl font-bold">Manage Notifications</h2>
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
          {/* Table Header */}
          <div className="grid grid-cols-3 gap-4 mb-4 pb-3 border-b">
            <div></div>
            <div className="flex items-center justify-center gap-2 text-sm font-medium">
              <Mail className="h-4 w-4" />
              <span>Email</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm font-medium">
              <Smartphone className="h-4 w-4" />
              <span>In-App</span>
            </div>
          </div>

          {/* Notification Categories */}
          <div className="space-y-4">
            {/* Marketing */}
            <div className="grid grid-cols-3 gap-4 items-center">
              <div>
                <p className="font-medium">Marketing</p>
                <p className="text-sm text-muted-foreground">Promotional offers and product news</p>
              </div>
              <div className="flex justify-center">
                <button
                  onClick={() => setNotifications({
                    ...notifications,
                    marketing: { ...notifications.marketing, email: !notifications.marketing.email }
                  })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    notifications.marketing.email ? 'bg-success' : 'bg-muted'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      notifications.marketing.email ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              <div className="flex justify-center">
                <button
                  onClick={() => setNotifications({
                    ...notifications,
                    marketing: { ...notifications.marketing, inApp: !notifications.marketing.inApp }
                  })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    notifications.marketing.inApp ? 'bg-success' : 'bg-danger'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      notifications.marketing.inApp ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 items-center">
              <div>
                <p className="font-medium">Features</p>
                <p className="text-sm text-muted-foreground">New features and product updates</p>
              </div>
              <div className="flex justify-center">
                <button
                  onClick={() => setNotifications({
                    ...notifications,
                    features: { ...notifications.features, email: !notifications.features.email }
                  })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    notifications.features.email ? 'bg-success' : 'bg-muted'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      notifications.features.email ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              <div className="flex justify-center">
                <button
                  onClick={() => setNotifications({
                    ...notifications,
                    features: { ...notifications.features, inApp: !notifications.features.inApp }
                  })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    notifications.features.inApp ? 'bg-success' : 'bg-muted'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      notifications.features.inApp ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Security */}
            <div className="grid grid-cols-3 gap-4 items-center">
              <div>
                <p className="font-medium">Security</p>
                <p className="text-sm text-muted-foreground">Security alerts and account activity</p>
              </div>
              <div className="flex justify-center">
                <button
                  onClick={() => setNotifications({
                    ...notifications,
                    security: { ...notifications.security, email: !notifications.security.email }
                  })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    notifications.security.email ? 'bg-success' : 'bg-muted'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      notifications.security.email ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              <div className="flex justify-center">
                <button
                  onClick={() => setNotifications({
                    ...notifications,
                    security: { ...notifications.security, inApp: !notifications.security.inApp }
                  })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    notifications.security.inApp ? 'bg-success' : 'bg-muted'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      notifications.security.inApp ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Legal */}
            <div className="grid grid-cols-3 gap-4 items-center">
              <div>
                <p className="font-medium">Legal</p>
                <p className="text-sm text-muted-foreground">Terms, policies, and compliance updates</p>
              </div>
              <div className="flex justify-center">
                <button
                  onClick={() => setNotifications({
                    ...notifications,
                    legal: { ...notifications.legal, email: !notifications.legal.email }
                  })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    notifications.legal.email ? 'bg-success' : 'bg-muted'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      notifications.legal.email ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              <div className="flex justify-center">
                <button
                  onClick={() => setNotifications({
                    ...notifications,
                    legal: { ...notifications.legal, inApp: !notifications.legal.inApp }
                  })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    notifications.legal.inApp ? 'bg-success' : 'bg-danger'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      notifications.legal.inApp ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Updates */}
            <div className="grid grid-cols-3 gap-4 items-center">
              <div>
                <p className="font-medium">Updates</p>
                <p className="text-sm text-muted-foreground">General platform updates and news</p>
              </div>
              <div className="flex justify-center">
                <button
                  onClick={() => setNotifications({
                    ...notifications,
                    updates: { ...notifications.updates, email: !notifications.updates.email }
                  })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    notifications.updates.email ? 'bg-success' : 'bg-danger'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      notifications.updates.email ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              <div className="flex justify-center">
                <button
                  onClick={() => setNotifications({
                    ...notifications,
                    updates: { ...notifications.updates, inApp: !notifications.updates.inApp }
                  })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    notifications.updates.inApp ? 'bg-success' : 'bg-muted'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      notifications.updates.inApp ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
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
          >
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

