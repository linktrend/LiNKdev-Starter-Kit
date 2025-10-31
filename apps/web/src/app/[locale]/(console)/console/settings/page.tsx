'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, Key, Globe, Palette, Bell, Shield, Eye, UserCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MagicLinkSettingsModal } from '@/components/settings/MagicLinkSettingsModal';
import { BiometricLoginModal } from '@/components/settings/BiometricLoginModal';
import { TwoFactorModal } from '@/components/settings/TwoFactorModal';
import { LocaleSettingsModal } from '@/components/settings/LocaleSettingsModal';
import { AppearanceModal } from '@/components/settings/AppearanceModal';
import { NotificationPreferencesModal } from '@/components/settings/NotificationPreferencesModal';
import { PrivacySettingsModal } from '@/components/settings/PrivacySettingsModal';

export default function ConsoleSettingsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'security');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  
  // Modal states
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [biometricModalOpen, setBiometricModalOpen] = useState(false);
  const [twoFactorModalOpen, setTwoFactorModalOpen] = useState(false);
  const [localeModalOpen, setLocaleModalOpen] = useState(false);
  const [appearanceModalOpen, setAppearanceModalOpen] = useState(false);
  const [notificationsModalOpen, setNotificationsModalOpen] = useState(false);
  const [privacyModalOpen, setPrivacyModalOpen] = useState(false);
  
  useEffect(() => {
    const incoming = searchParams.get('tab');
    const allowed = new Set(['security', 'preferences']);
    const nextTab = incoming && allowed.has(incoming) ? incoming : 'security';
    setActiveTab(nextTab);
  }, [searchParams]);
  
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tabId);
    router.push(`?${params.toString()}`, { scroll: false });
  };

  return (
    <>
      <div>
        <div className="max-w-6xl mx-auto">
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <div className="flex items-center gap-4">
                <Tabs value={activeTab} onValueChange={(v) => handleTabChange(v)}>
                  <TabsList className="w-full sm:w-auto">
                    <TabsTrigger value="security" className="flex-1 sm:flex-initial">
                      <Shield className="h-4 w-4 mr-1 sm:mr-2" />
                      Security
                    </TabsTrigger>
                    <TabsTrigger value="preferences" className="flex-1 sm:flex-initial">
                      <Palette className="h-4 w-4 mr-1 sm:mr-2" />
                      Preferences
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <Tabs value={activeTab} onValueChange={(v) => handleTabChange(v)}>
                <TabsContent value="security" className="space-y-4 mt-0">
            <div className="grid gap-6 md:grid-cols-2">
              <SettingCard
                icon={<Lock />}
                title="Login Credentials"
                description=""
              >
                <div className="mb-6">
                  <p className="text-sm font-bold text-card-foreground">Manage Access</p>
                  <p className="text-sm text-card-foreground/70 mt-1">Manage your magic link and biometric authentication</p>
                </div>
                <div className="flex-1" />
                <div className="space-y-3 mt-auto">
                  <Button onClick={() => setPasswordModalOpen(true)} className="w-full">
                    <Key className="h-4 w-4 mr-2" />
                    Edit Magic Link Settings
                  </Button>
                  <Button onClick={() => setBiometricModalOpen(true)} className="w-full">
                    <UserCircle className="h-4 w-4 mr-2" />
                    Edit Biometric Settings
                  </Button>
                </div>
              </SettingCard>

              <SettingCard
                icon={<Shield />}
                title="Two-Factor Authentication"
                description=""
              >
                <div className="mb-6">
                  <p className="text-sm font-bold text-card-foreground mb-3">Secure Account</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-card-foreground/70">2FA Status</span>
                    <span className="px-3 py-1 rounded-full bg-success/20 text-success text-xs font-medium border border-success/30">Enabled</span>
                  </div>
                </div>
                <Button onClick={() => setTwoFactorModalOpen(true)} className="w-full mt-auto">
                  <Shield className="h-4 w-4 mr-2" />
                  Edit 2FA Settings
                </Button>
              </SettingCard>
            </div>
                </TabsContent>

                <TabsContent value="preferences" className="space-y-4 mt-0">
            <div className="grid gap-6 md:grid-cols-2">
              <SettingCard
                icon={<Globe />}
                title="Locale"
                description=""
              >
                <div className="space-y-4">
                  <div>
                    <select className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground shadow-sm">
                      <option value="">Application Language</option>
                      <option>English</option>
                      <option>Spanish</option>
                      <option>繁體中文</option>
                    </select>
                  </div>
                  <div>
                    <select className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground shadow-sm">
                      <option value="">Region</option>
                      <option>North America</option>
                      <option>Latin America</option>
                      <option>Europe</option>
                      <option>Africa</option>
                      <option>Middle East</option>
                      <option>East Asia</option>
                      <option>South East Asia</option>
                      <option>Oceania</option>
                    </select>
                  </div>
                </div>
                <div className="flex-1" />
                <Button onClick={() => setLocaleModalOpen(true)} className="w-full mt-auto">
                  <Globe className="h-4 w-4 mr-2" />
                  Manage Locale Settings
                </Button>
              </SettingCard>

              <SettingCard
                icon={<Palette />}
                title="Theme & Appearance"
                description=""
              >
                <div className="space-y-4">
                  <div>
                    <select className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground shadow-sm">
                      <option value="">Theme</option>
                      <option>Light</option>
                      <option>Dark</option>
                      <option>Auto</option>
                    </select>
                  </div>
                  <div>
                    <select className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground shadow-sm">
                      <option value="">Font Size</option>
                      <option>Small</option>
                      <option>Medium</option>
                      <option>Large</option>
                    </select>
                  </div>
                </div>
                <div className="flex-1" />
                <Button onClick={() => setAppearanceModalOpen(true)} className="w-full mt-auto">
                  <Palette className="h-4 w-4 mr-2" />
                  Customize Appearance
                </Button>
              </SettingCard>

              <SettingCard
                icon={<Bell />}
                title="Notification Preferences"
                description=""
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-card-foreground">Email</span>
                    <div className="px-3 py-1 rounded-full bg-success/20 text-success text-xs font-medium border border-success/30">On</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-card-foreground">In-App Notifications</span>
                    <div className="px-3 py-1 rounded-full bg-success/20 text-success text-xs font-medium border border-success/30">On</div>
                  </div>
                </div>
                <div className="flex-1" />
                <Button onClick={() => setNotificationsModalOpen(true)} className="w-full mt-auto">
                  <Bell className="h-4 w-4 mr-2" />
                  Manage Notifications
                </Button>
              </SettingCard>

              <SettingCard
                icon={<Eye />}
                title="Privacy Settings"
                description=""
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-card-foreground">Data Sharing</span>
                    <div className="px-3 py-1 rounded-full bg-danger/20 text-danger text-xs font-medium border border-danger/30">Off</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-card-foreground">Analytics Tracking</span>
                    <div className="px-3 py-1 rounded-full bg-danger/20 text-danger text-xs font-medium border border-danger/30">Off</div>
                  </div>
                </div>
                <div className="flex-1" />
                <Button onClick={() => setPrivacyModalOpen(true)} className="w-full mt-auto">
                  <Eye className="h-4 w-4 mr-2" />
                  Privacy Settings
                </Button>
              </SettingCard>
            </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* All Modals */}
      <MagicLinkSettingsModal isOpen={passwordModalOpen} onClose={() => setPasswordModalOpen(false)} />
      <BiometricLoginModal isOpen={biometricModalOpen} onClose={() => setBiometricModalOpen(false)} />
      <TwoFactorModal isOpen={twoFactorModalOpen} onClose={() => setTwoFactorModalOpen(false)} />
      <LocaleSettingsModal isOpen={localeModalOpen} onClose={() => setLocaleModalOpen(false)} />
      <AppearanceModal isOpen={appearanceModalOpen} onClose={() => setAppearanceModalOpen(false)} />
      <NotificationPreferencesModal isOpen={notificationsModalOpen} onClose={() => setNotificationsModalOpen(false)} />
      <PrivacySettingsModal isOpen={privacyModalOpen} onClose={() => setPrivacyModalOpen(false)} />
    </>
  );
}

