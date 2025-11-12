'use client';

import { useState } from 'react';
import { ArrowLeft, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { OnboardingData } from '@/hooks/useOnboarding';

interface Step3Props {
  data: OnboardingData;
  updateData: (newData: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}

export function Step3Preferences({ data, updateData, onNext, onBack, onSkip }: Step3Props) {
  const [sectionsCollapsed, setSectionsCollapsed] = useState({
    localization: false,
    notifications: true,
    appearance: true,
    privacy: true,
  });

  const toggleSection = (section: keyof typeof sectionsCollapsed) => {
    setSectionsCollapsed(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const languages = [
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Spanish' },
    { value: 'zh', label: '繁體中文' },
  ];

  const regions = [
    'North America',
    'Latin America',
    'Europe',
    'Africa',
    'Middle East',
    'East Asia',
    'South East Asia',
    'Oceania',
  ];

  const fontSizes = ['Small', 'Medium', 'Large'];
  
  const fontFamilies = ['Inter', 'System UI', 'Roboto', 'Open Sans'];

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Customize your experience. You can change these settings anytime.
      </p>

      {/* Locale Section */}
      <div className="space-y-4 border-b border-border pb-6">
        <button
          type="button"
          className="flex items-center gap-2 text-lg font-semibold text-primary hover:text-primary/80 transition-colors cursor-pointer"
          onClick={() => toggleSection('localization')}
        >
          <span>Locale</span>
          {sectionsCollapsed.localization ? (
            <ChevronDown className="h-5 w-5" />
          ) : (
            <ChevronUp className="h-5 w-5" />
          )}
        </button>

        {!sectionsCollapsed.localization && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="language">Application Language</Label>
              <Select
                value={data.language}
                onValueChange={(value) => updateData({ language: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang.value} value={lang.value}>
                      {lang.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="region">Region</Label>
              <Select
                value={data.personalCountry}
                onValueChange={(value) => updateData({ personalCountry: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select region" />
                </SelectTrigger>
                <SelectContent>
                  {regions.map((region) => (
                    <SelectItem key={region} value={region}>
                      {region}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </div>

      {/* Notification Preferences Section */}
      <div className="space-y-4 border-b border-border pb-6">
        <button
          type="button"
          className="flex items-center gap-2 text-lg font-semibold text-primary hover:text-primary/80 transition-colors cursor-pointer"
          onClick={() => toggleSection('notifications')}
        >
          <span>Notification Preferences</span>
          {sectionsCollapsed.notifications ? (
            <ChevronDown className="h-5 w-5" />
          ) : (
            <ChevronUp className="h-5 w-5" />
          )}
        </button>

        {!sectionsCollapsed.notifications && (
          <div className="space-y-6">
            {/* Email Notifications */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Email Notifications</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Security Alerts</Label>
                    <p className="text-xs text-muted-foreground">Important security updates</p>
                  </div>
                  <Switch
                    checked={data.emailNotifications?.securityAlerts}
                    onCheckedChange={(checked) =>
                      updateData({
                        emailNotifications: {
                          ...data.emailNotifications,
                          securityAlerts: checked,
                        },
                      })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Product Updates</Label>
                    <p className="text-xs text-muted-foreground">New features and improvements</p>
                  </div>
                  <Switch
                    checked={data.emailNotifications?.productUpdates}
                    onCheckedChange={(checked) =>
                      updateData({
                        emailNotifications: {
                          ...data.emailNotifications,
                          productUpdates: checked,
                        },
                      })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Marketing Emails</Label>
                    <p className="text-xs text-muted-foreground">Promotional content and offers</p>
                  </div>
                  <Switch
                    checked={data.emailNotifications?.marketing}
                    onCheckedChange={(checked) =>
                      updateData({
                        emailNotifications: {
                          ...data.emailNotifications,
                          marketing: checked,
                        },
                      })
                    }
                  />
                </div>
              </div>
            </div>

            {/* Push Notifications */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Push Notifications</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Browser Notifications</Label>
                    <p className="text-xs text-muted-foreground">Desktop browser notifications</p>
                  </div>
                  <Switch
                    checked={data.pushNotifications?.importantUpdates}
                    onCheckedChange={(checked) =>
                      updateData({
                        pushNotifications: {
                          ...data.pushNotifications,
                          importantUpdates: checked,
                        },
                      })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Mobile Push</Label>
                    <p className="text-xs text-muted-foreground">Mobile app notifications</p>
                  </div>
                  <Switch
                    checked={data.pushNotifications?.newFeatures}
                    onCheckedChange={(checked) =>
                      updateData({
                        pushNotifications: {
                          ...data.pushNotifications,
                          newFeatures: checked,
                        },
                      })
                    }
                  />
                </div>
              </div>
            </div>

            {/* In-App Notifications */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium">In-App Notifications</h4>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable In-App Notifications</Label>
                  <p className="text-xs text-muted-foreground">Receive notifications within the app</p>
                </div>
                <Switch
                  checked={data.inAppNotifications?.systemAlerts}
                  onCheckedChange={(checked) =>
                    updateData({
                      inAppNotifications: {
                        ...data.inAppNotifications,
                        systemAlerts: checked,
                      },
                    })
                  }
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Theme & Appearance Section */}
      <div className="space-y-4 border-b border-border pb-6">
        <button
          type="button"
          className="flex items-center gap-2 text-lg font-semibold text-primary hover:text-primary/80 transition-colors cursor-pointer"
          onClick={() => toggleSection('appearance')}
        >
          <span>Theme & Appearance</span>
          {sectionsCollapsed.appearance ? (
            <ChevronDown className="h-5 w-5" />
          ) : (
            <ChevronUp className="h-5 w-5" />
          )}
        </button>

        {!sectionsCollapsed.appearance && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="theme">Theme</Label>
              <Select
                value={data.theme}
                onValueChange={(value: 'light' | 'dark' | 'system') => updateData({ theme: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">Auto</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="fontSize">Font Size</Label>
              <Select defaultValue="Medium">
                <SelectTrigger>
                  <SelectValue placeholder="Select font size" />
                </SelectTrigger>
                <SelectContent>
                  {fontSizes.map((size) => (
                    <SelectItem key={size} value={size}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </div>

      {/* Privacy Settings Section */}
      <div className="space-y-4">
        <button
          type="button"
          className="flex items-center gap-2 text-lg font-semibold text-primary hover:text-primary/80 transition-colors cursor-pointer"
          onClick={() => toggleSection('privacy')}
        >
          <span>Privacy Settings</span>
          {sectionsCollapsed.privacy ? (
            <ChevronDown className="h-5 w-5" />
          ) : (
            <ChevronUp className="h-5 w-5" />
          )}
        </button>

        {!sectionsCollapsed.privacy && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Data Sharing</Label>
                <p className="text-xs text-muted-foreground">Share data with partners</p>
              </div>
              <Switch
                checked={data.showProfile}
                onCheckedChange={(checked) => updateData({ showProfile: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Analytics Tracking</Label>
                <p className="text-xs text-muted-foreground">Help us improve by sharing usage data</p>
              </div>
              <Switch
                checked={data.allowAnalytics}
                onCheckedChange={(checked) => updateData({ allowAnalytics: checked })}
              />
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-6 border-t">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="flex gap-3">
          <Button variant="outline" onClick={onSkip}>
            Skip
          </Button>
          <Button onClick={onNext}>
            Continue
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

