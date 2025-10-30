'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Settings,
  Save,
  RefreshCw,
  Building2,
  Globe,
  Shield,
  Clock,
  Activity,
} from 'lucide-react';

export default function ApplicationSettingsPage() {
  const [appConfig, setAppConfig] = useState({
    appName: 'LTM Starter Kit',
    appVersion: '2.1.0',
    description: 'Enterprise SaaS application platform',
    timezone: 'America/New_York',
    locale: 'en-US',
    enableRateLimiting: true,
    rateLimitPerMinute: 60,
    sessionTimeout: 3600,
    maxSessionDuration: 86400,
    enableAPILogging: true,
    enableAuditLogs: true,
  });

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Application Settings
          </CardTitle>
          <CardDescription>Core application settings and configuration</CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="space-y-4 sm:space-y-6 lg:space-y-8">
            <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Basic Information
                  </CardTitle>
                  <CardDescription>Core application settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="appName">Application Name</Label>
                    <Input
                      id="appName"
                      value={appConfig.appName}
                      onChange={(e) => setAppConfig({ ...appConfig, appName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="appVersion">Version</Label>
                    <Input
                      id="appVersion"
                      value={appConfig.appVersion}
                      onChange={(e) => setAppConfig({ ...appConfig, appVersion: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={appConfig.description}
                      onChange={(e) => setAppConfig({ ...appConfig, description: e.target.value })}
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Localization */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Localization
                  </CardTitle>
                  <CardDescription>Language and regional settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select
                      value={appConfig.timezone}
                      onValueChange={(value) => setAppConfig({ ...appConfig, timezone: value })}
                    >
                      <SelectTrigger id="timezone">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="America/New_York">America/New_York (EST)</SelectItem>
                        <SelectItem value="America/Los_Angeles">America/Los_Angeles (PST)</SelectItem>
                        <SelectItem value="Europe/London">Europe/London (GMT)</SelectItem>
                        <SelectItem value="Europe/Paris">Europe/Paris (CET)</SelectItem>
                        <SelectItem value="Asia/Tokyo">Asia/Tokyo (JST)</SelectItem>
                        <SelectItem value="UTC">UTC</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="locale">Locale</Label>
                    <Select
                      value={appConfig.locale}
                      onValueChange={(value) => setAppConfig({ ...appConfig, locale: value })}
                    >
                      <SelectTrigger id="locale">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en-US">English (US)</SelectItem>
                        <SelectItem value="en-GB">English (UK)</SelectItem>
                        <SelectItem value="es-ES">Spanish (Spain)</SelectItem>
                        <SelectItem value="es-MX">Spanish (Mexico)</SelectItem>
                        <SelectItem value="fr-FR">French</SelectItem>
                        <SelectItem value="de-DE">German</SelectItem>
                        <SelectItem value="ja-JP">Japanese</SelectItem>
                        <SelectItem value="zh-CN">Chinese (Simplified)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* API Rate Limiting */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    API Rate Limiting
                  </CardTitle>
                  <CardDescription>Control API request limits</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Enable Rate Limiting</Label>
                      <p className="text-sm text-muted-foreground">Limit API requests per minute</p>
                    </div>
                    <Switch
                      checked={appConfig.enableRateLimiting}
                      onCheckedChange={(checked) => setAppConfig({ ...appConfig, enableRateLimiting: checked })}
                    />
                  </div>
                  {appConfig.enableRateLimiting && (
                    <div className="space-y-2">
                      <Label htmlFor="rateLimit">Requests per Minute</Label>
                      <Input
                        id="rateLimit"
                        type="number"
                        value={appConfig.rateLimitPerMinute}
                        onChange={(e) => setAppConfig({ ...appConfig, rateLimitPerMinute: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Session Management */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Session Management
                  </CardTitle>
                  <CardDescription>User session configuration</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="sessionTimeout">Session Timeout (seconds)</Label>
                    <Input
                      id="sessionTimeout"
                      type="number"
                      value={appConfig.sessionTimeout}
                      onChange={(e) => setAppConfig({ ...appConfig, sessionTimeout: parseInt(e.target.value) || 0 })}
                    />
                    <p className="text-xs text-muted-foreground">Time before session expires due to inactivity</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxSessionDuration">Max Session Duration (seconds)</Label>
                    <Input
                      id="maxSessionDuration"
                      type="number"
                      value={appConfig.maxSessionDuration}
                      onChange={(e) => setAppConfig({ ...appConfig, maxSessionDuration: parseInt(e.target.value) || 0 })}
                    />
                    <p className="text-xs text-muted-foreground">Maximum session lifetime regardless of activity</p>
                  </div>
                </CardContent>
              </Card>

              {/* Logging & Audit */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Logging & Audit
                  </CardTitle>
                  <CardDescription>Configure application logging and audit trails</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>API Logging</Label>
                        <p className="text-sm text-muted-foreground">Log all API requests and responses</p>
                      </div>
                      <Switch
                        checked={appConfig.enableAPILogging}
                        onCheckedChange={(checked) => setAppConfig({ ...appConfig, enableAPILogging: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Audit Logs</Label>
                        <p className="text-sm text-muted-foreground">Track all user actions and changes</p>
                      </div>
                      <Switch
                        checked={appConfig.enableAuditLogs}
                        onCheckedChange={(checked) => setAppConfig({ ...appConfig, enableAuditLogs: checked })}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset
              </Button>
              <Button>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

