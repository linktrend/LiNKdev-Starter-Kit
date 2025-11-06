'use client';

import { TrendingUp, Database, Activity, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function DashboardPage() {
  // Mock user for preview purposes
  const displayUser = {
    id: 'preview-user-id',
    email: 'preview@example.com',
    name: 'Preview User'
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Metric Cards */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-primary" />
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-2xl font-bold">$45,231.89</div>
            <p className="text-xs text-muted-foreground">
              +20.1% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-warning" />
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-2xl font-bold">2,350</div>
            <p className="text-xs text-muted-foreground">
              +180.1% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-success" />
              <CardTitle className="text-sm font-medium">Subscriptions</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-2xl font-bold">+12,234</div>
            <p className="text-xs text-muted-foreground">
              +19% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-danger" />
              <CardTitle className="text-sm font-medium">API Calls</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-2xl font-bold">573</div>
            <p className="text-xs text-muted-foreground">
              +201 since last hour
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Welcome Section */}
      <Card>
        <CardHeader>
          <CardTitle>Welcome to LTM Starter Kit</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This is a template dashboard. Replace this component with your actual content.
          </p>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium">New user registered</p>
                <p className="text-xs text-muted-foreground">2 minutes ago</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium">Database backup completed</p>
                <p className="text-xs text-muted-foreground">1 hour ago</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium">API endpoint updated</p>
                <p className="text-xs text-muted-foreground">3 hours ago</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
