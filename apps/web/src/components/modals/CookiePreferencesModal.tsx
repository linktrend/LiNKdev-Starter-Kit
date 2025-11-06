'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

interface CookiePreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * CookiePreferencesModal - Modal for managing cookie preferences
 * 
 * Allows users to toggle different types of cookies:
 * - Necessary: Required for basic site functionality (always enabled)
 * - Functional: Enhance user experience with preferences
 * - Analytics: Help us understand how users interact with the site
 * - Marketing: Used for targeted advertising
 */
export function CookiePreferencesModal({ isOpen, onClose }: CookiePreferencesModalProps) {
  const [preferences, setPreferences] = useState({
    necessary: true, // Always true, cannot be disabled
    functional: true,
    analytics: false,
    marketing: false,
  });

  const handleSave = () => {
    // TODO: Save cookie preferences to localStorage or cookie
    console.log('Saving cookie preferences:', preferences);
    localStorage.setItem('cookiePreferences', JSON.stringify(preferences));
    onClose();
  };

  const handleAcceptAll = () => {
    setPreferences({
      necessary: true,
      functional: true,
      analytics: true,
      marketing: true,
    });
  };

  const handleRejectAll = () => {
    setPreferences({
      necessary: true, // Cannot be disabled
      functional: false,
      analytics: false,
      marketing: false,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Cookie Preferences</DialogTitle>
          <DialogDescription>
            Manage your cookie preferences. You can enable or disable different types of cookies below.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Necessary Cookies */}
          <div className="flex items-start justify-between space-x-4">
            <div className="flex-1 space-y-1">
              <Label htmlFor="necessary" className="text-base font-medium">
                Necessary Cookies
              </Label>
              <p className="text-sm text-muted-foreground">
                Essential for the website to function properly. These cannot be disabled.
              </p>
            </div>
            <Switch
              id="necessary"
              checked={preferences.necessary}
              disabled
              className="mt-1"
            />
          </div>

          {/* Functional Cookies */}
          <div className="flex items-start justify-between space-x-4">
            <div className="flex-1 space-y-1">
              <Label htmlFor="functional" className="text-base font-medium">
                Functional Cookies
              </Label>
              <p className="text-sm text-muted-foreground">
                Enable enhanced functionality and personalization, such as language preferences.
              </p>
            </div>
            <Switch
              id="functional"
              checked={preferences.functional}
              onCheckedChange={(checked) =>
                setPreferences({ ...preferences, functional: checked })
              }
              className="mt-1"
            />
          </div>

          {/* Analytics Cookies */}
          <div className="flex items-start justify-between space-x-4">
            <div className="flex-1 space-y-1">
              <Label htmlFor="analytics" className="text-base font-medium">
                Analytics Cookies
              </Label>
              <p className="text-sm text-muted-foreground">
                Help us understand how visitors interact with our website by collecting information anonymously.
              </p>
            </div>
            <Switch
              id="analytics"
              checked={preferences.analytics}
              onCheckedChange={(checked) =>
                setPreferences({ ...preferences, analytics: checked })
              }
              className="mt-1"
            />
          </div>

          {/* Marketing Cookies */}
          <div className="flex items-start justify-between space-x-4">
            <div className="flex-1 space-y-1">
              <Label htmlFor="marketing" className="text-base font-medium">
                Marketing Cookies
              </Label>
              <p className="text-sm text-muted-foreground">
                Used to track visitors across websites to display relevant advertisements.
              </p>
            </div>
            <Switch
              id="marketing"
              checked={preferences.marketing}
              onCheckedChange={(checked) =>
                setPreferences({ ...preferences, marketing: checked })
              }
              className="mt-1"
            />
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={handleRejectAll} className="w-full sm:w-auto">
            Reject All
          </Button>
          <Button variant="outline" onClick={handleAcceptAll} className="w-full sm:w-auto">
            Accept All
          </Button>
          <Button onClick={handleSave} className="w-full sm:w-auto">
            Save Preferences
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

