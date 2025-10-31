'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  Globe,
  Plus,
  Eye,
  EyeOff,
  Copy,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Lock,
} from 'lucide-react';

// Mock data for environment variables
const mockEnvVars = [
  { key: 'DATABASE_URL', value: 'postgresql://...', environment: 'production', type: 'secret', lastUpdated: '2025-01-27 10:23:15' },
  { key: 'API_KEY', value: 'sk_live_...', environment: 'production', type: 'secret', lastUpdated: '2025-01-27 09:15:42' },
  { key: 'STRIPE_SECRET_KEY', value: 'sk_live_...', environment: 'production', type: 'secret', lastUpdated: '2025-01-27 09:15:42' },
  { key: 'NEXT_PUBLIC_API_URL', value: 'https://api.example.com', environment: 'production', type: 'public', lastUpdated: '2025-01-27 08:45:30' },
  { key: 'REDIS_URL', value: 'redis://...', environment: 'production', type: 'secret', lastUpdated: '2025-01-26 16:20:10' },
  { key: 'LOG_LEVEL', value: 'info', environment: 'production', type: 'public', lastUpdated: '2025-01-25 14:32:55' },
  { key: 'SENTRY_DSN', value: 'https://...', environment: 'production', type: 'secret', lastUpdated: '2025-01-24 11:10:20' },
];

export default function EnvironmentPage() {
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});

  const toggleSecretVisibility = (key: string) => {
    setShowSecrets((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const copyToClipboard = (value: string) => {
    navigator.clipboard.writeText(value);
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Environment Variables
          </CardTitle>
          <CardDescription>Manage environment-specific configuration</CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="space-y-4 sm:space-y-6 lg:space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex gap-2">
                <Select defaultValue="production">
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="production">Production</SelectItem>
                    <SelectItem value="staging">Staging</SelectItem>
                    <SelectItem value="development">Development</SelectItem>
                  </SelectContent>
                </Select>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Variable
                </Button>
              </div>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table className="font-sans not-prose [&_th]:font-sans [&_td]:font-sans [&_code]:font-sans">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Key</TableHead>
                      <TableHead className="hidden md:table-cell">Value</TableHead>
                      <TableHead className="hidden lg:table-cell">Environment</TableHead>
                      <TableHead className="hidden lg:table-cell">Type</TableHead>
                      <TableHead className="hidden lg:table-cell">Last Updated</TableHead>
                      <TableHead className="text-center w-[96px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockEnvVars.map((envVar) => (
                      <TableRow key={envVar.key}>
                        <TableCell className="font-medium font-sans">{envVar.key}</TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="flex items-center gap-2 max-w-md">
                            <code className="text-sm truncate font-sans">
                              {envVar.type === 'secret' && !showSecrets[envVar.key]
                                ? '••••••••••••'
                                : envVar.value}
                            </code>
                            {envVar.type === 'secret' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0"
                                onClick={() => toggleSecretVisibility(envVar.key)}
                              >
                                {showSecrets[envVar.key] ? (
                                  <EyeOff className="h-5 w-5" />
                                ) : (
                                  <Eye className="h-5 w-5" />
                                )}
                              </Button>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <Badge variant="secondary">{envVar.environment}</Badge>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <Badge variant={envVar.type === 'secret' ? 'default' : 'outline'}>
                            {envVar.type === 'secret' ? (
                              <Lock className="h-3 w-3 mr-1" />
                            ) : null}
                            {envVar.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-muted-foreground text-sm">
                          {envVar.lastUpdated}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="p-0"
                              onClick={() => copyToClipboard(envVar.value)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="p-0"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Environment Health Check */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5" />
                  Environment Health
                </CardTitle>
                <CardDescription>Status of environment-specific services</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="flex items-center gap-3 p-3 rounded-lg border">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-sm font-medium">Production</p>
                      <p className="text-xs text-muted-foreground">All systems operational</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg border">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-sm font-medium">Staging</p>
                      <p className="text-xs text-muted-foreground">All systems operational</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg border">
                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                    <div>
                      <p className="text-sm font-medium">Development</p>
                      <p className="text-xs text-muted-foreground">1 service warning</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

