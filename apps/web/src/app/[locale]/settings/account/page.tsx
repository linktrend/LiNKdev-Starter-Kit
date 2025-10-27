'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { getUser, getUserDetails } from '@/utils/supabase/queries';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Mail, 
  Shield, 
  Key, 
  Bell, 
  Globe, 
  CreditCard, 
  Smartphone, 
  Activity,
  Settings as SettingsIcon,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';
import { ProfileEditModal } from '@/components/profile/ProfileEditModal';
import { LocaleSettingsModal } from '@/components/settings/LocaleSettingsModal';
import { ManageNotificationsModal } from '@/components/settings/ManageNotificationsModal';
import { PrivacySettingsModal } from '@/components/settings/PrivacySettingsModal';
import { EditPasswordModal } from '@/components/settings/EditPasswordModal';
import { Edit2FAModal } from '@/components/settings/Edit2FAModal';
import { SessionsActivityModal } from '@/components/settings/SessionsActivityModal';

// Note: Metadata removed because this is a client component

// Modal state management
interface ModalState {
  profileEdit: boolean;
  localeSettings: boolean;
  manageNotifications: boolean;
  privacySettings: boolean;
  editPassword: boolean;
  edit2FA: boolean;
  sessionsActivity: boolean;
}

export default function AccountSettingsPage() {
  const [modals, setModals] = useState<ModalState>({
    profileEdit: false,
    localeSettings: false,
    manageNotifications: false,
    privacySettings: false,
    editPassword: false,
    edit2FA: false,
    sessionsActivity: false,
  });

  const openModal = (modal: keyof ModalState) => {
    setModals(prev => ({ ...prev, [modal]: true }));
  };

  const closeModal = (modal: keyof ModalState) => {
    setModals(prev => ({ ...prev, [modal]: false }));
  };

  // Mock data - in real app, this would come from props or server state
  const user = { email: 'user@example.com', full_name: 'John Doe' };
  const userDetails = { full_name: 'John Doe' };
  const is2FAEnabled = false;
  const lastPasswordChange = '2024-01-15';
  const activeSessions = 3;

  const AccountSettingsCard = ({ 
    icon: Icon, 
    title, 
    description, 
    action, 
    status,
    onAction 
  }: {
    icon: any;
    title: string;
    description: string;
    action: string;
    status?: string;
    onAction: () => void;
  }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">{title}</CardTitle>
              <CardDescription className="text-sm">{description}</CardDescription>
            </div>
          </div>
          {status && (
            <Badge variant="secondary" className="text-xs">
              {status}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onAction}
          className="w-full"
        >
          {action}
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Account Settings</h1>
        <p className="text-muted-foreground">
          Manage your account information, security, and preferences
        </p>
      </div>

      <Tabs defaultValue="account" className="space-y-6">
        <TabsList>
          <TabsTrigger value="account">
            <User className="w-4 h-4 mr-2" />
            Account
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="w-4 h-4 mr-2" />
            Security
          </TabsTrigger>
          <TabsTrigger value="billing">
            <CreditCard className="w-4 h-4 mr-2" />
            Billing
          </TabsTrigger>
        </TabsList>

        {/* Account Tab */}
        <TabsContent value="account" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AccountSettingsCard
              icon={User}
              title="Profile"
              description={`${userDetails?.full_name || 'No name set'} • ${user.email}`}
              action="Edit Profile"
              onAction={() => openModal('profileEdit')}
            />
            
            <AccountSettingsCard
              icon={Globe}
              title="Locale & Region"
              description="English (US) • UTC-8"
              action="Change Locale"
              onAction={() => openModal('localeSettings')}
            />
            
            <AccountSettingsCard
              icon={Bell}
              title="Notifications"
              description="Email enabled • Push enabled"
              action="Manage"
              onAction={() => openModal('manageNotifications')}
            />
            
            <AccountSettingsCard
              icon={Eye}
              title="Privacy"
              description="Private profile • Activity tracking on"
              action="Configure"
              onAction={() => openModal('privacySettings')}
            />
          </div>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AccountSettingsCard
              icon={Key}
              title="Password"
              description={`Last changed ${lastPasswordChange}`}
              action="Change Password"
              onAction={() => openModal('editPassword')}
            />
            
            <AccountSettingsCard
              icon={Lock}
              title="Two-Factor Authentication"
              description={is2FAEnabled ? "Enabled" : "Not enabled"}
              action={is2FAEnabled ? "Manage 2FA" : "Setup 2FA"}
              status={is2FAEnabled ? "Enabled" : "Disabled"}
              onAction={() => openModal('edit2FA')}
            />
            
            <AccountSettingsCard
              icon={Smartphone}
              title="Biometric Authentication"
              description="Not available on this device"
              action="Setup"
              status="Unavailable"
              onAction={() => {}}
            />
            
            <AccountSettingsCard
              icon={Activity}
              title="Active Sessions"
              description={`${activeSessions} active sessions`}
              action="View Activity"
              onAction={() => openModal('sessionsActivity')}
            />
          </div>
        </TabsContent>

        {/* Billing Tab */}
        <TabsContent value="billing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Billing & Subscription
              </CardTitle>
              <CardDescription>
                Manage your billing and subscription settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Billing Management</h3>
                <p className="text-muted-foreground mb-4">
                  Manage your billing and subscription settings
                </p>
                <Button asChild>
                  <a href="/settings/billing">Go to Billing Settings</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <ProfileEditModal
        open={modals.profileEdit}
        onOpenChange={(open) => closeModal('profileEdit')}
        user={user}
      />
      
      <LocaleSettingsModal
        open={modals.localeSettings}
        onOpenChange={(open) => closeModal('localeSettings')}
        currentLocale="en"
      />
      
      <ManageNotificationsModal
        open={modals.manageNotifications}
        onOpenChange={(open) => closeModal('manageNotifications')}
      />
      
      <PrivacySettingsModal
        open={modals.privacySettings}
        onOpenChange={(open) => closeModal('privacySettings')}
      />
      
      <EditPasswordModal
        open={modals.editPassword}
        onOpenChange={(open) => closeModal('editPassword')}
      />
      
      <Edit2FAModal
        open={modals.edit2FA}
        onOpenChange={(open) => closeModal('edit2FA')}
        is2FAEnabled={is2FAEnabled}
      />
      
      <SessionsActivityModal
        open={modals.sessionsActivity}
        onOpenChange={(open) => closeModal('sessionsActivity')}
      />
    </div>
  );
}
