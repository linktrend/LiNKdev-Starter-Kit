'use client'

import { ReactNode, useState } from 'react'
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
import ProfileEditModal from '@/components/profile/profile-edit-modal'
import { LocaleSettingsModal } from '@/components/settings/LocaleSettingsModal';
import { ManageNotificationsModal } from '@/components/settings/ManageNotificationsModal';
import { PrivacySettingsModal } from '@/components/settings/PrivacySettingsModal';
import { EditPasswordModal } from '@/components/settings/EditPasswordModal';
import { Edit2FAModal } from '@/components/settings/Edit2FAModal';
import { SessionsActivityModal } from '@/components/settings/SessionsActivityModal';
import type { Database } from '@/types/database.types'

// Note: Metadata removed because this is a client component

// Modal state management
interface ModalState {
  localeSettings: boolean
  manageNotifications: boolean
  privacySettings: boolean
  editPassword: boolean
  edit2FA: boolean
  sessionsActivity: boolean
}

type UserRow = Database['public']['Tables']['users']['Row']

interface AccountSettingsClientProps {
  user: UserRow
  locale: string
}

export default function AccountSettingsClient({ user, locale }: AccountSettingsClientProps) {
  const [modals, setModals] = useState<ModalState>({
    localeSettings: false,
    manageNotifications: false,
    privacySettings: false,
    editPassword: false,
    edit2FA: false,
    sessionsActivity: false,
  })

  const openModal = (modal: keyof ModalState) => {
    setModals(prev => ({ ...prev, [modal]: true }));
  };

  const closeModal = (modal: keyof ModalState) => {
    setModals(prev => ({ ...prev, [modal]: false }));
  };

  const fullName =
    user.full_name ||
    [user.first_name, user.last_name].filter(Boolean).join(' ') ||
    'No name set'
  const accountEmail = user.email ?? 'No email configured'
  const is2FAEnabled = false
  const lastPasswordChange = 'Unknown'
  const activeSessions = 0
  const localeLabel = locale?.toUpperCase?.() ?? 'EN'

  const AccountSettingsCard = ({
    icon: Icon,
    title,
    description,
    action,
    status,
    onAction,
    actionElement,
  }: {
    icon: any
    title: string
    description: string
    action?: string
    status?: string
    onAction?: () => void
    actionElement?: ReactNode
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
        {actionElement ?? (
          <Button
            variant="outline"
            size="sm"
            onClick={onAction}
            className="w-full"
          >
            {action}
          </Button>
        )}
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
              description={`${fullName} • ${accountEmail}`}
              actionElement={
                <ProfileEditModal
                  user={user}
                  locale={locale}
                  trigger={
                    <Button variant="outline" size="sm" className="w-full">
                      Edit profile
                    </Button>
                  }
                />
              }
            />
            
            <AccountSettingsCard
              icon={Globe}
              title="Locale & Region"
              description={`${localeLabel} • Default timezone`}
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
      <LocaleSettingsModal
        isOpen={modals.localeSettings}
        onClose={() => closeModal('localeSettings')}
      />
      
      <ManageNotificationsModal
        open={modals.manageNotifications}
        onOpenChange={(open) =>
          setModals((prev) => ({ ...prev, manageNotifications: open }))
        }
      />
      
      <PrivacySettingsModal
        isOpen={modals.privacySettings}
        onClose={() => closeModal('privacySettings')}
      />
      
      <EditPasswordModal
        isOpen={modals.editPassword}
        onClose={() => closeModal('editPassword')}
      />
      
      <Edit2FAModal
        open={modals.edit2FA}
        onOpenChange={(open) =>
          setModals((prev) => ({ ...prev, edit2FA: open }))
        }
        is2FAEnabled={is2FAEnabled}
      />
      
      <SessionsActivityModal
        isOpen={modals.sessionsActivity}
        onClose={() => closeModal('sessionsActivity')}
      />
    </div>
  );
}
