'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Lock, Key, Globe, Palette, Bell, Eye, Database, Link2, UserCircle, Shield, FileText, Upload, Download, CreditCard, BarChart3, ArrowUpCircle, Settings as SettingsIcon } from 'lucide-react';

interface SettingCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel: string;
  onClick: () => void;
  titleAction?: React.ReactNode;
  children?: React.ReactNode;
}

function SettingCard({ icon, title, description, actionLabel, onClick, titleAction, children }: SettingCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {icon}
            <div>
              <CardTitle>{title}</CardTitle>
              {description && <CardDescription>{description}</CardDescription>}
            </div>
          </div>
          {titleAction}
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
  const [activeTab, setActiveTab] = useState<'account' | 'security' | 'preferences' | 'data'>('account');

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <div className="flex items-center gap-4">
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
                <TabsList className="w-full sm:w-auto">
                  <TabsTrigger value="account" className="flex-1 sm:flex-initial">
                    <User className="h-4 w-4 mr-1 sm:mr-2" />
                    Account
                  </TabsTrigger>
                  <TabsTrigger value="security" className="flex-1 sm:flex-initial">
                    <Shield className="h-4 w-4 mr-1 sm:mr-2" />
                    Security
                  </TabsTrigger>
                  <TabsTrigger value="preferences" className="flex-1 sm:flex-initial">
                    <Palette className="h-4 w-4 mr-1 sm:mr-2" />
                    Preferences
                  </TabsTrigger>
                  <TabsTrigger value="data" className="flex-1 sm:flex-initial">
                    <Database className="h-4 w-4 mr-1 sm:mr-2" />
                    Data & Integrations
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
              <TabsContent value="account" className="space-y-4 mt-0">
          <div className="grid gap-6 md:grid-cols-2">
            <SettingCard
              icon={<User className="h-5 w-5 text-primary" />}
              title="Profile Information"
              description=""
              actionLabel="Edit Profile"
              onClick={() => window.location.href = '/profile'}
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
              onClick={() => window.location.href = '/billing'}
              titleAction={
                <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-600 text-xs font-medium">
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
              onClick={() => {}}
            >
              <div className="space-y-2">
                <div className="text-2xl font-bold">45%</div>
                <p className="text-xs text-muted-foreground">of monthly quota used</p>
              </div>
            </SettingCard>
          </div>
              </TabsContent>

              <TabsContent value="security" className="space-y-4 mt-0">
          <div className="grid gap-6 md:grid-cols-2">
            <SettingCard
              icon={<Lock className="h-5 w-5 text-primary" />}
              title="Login Credentials"
              description="Manage your password and biometric authentication"
              actionLabel="Edit Password"
              onClick={() => {}}
            />

            <SettingCard
              icon={<Shield className="h-5 w-5 text-primary" />}
              title="Two-Factor Authentication"
              description=""
              actionLabel="Edit 2FA Settings"
              onClick={() => {}}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">2FA Status</span>
                <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-600 text-xs font-medium">Disabled</span>
              </div>
            </SettingCard>

            <SettingCard
              icon={<Key className="h-5 w-5 text-primary" />}
              title="User Roles & Permissions"
              description="Manage access levels for shared accounts"
              actionLabel="Manage Permissions"
              onClick={() => {}}
            />

            <SettingCard
              icon={<FileText className="h-5 w-5 text-primary" />}
              title="Session & Activity Logs"
              description="View and manage active sessions and activity history"
              actionLabel="View Sessions & Activity"
              onClick={() => {}}
            />
          </div>
              </TabsContent>

              <TabsContent value="preferences" className="space-y-4 mt-0">
          <div className="grid gap-6 md:grid-cols-2">
            <SettingCard
              icon={<Globe className="h-5 w-5 text-primary" />}
              title="Locale"
              description=""
              actionLabel="Manage Locale Settings"
              onClick={() => {}}
            >
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground block mb-2">Language</label>
                  <select className="w-full px-4 py-2 rounded-lg border bg-background">
                    <option>English</option>
                    <option>Spanish</option>
                  </select>
                </div>
              </div>
            </SettingCard>

            <SettingCard
              icon={<Palette className="h-5 w-5 text-primary" />}
              title="Theme & Appearance"
              description=""
              actionLabel="Customize Appearance"
              onClick={() => {}}
            >
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground block mb-2">Theme</label>
                  <select className="w-full px-4 py-2 rounded-lg border bg-background">
                    <option>Light</option>
                    <option>Dark</option>
                    <option>Auto</option>
                  </select>
                </div>
              </div>
            </SettingCard>

            <SettingCard
              icon={<Bell className="h-5 w-5 text-primary" />}
              title="Notification Preferences"
              description=""
              actionLabel="Manage Notifications"
              onClick={() => {}}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Email</span>
                  <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-700 text-xs font-medium">On</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">In-App Notifications</span>
                  <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-700 text-xs font-medium">On</span>
                </div>
              </div>
            </SettingCard>

            <SettingCard
              icon={<Eye className="h-5 w-5 text-primary" />}
              title="Privacy Settings"
              description=""
              actionLabel="Privacy Settings"
              onClick={() => {}}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Data Sharing</span>
                  <span className="px-3 py-1 rounded-full bg-gray-500/20 text-gray-700 text-xs font-medium">Off</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Analytics Tracking</span>
                  <span className="px-3 py-1 rounded-full bg-gray-500/20 text-gray-700 text-xs font-medium">Off</span>
                </div>
              </div>
            </SettingCard>
          </div>
              </TabsContent>

              <TabsContent value="data" className="space-y-4 mt-0">
          <div className="grid gap-6 md:grid-cols-2">
            <SettingCard
              icon={<Upload className="h-5 w-5 text-primary" />}
              title="Data Import/Export"
              description="Upload or export data in various formats"
              actionLabel="Import/Export Data"
              onClick={() => {}}
            />

            <SettingCard
              icon={<Database className="h-5 w-5 text-primary" />}
              title="Data Settings"
              description="Data retention policy, backup and restore settings"
              actionLabel="Manage Data Settings"
              onClick={() => {}}
            />

            <SettingCard
              icon={<Link2 className="h-5 w-5 text-primary" />}
              title="Integrations"
              description="Manage webhooks, integrations and linked accounts"
              actionLabel="Manage Integrations"
              onClick={() => {}}
            />

            <SettingCard
              icon={<Key className="h-5 w-5 text-primary" />}
              title="API Access"
              description="Generate and manage API keys for third-party apps"
              actionLabel="API Keys"
              onClick={() => {}}
            />
          </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
