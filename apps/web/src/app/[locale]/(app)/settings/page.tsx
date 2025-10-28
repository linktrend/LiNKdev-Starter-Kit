'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  User, Lock, Shield, Key, Globe, Palette, Bell, Eye, Database, 
  Link2, CreditCard, BarChart3, FileText, Upload, Fingerprint
} from 'lucide-react';
import { cn } from '@/lib/utils';

type TabId = 'account' | 'security' | 'preferences' | 'data';

interface SettingCardProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  actionLabel: string;
  onClick: () => void;
  badge?: React.ReactNode;
  children?: React.ReactNode;
}

function SettingCard({ icon, title, description, actionLabel, onClick, badge, children }: SettingCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              {icon}
            </div>
            <div>
              <CardTitle className="text-lg">{title}</CardTitle>
              {description && <CardDescription className="mt-1">{description}</CardDescription>}
            </div>
          </div>
          {badge}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {children}
        <Button onClick={onClick} className="w-full">
          {actionLabel}
        </Button>
      </CardContent>
    </Card>
  );
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabId>('account');

  const tabs = [
    { id: 'account' as TabId, label: 'Account' },
    { id: 'security' as TabId, label: 'Security' },
    { id: 'preferences' as TabId, label: 'Preferences' },
    { id: 'data' as TabId, label: 'Data & Integrations' },
  ];

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 border-b">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              variant="ghost"
              className={cn(
                'whitespace-nowrap rounded-full px-6',
                activeTab === tab.id && 'bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground'
              )}
            >
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Account Tab */}
        {activeTab === 'account' && (
          <div className="grid gap-6 md:grid-cols-2">
            <SettingCard
              icon={<User className="h-5 w-5 text-primary" />}
              title="Profile Information"
              description=""
              actionLabel="Edit Profile"
              onClick={() => {/* TODO: Will be implemented later */}}
            >
              <div className="space-y-1">
                <p className="font-semibold">John Doe</p>
                <p className="text-sm text-muted-foreground">john.doe@example.com</p>
              </div>
            </SettingCard>

            <SettingCard
              icon={<CreditCard className="h-5 w-5 text-primary" />}
              title="Plan & Billing"
              description="Current plan and billing information"
              actionLabel="Manage Billing"
              onClick={() => {/* TODO: Will be implemented later */}}
              badge={
                <span className="px-3 py-1 rounded-full bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 text-xs font-medium">
                  Upgrade
                </span>
              }
            >
              <p className="text-sm text-muted-foreground">Free Plan - Limited Features</p>
            </SettingCard>

            <SettingCard
              icon={<BarChart3 className="h-5 w-5 text-primary" />}
              title="Usage"
              description="Monthly data usage statistics"
              actionLabel="View Usage"
              onClick={() => {/* TODO: Will be implemented later */}}
            />
          </div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="grid gap-6 md:grid-cols-2">
            <SettingCard
              icon={<Lock className="h-5 w-5 text-primary" />}
              title="Login Credentials"
              description="Manage your password and biometric authentication"
              actionLabel="Edit Password"
              onClick={() => {/* TODO: Will be implemented later */}}
            />

            <div className="space-y-4">
              <Button
                onClick={() => {/* TODO: Will be implemented later */}}
                className="w-full"
                variant="outline"
              >
                <Fingerprint className="h-4 w-4 mr-2" />
                Edit Biometric Login
              </Button>
            </div>

            <SettingCard
              icon={<Shield className="h-5 w-5 text-primary" />}
              title="Two-Factor Authentication"
              description=""
              actionLabel="Edit 2FA Settings"
              onClick={() => {/* TODO: Will be implemented later */}}
              badge={
                <span className="px-3 py-1 rounded-full bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 text-xs font-medium">
                  Disabled
                </span>
              }
            >
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">2FA Status</span>
                <span className="px-3 py-1 rounded-full bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 text-xs font-medium">
                  Disabled
                </span>
              </div>
            </SettingCard>

            <SettingCard
              icon={<Key className="h-5 w-5 text-primary" />}
              title="User Roles & Permissions"
              description="Manage access levels for shared accounts"
              actionLabel="Manage Permissions"
              onClick={() => {/* TODO: Will be implemented later */}}
            />

            <SettingCard
              icon={<FileText className="h-5 w-5 text-primary" />}
              title="Session & Activity Logs"
              description="View and manage active sessions and activity history"
              actionLabel="View Sessions & Activity"
              onClick={() => {/* TODO: Will be implemented later */}}
            />
          </div>
        )}

        {/* Preferences Tab */}
        {activeTab === 'preferences' && (
          <div className="grid gap-6 md:grid-cols-2">
            <SettingCard
              icon={<Globe className="h-5 w-5 text-primary" />}
              title="Locale"
              description=""
              actionLabel="Manage Locale Settings"
              onClick={() => {/* TODO: Will be implemented later */}}
            >
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Application Language</label>
                  <select className="w-full px-4 py-2 rounded-lg border bg-background">
                    <option>English</option>
                    <option>Español</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Region</label>
                  <select className="w-full px-4 py-2 rounded-lg border bg-background">
                    <option>United States</option>
                    <option>Canada</option>
                  </select>
                </div>
              </div>
            </SettingCard>

            <SettingCard
              icon={<Palette className="h-5 w-5 text-primary" />}
              title="Theme & Appearance"
              description=""
              actionLabel="Customize Appearance"
              onClick={() => {/* TODO: Will be implemented later */}}
            >
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Theme</label>
                  <select className="w-full px-4 py-2 rounded-lg border bg-background">
                    <option>Light</option>
                    <option>Dark</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Font Size</label>
                  <select className="w-full px-4 py-2 rounded-lg border bg-background">
                    <option>Small</option>
                    <option>Medium</option>
                    <option>Large</option>
                  </select>
                </div>
              </div>
            </SettingCard>

            <SettingCard
              icon={<Bell className="h-5 w-5 text-primary" />}
              title="Notification Preferences"
              description=""
              actionLabel="Manage Notifications"
              onClick={() => {/* TODO: Will be implemented later */}}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Email</span>
                  <span className="px-3 py-1 rounded-full bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 text-xs font-medium">
                    On
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">In-App Notifications</span>
                  <span className="px-3 py-1 rounded-full bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 text-xs font-medium">
                    On
                  </span>
                </div>
              </div>
            </SettingCard>

            <SettingCard
              icon={<Eye className="h-5 w-5 text-primary" />}
              title="Privacy Settings"
              description=""
              actionLabel="Privacy Settings"
              onClick={() => {/* TODO: Will be implemented later */}}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Data Sharing</span>
                  <span className="px-3 py-1 rounded-full bg-gray-200 dark:bg-gray-500/20 text-gray-700 dark:text-gray-400 text-xs font-medium">
                    Off
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Analytics Tracking</span>
                  <span className="px-3 py-1 rounded-full bg-gray-200 dark:bg-gray-500/20 text-gray-700 dark:text-gray-400 text-xs font-medium">
                    Off
                  </span>
                </div>
              </div>
            </SettingCard>
          </div>
        )}

        {/* Data & Integrations Tab */}
        {activeTab === 'data' && (
          <div className="grid gap-6 md:grid-cols-2">
            <SettingCard
              icon={<Upload className="h-5 w-5 text-primary" />}
              title="Data Import/Export"
              description="Upload or export financial data in various formats"
              actionLabel="Import/Export Data"
              onClick={() => {/* TODO: Will be implemented later */}}
            />

            <SettingCard
              icon={<Database className="h-5 w-5 text-primary" />}
              title="Data Settings"
              description="Data retention policy, backup and restore settings"
              actionLabel="Manage Data Settings"
              onClick={() => {/* TODO: Will be implemented later */}}
            />

            <SettingCard
              icon={<Link2 className="h-5 w-5 text-primary" />}
              title="Integrations"
              description="Manage webhooks, integrations and linked accounts"
              actionLabel="Manage Integrations"
              onClick={() => {/* TODO: Will be implemented later */}}
            />

            <SettingCard
              icon={<Key className="h-5 w-5 text-primary" />}
              title="API Access"
              description="Generate and manage API keys for third-party apps"
              actionLabel="API Keys"
              onClick={() => {/* TODO: Will be implemented later */}}
            />
          </div>
        )}
      </div>
    </div>
  );
}
