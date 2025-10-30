'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getBadgeClasses } from '@/components/ui/badge.presets';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Plug, Plus, Settings, DollarSign, Mail, BarChart3 } from 'lucide-react';

export default function IntegrationsPage() {
  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plug className="h-5 w-5" />
            Integrations
          </CardTitle>
          <CardDescription>Manage third-party service connections</CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="space-y-4 sm:space-y-6 lg:space-y-8">

            <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card className="hover:bg-accent transition-colors cursor-pointer">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      Stripe
                    </CardTitle>
                    <Badge className={getBadgeClasses('success.soft')}>Connected</Badge>
                  </div>
                  <CardDescription>Payment processing and subscription management</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <span className="font-medium">Active</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Last synced:</span>
                      <span className="font-medium">2 minutes ago</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:bg-accent transition-colors cursor-pointer">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Mail className="h-5 w-5" />
                      Email Service
                    </CardTitle>
                    <Badge className={getBadgeClasses('outline')}>Not Configured</Badge>
                  </div>
                  <CardDescription>Email delivery and template management</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Configure
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:bg-accent transition-colors cursor-pointer">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Analytics
                    </CardTitle>
                    <Badge className={getBadgeClasses('danger.soft')}>Not Connected</Badge>
                  </div>
                  <CardDescription>Usage analytics</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Connect
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Integration Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Integration Settings</CardTitle>
                <CardDescription>Global settings for all integrations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auto-sync Integration Data</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically synchronize data with connected services
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Webhook Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable webhook notifications for integration events
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Error Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Send alerts when integration errors occur
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