function SettingCard({
  icon,
  title,
  titleAction,
  description,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  titleAction?: React.ReactNode;
  description: string;
  children: React.ReactNode;
}) {
  // Extract first child if it's a div with mb-6 or space-y-1
  const childrenArray = React.Children.toArray(children);
  const firstChild = childrenArray[0];
  const isFirstChildDiv = React.isValidElement(firstChild) && 
    firstChild.type === 'div' && 
    (firstChild.props.className?.includes('mb-6') || firstChild.props.className?.includes('space-y-1'));
  
  const remainingChildren = isFirstChildDiv ? childrenArray.slice(1) : childrenArray;
  
  // Clone first child and remove mb-6 class
  const adjustedFirstChild = isFirstChildDiv && React.isValidElement(firstChild)
    ? React.cloneElement(firstChild as React.ReactElement<any>, {
        className: firstChild.props.className?.replace('mb-6', '').replace(/\s+/g, ' ').trim()
      })
    : null;

  return (
    <div
      className="p-6 rounded-lg border bg-card text-card-foreground shadow-sm h-[280px] flex flex-col"
    >
      <div className="flex items-start gap-3 mb-3 flex-shrink-0">
        <div className="text-primary">{icon}</div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-card-foreground">{title}</h3>
            {titleAction}
          </div>
        </div>
      </div>
      {description && (
        <div className="mb-3 flex-shrink-0">
          <p className="text-sm text-card-foreground/70">{description}</p>
        </div>
      )}
      {adjustedFirstChild && (
        <div className="mb-3 flex-shrink-0">
          {adjustedFirstChild}
        </div>
      )}
      <div className="flex-1 flex flex-col">
        {remainingChildren}
      </div>
    </div>
  );
}