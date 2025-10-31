'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getBadgeClasses } from '@/components/ui/badge.presets';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Workflow, RefreshCw, ExternalLink, Activity, TrendingUp, AlertTriangle } from 'lucide-react';

export default function AutomationsPage() {
  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Workflow className="h-5 w-5" />
            Automations
          </CardTitle>
          <CardDescription>Manage n8n workflows and automation</CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="space-y-4 sm:space-y-6 lg:space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold">Workflow Status</h3>
                <p className="text-sm text-muted-foreground">Monitor n8n workflows configured in your n8n instance</p>
              </div>
              <Button variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Active Workflows</CardTitle>
                  <Workflow className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">12</div>
                  <p className="text-xs text-muted-foreground mt-1">Currently running</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Workflows</CardTitle>
                  <Activity className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">48</div>
                  <p className="text-xs text-muted-foreground mt-1">Configured in n8n</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">98.5%</div>
                  <p className="text-xs text-muted-foreground mt-1">Last 24 hours</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Failed Runs</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">3</div>
                  <p className="text-xs text-muted-foreground mt-1">Requires attention</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Workflow Overview</CardTitle>
                <CardDescription>Recent workflow executions and status</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Workflow Name</TableHead>
                      <TableHead className="hidden md:table-cell text-center">Status</TableHead>
                      <TableHead className="hidden lg:table-cell">Last Run</TableHead>
                      <TableHead className="hidden lg:table-cell">Next Run</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">Email Notification Workflow</TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge className={getBadgeClasses('success.soft')}>Running</Badge>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-muted-foreground text-sm">5 minutes ago</TableCell>
                      <TableCell className="hidden lg:table-cell text-muted-foreground text-sm">In 55 minutes</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" className="h-8">
                          <ExternalLink className="h-3 w-3 mr-1" />
                          View in n8n
                        </Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Data Sync Workflow</TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge className={getBadgeClasses('success.soft')}>Active</Badge>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-muted-foreground text-sm">2 hours ago</TableCell>
                      <TableCell className="hidden lg:table-cell text-muted-foreground text-sm">Daily at 3:00 AM</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" className="h-8">
                          <ExternalLink className="h-3 w-3 mr-1" />
                          View in n8n
                        </Button>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

