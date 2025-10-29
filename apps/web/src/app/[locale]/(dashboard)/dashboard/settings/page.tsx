'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { User, Lock, Key, Settings2, Globe, Palette, Bell, Shield, Eye, FileText, Upload, Database, Link2, UserCircle, Key as KeyIcon, CreditCard, BarChart3, ArrowUpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UpgradeModal } from '@/components/settings/UpgradeModal';
import { ManageBillingModal } from '@/components/settings/ManageBillingModal';
import { UsageDashboardModal } from '@/components/settings/UsageDashboardModal';
import { MagicLinkSettingsModal } from '@/components/settings/MagicLinkSettingsModal';
import { BiometricLoginModal } from '@/components/settings/BiometricLoginModal';
import { TwoFactorModal } from '@/components/settings/TwoFactorModal';
import { ManagePermissionsModal } from '@/components/settings/ManagePermissionsModal';
import { SessionsActivityModal } from '@/components/settings/SessionsActivityModal';
import { LocaleSettingsModal } from '@/components/settings/LocaleSettingsModal';
import { AppearanceModal } from '@/components/settings/AppearanceModal';
import { NotificationPreferencesModal } from '@/components/settings/NotificationPreferencesModal';
import { PrivacySettingsModal } from '@/components/settings/PrivacySettingsModal';
import { ImportExportModal } from '@/components/settings/ImportExportModal';
import { DataSettingsModal } from '@/components/settings/DataSettingsModal';
import { IntegrationsModal } from '@/components/settings/IntegrationsModal';
import { APIKeysModal } from '@/components/settings/APIKeysModal';

