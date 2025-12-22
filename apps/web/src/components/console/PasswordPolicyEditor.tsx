'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Save, Shield } from 'lucide-react';
import type { OrgRole } from '@starter/types';

export interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  expirationDays: number | null;
  preventReuse: number;
}

export interface SecuritySettings {
  require2FA: boolean;
  passwordPolicy: PasswordPolicy;
}

interface PasswordPolicyEditorProps {
  currentUserRole: OrgRole | null;
  settings: SecuritySettings;
  onSave: (settings: SecuritySettings) => Promise<void>;
  isLoading?: boolean;
}

const DEFAULT_POLICY: PasswordPolicy = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: false,
  expirationDays: null,
  preventReuse: 3,
};

export function PasswordPolicyEditor({
  currentUserRole,
  settings,
  onSave,
  isLoading = false,
}: PasswordPolicyEditorProps) {
  const [require2FA, setRequire2FA] = useState(settings.require2FA);
  const [policy, setPolicy] = useState<PasswordPolicy>(settings.passwordPolicy || DEFAULT_POLICY);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  const isOwner = currentUserRole === 'owner';

  useEffect(() => {
    const policyChanged = JSON.stringify(policy) !== JSON.stringify(settings.passwordPolicy);
    const twoFAChanged = require2FA !== settings.require2FA;
    setHasChanges(policyChanged || twoFAChanged);
  }, [policy, require2FA, settings]);

  const handleSave = async () => {
    if (!isOwner) return;

    setIsSaving(true);
    setError(null);

    try {
      await onSave({
        require2FA,
        passwordPolicy: policy,
      });
      setHasChanges(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setRequire2FA(settings.require2FA);
    setPolicy(settings.passwordPolicy || DEFAULT_POLICY);
    setError(null);
    setHasChanges(false);
  };

  const updatePolicy = (updates: Partial<PasswordPolicy>) => {
    setPolicy((prev) => ({ ...prev, ...updates }));
  };

  return (
    <div className="space-y-6">
      {/* 2FA Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Two-Factor Authentication
              </CardTitle>
              <CardDescription>
                Require all organization members to enable 2FA
              </CardDescription>
            </div>
            {isOwner && (
              <Badge variant={require2FA ? 'default' : 'outline'}>
                {require2FA ? 'Enforced' : 'Optional'}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="require-2fa">Enforce 2FA for all members</Label>
              <p className="text-sm text-muted-foreground">
                When enabled, all members must set up two-factor authentication to access the organization
              </p>
            </div>
            <Switch
              id="require-2fa"
              checked={require2FA}
              onCheckedChange={setRequire2FA}
              disabled={!isOwner || isLoading}
            />
          </div>
        </CardContent>
      </Card>

      {/* Password Policy */}
      <Card>
        <CardHeader>
          <CardTitle>Password Policy</CardTitle>
          <CardDescription>
            Configure password requirements for organization members
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Minimum Length */}
          <div className="space-y-2">
            <Label htmlFor="min-length">Minimum Password Length</Label>
            <div className="flex items-center gap-4">
              <Input
                id="min-length"
                type="number"
                min={8}
                max={128}
                value={policy.minLength}
                onChange={(e) => updatePolicy({ minLength: parseInt(e.target.value) || 8 })}
                disabled={!isOwner || isLoading}
                className="w-32"
              />
              <span className="text-sm text-muted-foreground">characters</span>
            </div>
          </div>

          {/* Character Requirements */}
          <div className="space-y-3">
            <Label>Character Requirements</Label>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="require-uppercase" className="font-normal">
                    Require uppercase letters (A-Z)
                  </Label>
                </div>
                <Switch
                  id="require-uppercase"
                  checked={policy.requireUppercase}
                  onCheckedChange={(checked) => updatePolicy({ requireUppercase: checked })}
                  disabled={!isOwner || isLoading}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="require-lowercase" className="font-normal">
                    Require lowercase letters (a-z)
                  </Label>
                </div>
                <Switch
                  id="require-lowercase"
                  checked={policy.requireLowercase}
                  onCheckedChange={(checked) => updatePolicy({ requireLowercase: checked })}
                  disabled={!isOwner || isLoading}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="require-numbers" className="font-normal">
                    Require numbers (0-9)
                  </Label>
                </div>
                <Switch
                  id="require-numbers"
                  checked={policy.requireNumbers}
                  onCheckedChange={(checked) => updatePolicy({ requireNumbers: checked })}
                  disabled={!isOwner || isLoading}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="require-special" className="font-normal">
                    Require special characters (!@#$%^&*)
                  </Label>
                </div>
                <Switch
                  id="require-special"
                  checked={policy.requireSpecialChars}
                  onCheckedChange={(checked) => updatePolicy({ requireSpecialChars: checked })}
                  disabled={!isOwner || isLoading}
                />
              </div>
            </div>
          </div>

          {/* Password Expiration */}
          <div className="space-y-2">
            <Label htmlFor="expiration-days">Password Expiration</Label>
            <div className="flex items-center gap-4">
              <Input
                id="expiration-days"
                type="number"
                min={0}
                max={365}
                value={policy.expirationDays || ''}
                onChange={(e) =>
                  updatePolicy({
                    expirationDays: e.target.value ? parseInt(e.target.value) : null,
                  })
                }
                disabled={!isOwner || isLoading}
                className="w-32"
                placeholder="Never"
              />
              <span className="text-sm text-muted-foreground">
                days (leave empty for no expiration)
              </span>
            </div>
          </div>

          {/* Password History */}
          <div className="space-y-2">
            <Label htmlFor="prevent-reuse">Prevent Password Reuse</Label>
            <div className="flex items-center gap-4">
              <Input
                id="prevent-reuse"
                type="number"
                min={0}
                max={24}
                value={policy.preventReuse}
                onChange={(e) => updatePolicy({ preventReuse: parseInt(e.target.value) || 0 })}
                disabled={!isOwner || isLoading}
                className="w-32"
              />
              <span className="text-sm text-muted-foreground">
                previous passwords (0 to disable)
              </span>
            </div>
          </div>

          {/* Preview */}
          <div className="rounded-lg bg-muted p-4">
            <div className="text-sm font-medium mb-2">Password Requirements Summary</div>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Minimum {policy.minLength} characters</li>
              {policy.requireUppercase && <li>• At least one uppercase letter</li>}
              {policy.requireLowercase && <li>• At least one lowercase letter</li>}
              {policy.requireNumbers && <li>• At least one number</li>}
              {policy.requireSpecialChars && <li>• At least one special character</li>}
              {policy.expirationDays && <li>• Expires every {policy.expirationDays} days</li>}
              {policy.preventReuse > 0 && (
                <li>• Cannot reuse last {policy.preventReuse} passwords</li>
              )}
            </ul>
          </div>

          {/* Error Message */}
          {error && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <p>{error}</p>
              </div>
            </div>
          )}

          {/* Owner-Only Notice */}
          {!isOwner && (
            <div className="rounded-lg bg-muted p-3 text-sm">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <p className="text-muted-foreground">
                  Only organization owners can modify security settings
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {isOwner && (
            <div className="flex items-center gap-2 pt-4">
              <Button
                onClick={handleSave}
                disabled={!hasChanges || isSaving || isLoading}
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button
                variant="outline"
                onClick={handleReset}
                disabled={!hasChanges || isSaving || isLoading}
              >
                Reset
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
