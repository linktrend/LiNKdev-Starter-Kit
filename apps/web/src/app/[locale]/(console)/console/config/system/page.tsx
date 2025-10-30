'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Cpu,
  Save,
  RefreshCw,
  Database,
  Zap,
  HardDrive,
  Gauge,
  Server,
} from 'lucide-react';

export default function SystemPage() {
  const [systemConfig, setSystemConfig] = useState({
    databaseHost: 'db.example.com',
    databasePort: 5432,
    databaseName: 'ltm_starter',
    cacheEnabled: true,
    cacheTTL: 3600,
    logLevel: 'info',
    enableMetrics: true,
    maxConnections: 100,
    workerThreads: 4,
    memoryLimit: 2048,
  });

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cpu className="h-5 w-5" />
            System Configuration
          </CardTitle>
          <CardDescription>System-level settings and infrastructure</CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="space-y-4 sm:space-y-6 lg:space-y-8">
            <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
              {/* Database Configuration */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Database
                  </CardTitle>
                  <CardDescription>Database connection settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="dbHost">Host</Label>
                    <Input
                      id="dbHost"
                      value={systemConfig.databaseHost}
                      onChange={(e) => setSystemConfig({ ...systemConfig, databaseHost: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="dbPort">Port</Label>
                      <Input
                        id="dbPort"
                        type="number"
                        value={systemConfig.databasePort}
                        onChange={(e) => setSystemConfig({ ...systemConfig, databasePort: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dbName">Database Name</Label>
                      <Input
                        id="dbName"
                        value={systemConfig.databaseName}
                        onChange={(e) => setSystemConfig({ ...systemConfig, databaseName: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxConnections">Max Connections</Label>
                    <Input
                      id="maxConnections"
                      type="number"
                      value={systemConfig.maxConnections}
                      onChange={(e) => setSystemConfig({ ...systemConfig, maxConnections: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Cache Configuration */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Cache
                  </CardTitle>
                  <CardDescription>Cache and performance settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Enable Cache</Label>
                      <p className="text-sm text-muted-foreground">Use Redis for caching</p>
                    </div>
                    <Switch
                      checked={systemConfig.cacheEnabled}
                      onCheckedChange={(checked) => setSystemConfig({ ...systemConfig, cacheEnabled: checked })}
                    />
                  </div>
                  {systemConfig.cacheEnabled && (
                    <div className="space-y-2">
                      <Label htmlFor="cacheTTL">Cache TTL (seconds)</Label>
                      <Input
                        id="cacheTTL"
                        type="number"
                        value={systemConfig.cacheTTL}
                        onChange={(e) => setSystemConfig({ ...systemConfig, cacheTTL: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Logging Configuration */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gauge className="h-5 w-5" />
                    Logging
                  </CardTitle>
                  <CardDescription>Application logging configuration</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="logLevel">Log Level</Label>
                    <select
                      id="logLevel"
                      value={systemConfig.logLevel}
                      onChange={(e) => setSystemConfig({ ...systemConfig, logLevel: e.target.value })}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="debug">Debug</option>
                      <option value="info">Info</option>
                      <option value="warn">Warn</option>
                      <option value="error">Error</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Enable Metrics</Label>
                      <p className="text-sm text-muted-foreground">Collect and export system metrics</p>
                    </div>
                    <Switch
                      checked={systemConfig.enableMetrics}
                      onCheckedChange={(checked) => setSystemConfig({ ...systemConfig, enableMetrics: checked })}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Performance Configuration */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Server className="h-5 w-5" />
                    Performance
                  </CardTitle>
                  <CardDescription>Server performance settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="workerThreads">Worker Threads</Label>
                    <Input
                      id="workerThreads"
                      type="number"
                      value={systemConfig.workerThreads}
                      onChange={(e) => setSystemConfig({ ...systemConfig, workerThreads: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="memoryLimit">Memory Limit (MB)</Label>
                    <Input
                      id="memoryLimit"
                      type="number"
                      value={systemConfig.memoryLimit}
                      onChange={(e) => setSystemConfig({ ...systemConfig, memoryLimit: parseInt(e.target.value) || 0 })}
                    />
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