export default function SettingsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'account');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  
  // Modal states
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [billingModalOpen, setBillingModalOpen] = useState(false);
  const [usageModalOpen, setUsageModalOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [biometricModalOpen, setBiometricModalOpen] = useState(false);
  const [twoFactorModalOpen, setTwoFactorModalOpen] = useState(false);
  const [permissionsModalOpen, setPermissionsModalOpen] = useState(false);
  const [sessionsModalOpen, setSessionsModalOpen] = useState(false);
  const [localeModalOpen, setLocaleModalOpen] = useState(false);
  const [appearanceModalOpen, setAppearanceModalOpen] = useState(false);
  const [notificationsModalOpen, setNotificationsModalOpen] = useState(false);
  const [privacyModalOpen, setPrivacyModalOpen] = useState(false);
  const [importExportModalOpen, setImportExportModalOpen] = useState(false);
  const [dataSettingsModalOpen, setDataSettingsModalOpen] = useState(false);
  const [integrationsModalOpen, setIntegrationsModalOpen] = useState(false);
  const [apiKeysModalOpen, setAPIKeysModalOpen] = useState(false);
  
  useEffect(() => {
    const tab = searchParams.get('tab') || 'account';
    setActiveTab(tab);
  }, [searchParams]);
  
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tabId);
    router.push(`?${params.toString()}`, { scroll: false });
  };
  
  const tabs = [
    { id: 'account', label: 'Account' },
    { id: 'security', label: 'Security' },
    { id: 'preferences', label: 'Preferences' },
    { id: 'data', label: 'Data & Integrations' },
  ];

  return (
    <>
      <div>
        <div className="max-w-6xl mx-auto">
          <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap border shadow-sm ${
                  activeTab === tab.id
                    ? 'bg-primary text-primary-foreground border-primary shadow-lg'
                    : 'bg-card text-muted-foreground hover:bg-accent hover:text-card-foreground hover:shadow-md border-border'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === 'account' && (
            <div className="grid gap-6 md:grid-cols-2">
              <SettingCard
                icon={<User />}
                title="Profile Information"
                description=""
              >
                <div className="mb-6">
                  <p className="font-semibold text-card-foreground">John Doe</p>
                  <p className="text-sm text-card-foreground/60 mt-1">john.doe@example.com</p>
                </div>
                <Button 
                  onClick={() => router.push('/en/dashboard/profile')}
                  className="w-full mt-auto"
                >
                  <User className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </SettingCard>

              <SettingCard
                icon={<CreditCard />}
                title="Plan & Billing"
                titleAction={
                  <button
                    onClick={() => setUpgradeModalOpen(true)}
                    className="px-3 py-1 rounded-full bg-danger/20 text-danger text-xs font-medium inline-flex items-center gap-1 hover:bg-danger/30 transition-all"
                  >
                    <ArrowUpCircle className="h-3 w-3" />
                    Upgrade
                  </button>
                }
                description=""
              >
                <div className="space-y-1">
                  <p className="text-sm font-bold text-card-foreground">Current Plan</p>
                  <p className="text-sm font-medium text-card-foreground">Free Plan - All Basic Features Included</p>
                </div>
                <Button onClick={() => setBillingModalOpen(true)} className="w-full mt-auto">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Manage Plan & Billing
                </Button>
              </SettingCard>

              <SettingCard
                icon={<BarChart3 />}
                title="Usage"
                description=""
              >
                <div className="mb-6">
                  <p className="text-sm font-bold text-card-foreground mb-1">Billing Period Usage</p>
                  <p className="text-sm text-card-foreground/70">Monthly data usage statistics</p>
                </div>
                <div className="flex-1" />
                <Button onClick={() => setUsageModalOpen(true)} className="w-full mt-auto">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  View Usage
                </Button>
              </SettingCard>
            </div>
          )}

          {activeTab === 'security' && (
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
                    <span className="px-3 py-1 rounded-full bg-danger/20 text-danger text-xs font-medium">Disabled</span>
                  </div>
                </div>
                <Button onClick={() => setTwoFactorModalOpen(true)} className="w-full mt-auto">
                  <Shield className="h-4 w-4 mr-2" />
                  Edit 2FA Settings
                </Button>
              </SettingCard>

              <SettingCard
                icon={<Settings2 />}
                title="User Roles & Permissions"
                description=""
              >
                <div className="mb-6">
                  <p className="text-sm font-bold text-card-foreground">Add or Remove Users</p>
                  <p className="text-sm text-card-foreground/70 mt-1">Manage access levels for shared accounts</p>
                </div>
                <div className="flex-1" />
                <Button onClick={() => setPermissionsModalOpen(true)} className="w-full mt-auto">
                  <Settings2 className="h-4 w-4 mr-2" />
                  Manage Permissions
                </Button>
              </SettingCard>

              <SettingCard
                icon={<FileText />}
                title="Session & Activity Logs"
                description=""
              >
                <div className="mb-6">
                  <p className="text-sm font-bold text-card-foreground">Activity</p>
                  <p className="text-sm text-card-foreground/70 mt-1">View and manage active sessions and activity history</p>
                </div>
                <div className="flex-1" />
                <Button onClick={() => setSessionsModalOpen(true)} className="w-full mt-auto">
                  <FileText className="h-4 w-4 mr-2" />
                  View Sessions & Activity
                </Button>
              </SettingCard>
            </div>
          )}

          {activeTab === 'preferences' && (
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
          )}

          {activeTab === 'data' && (
            <div className="grid gap-6 md:grid-cols-2">
              <SettingCard
                icon={<Upload />}
                title="Data Import/Export"
                description=""
              >
                <div className="mb-6">
                  <p className="text-sm font-bold text-card-foreground">Upload & Download</p>
                  <p className="text-sm text-card-foreground/70 mt-1">Your data in various formats</p>
                </div>
                <div className="flex-1" />
                <Button onClick={() => setImportExportModalOpen(true)} className="w-full mt-auto">
                  <Upload className="h-4 w-4 mr-2" />
                  Import/Export Data
                </Button>
              </SettingCard>

              <SettingCard
                icon={<Database />}
                title="Data Settings"
                description=""
              >
                <div className="mb-6">
                  <p className="text-sm font-bold text-card-foreground">Data Storage and Settings</p>
                  <p className="text-sm text-card-foreground/70 mt-1">Data retention policy, backup and restore settings</p>
                </div>
                <div className="flex-1" />
                <Button onClick={() => setDataSettingsModalOpen(true)} className="w-full mt-auto">
                  <Database className="h-4 w-4 mr-2" />
                  Manage Data Settings
                </Button>
              </SettingCard>

              <SettingCard
                icon={<Link2 />}
                title="Integrations"
                description=""
              >
                <div className="mb-6">
                  <p className="text-sm font-bold text-card-foreground">External Accounts</p>
                  <p className="text-sm text-card-foreground/70 mt-1">Manage webhooks, integrations and linked accounts</p>
                </div>
                <div className="flex-1" />
                <Button onClick={() => setIntegrationsModalOpen(true)} className="w-full mt-auto">
                  <Link2 className="h-4 w-4 mr-2" />
                  Manage Integrations
                </Button>
              </SettingCard>

              <SettingCard
                icon={<KeyIcon />}
                title="API Access"
                description=""
              >
                <div className="mb-6">
                  <p className="text-sm font-bold text-card-foreground">App & Third Party APIs</p>
                  <p className="text-sm text-card-foreground/70 mt-1">Generate and manage all your API keys</p>
                </div>
                <div className="flex-1" />
                <Button onClick={() => setAPIKeysModalOpen(true)} className="w-full mt-auto">
                  <KeyIcon className="h-4 w-4 mr-2" />
                  API Keys
                </Button>
              </SettingCard>
            </div>
          )}
        </div>
      </div>
      
      {/* All Modals */}
      <UpgradeModal isOpen={upgradeModalOpen} onClose={() => setUpgradeModalOpen(false)} />
      <ManageBillingModal isOpen={billingModalOpen} onClose={() => setBillingModalOpen(false)} />
      <UsageDashboardModal isOpen={usageModalOpen} onClose={() => setUsageModalOpen(false)} />
      <MagicLinkSettingsModal isOpen={passwordModalOpen} onClose={() => setPasswordModalOpen(false)} />
      <BiometricLoginModal isOpen={biometricModalOpen} onClose={() => setBiometricModalOpen(false)} />
      <TwoFactorModal isOpen={twoFactorModalOpen} onClose={() => setTwoFactorModalOpen(false)} />
      <ManagePermissionsModal isOpen={permissionsModalOpen} onClose={() => setPermissionsModalOpen(false)} />
      <SessionsActivityModal isOpen={sessionsModalOpen} onClose={() => setSessionsModalOpen(false)} />
      <LocaleSettingsModal isOpen={localeModalOpen} onClose={() => setLocaleModalOpen(false)} />
      <AppearanceModal isOpen={appearanceModalOpen} onClose={() => setAppearanceModalOpen(false)} />
      <NotificationPreferencesModal isOpen={notificationsModalOpen} onClose={() => setNotificationsModalOpen(false)} />
      <PrivacySettingsModal isOpen={privacyModalOpen} onClose={() => setPrivacyModalOpen(false)} />
      <ImportExportModal isOpen={importExportModalOpen} onClose={() => setImportExportModalOpen(false)} />
      <DataSettingsModal isOpen={dataSettingsModalOpen} onClose={() => setDataSettingsModalOpen(false)} />
      <IntegrationsModal isOpen={integrationsModalOpen} onClose={() => setIntegrationsModalOpen(false)} />
      <APIKeysModal isOpen={apiKeysModalOpen} onClose={() => setAPIKeysModalOpen(false)} />
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
