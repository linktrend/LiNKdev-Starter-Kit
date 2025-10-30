'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Rocket,
  Save,
  RefreshCw,
  Cloud,
  GitBranch,
  Play,
  History,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react';

// Mock data for deployment history
const mockDeployments = [
  { id: 1, version: 'v2.1.0', environment: 'production', status: 'success', deployedAt: '2025-01-27 14:30:15', duration: '2m 34s', commit: 'a3f9b2c', branch: 'main', deployedBy: 'Sarah Johnson' },
  { id: 2, version: 'v2.0.9', environment: 'staging', status: 'success', deployedAt: '2025-01-27 12:15:42', duration: '1m 52s', commit: 'd7e8f1a', branch: 'develop', deployedBy: 'John Doe' },
  { id: 3, version: 'v2.0.8', environment: 'production', status: 'success', deployedAt: '2025-01-26 18:45:20', duration: '2m 10s', commit: 'f5a6b3c', branch: 'main', deployedBy: 'Sarah Johnson' },
  { id: 4, version: 'v2.0.7', environment: 'production', status: 'failed', deployedAt: '2025-01-26 16:20:55', duration: '45s', commit: 'e4d5c2b', branch: 'main', deployedBy: 'John Doe' },
];

export default function ApplicationDeploymentPage() {
  const [deploymentConfig, setDeploymentConfig] = useState({
    buildCommand: 'pnpm build',
    startCommand: 'pnpm start',
    nodeVersion: '18.x',
    autoDeploy: true,
    enableRollback: true,
    healthCheckUrl: '/api/health',
    deploymentTimeout: 600,
  });

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Rocket className="h-5 w-5" />
            Deployment
          </CardTitle>
          <CardDescription>Configure and manage deployments</CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="space-y-4 sm:space-y-6 lg:space-y-8">
            <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
              {/* Build Configuration */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Cloud className="h-5 w-5" />
                    Build Configuration
                  </CardTitle>
                  <CardDescription>Build and deployment commands</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="buildCommand">Build Command</Label>
                    <Input
                      id="buildCommand"
                      value={deploymentConfig.buildCommand}
                      onChange={(e) => setDeploymentConfig({ ...deploymentConfig, buildCommand: e.target.value })}
                      placeholder="pnpm build"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="startCommand">Start Command</Label>
                    <Input
                      id="startCommand"
                      value={deploymentConfig.startCommand}
                      onChange={(e) => setDeploymentConfig({ ...deploymentConfig, startCommand: e.target.value })}
                      placeholder="pnpm start"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nodeVersion">Node.js Version</Label>
                    <Select
                      value={deploymentConfig.nodeVersion}
                      onValueChange={(value) => setDeploymentConfig({ ...deploymentConfig, nodeVersion: value })}
                    >
                      <SelectTrigger id="nodeVersion">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="16.x">16.x</SelectItem>
                        <SelectItem value="18.x">18.x</SelectItem>
                        <SelectItem value="20.x">20.x</SelectItem>
                        <SelectItem value="22.x">22.x</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="healthCheckUrl">Health Check URL</Label>
                    <Input
                      id="healthCheckUrl"
                      value={deploymentConfig.healthCheckUrl}
                      onChange={(e) => setDeploymentConfig({ ...deploymentConfig, healthCheckUrl: e.target.value })}
                      placeholder="/api/health"
                    />
                  </div>
                  <Button className="w-full">
                    <Save className="h-4 w-4 mr-2" />
                    Save Configuration
                  </Button>
                </CardContent>
              </Card>

              {/* Deployment Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GitBranch className="h-5 w-5" />
                    Deployment Settings
                  </CardTitle>
                  <CardDescription>Deployment automation and options</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Auto Deploy</Label>
                      <p className="text-sm text-muted-foreground">Automatically deploy on push to main</p>
                    </div>
                    <Switch
                      checked={deploymentConfig.autoDeploy}
                      onCheckedChange={(checked) => setDeploymentConfig({ ...deploymentConfig, autoDeploy: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Enable Rollback</Label>
                      <p className="text-sm text-muted-foreground">Allow rolling back to previous versions</p>
                    </div>
                    <Switch
                      checked={deploymentConfig.enableRollback}
                      onCheckedChange={(checked) => setDeploymentConfig({ ...deploymentConfig, enableRollback: checked })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="deploymentTimeout">Deployment Timeout (seconds)</Label>
                    <Input
                      id="deploymentTimeout"
                      type="number"
                      value={deploymentConfig.deploymentTimeout}
                      onChange={(e) => setDeploymentConfig({ ...deploymentConfig, deploymentTimeout: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Deployment History */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <History className="h-5 w-5" />
                      Deployment History
                    </CardTitle>
                    <CardDescription>Recent deployments and their status</CardDescription>
                  </div>
                  <Button variant="outline" size="sm">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Version</TableHead>
                      <TableHead className="hidden md:table-cell">Environment</TableHead>
                      <TableHead className="hidden lg:table-cell">Commit</TableHead>
                      <TableHead className="hidden lg:table-cell">Branch</TableHead>
                      <TableHead className="hidden md:table-cell">Deployed At</TableHead>
                      <TableHead className="hidden lg:table-cell">Duration</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-center w-[96px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockDeployments.map((deployment) => (
                      <TableRow key={deployment.id}>
                        <TableCell className="font-medium">{deployment.version}</TableCell>
                        <TableCell className="hidden md:table-cell">
                          <Badge variant="secondary">{deployment.environment}</Badge>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell font-mono text-sm">
                          {deployment.commit}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <div className="flex items-center gap-1">
                            <GitBranch className="h-3 w-3" />
                            {deployment.branch}
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                          {deployment.deployedAt}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-sm">
                          {deployment.duration}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={deployment.status === 'success' ? 'default' : 'destructive'}
                            className={deployment.status === 'success' ? 'bg-green-600' : ''}
                          >
                            {deployment.status === 'success' ? (
                              <CheckCircle className="h-3 w-3 mr-1" />
                            ) : (
                              <AlertCircle className="h-3 w-3 mr-1" />
                            )}
                            {deployment.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            {deployment.status === 'success' && deploymentConfig.enableRollback && (
                              <Button variant="ghost" size="sm" className="h-8">
                                <RotateCcw className="h-3 w-3 mr-1" />
                                Rollback
                              </Button>
                            )}
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Deploy, test, or manage releases</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Button>
                    <Play className="h-4 w-4 mr-2" />
                    Deploy to Staging
                  </Button>
                  <Button variant="outline">
                    <Cloud className="h-4 w-4 mr-2" />
                    Deploy to Production
                  </Button>
                  <Button variant="outline">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Trigger Build
                  </Button>
                  <Button variant="outline">
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Run Health Check
                  </Button>
                </div>
              </CardContent>
            </Card>

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

