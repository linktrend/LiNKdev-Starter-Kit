'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getBadgeClasses } from '@/components/ui/badge.presets';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Key, Plus, Copy, Trash2 } from 'lucide-react';

export default function APIKeysPage() {
  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            External API & Keys
          </CardTitle>
          <CardDescription>Manage API keys and external service connections</CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="space-y-4 sm:space-y-6 lg:space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold">API Keys</h3>
                <p className="text-sm text-muted-foreground">Keys issued to developers for accessing your API</p>
              </div>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Generate Key
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Active API Keys</CardTitle>
                <CardDescription>Keys that can access your API endpoints</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Key Name</TableHead>
                      <TableHead className="hidden md:table-cell">Key Prefix</TableHead>
                      <TableHead className="hidden lg:table-cell">Created</TableHead>
                      <TableHead className="hidden lg:table-cell">Last Used</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead className="text-center w-[96px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">Production API Key</TableCell>
                      <TableCell className="hidden md:table-cell font-mono text-sm">sk_live_...</TableCell>
                      <TableCell className="hidden lg:table-cell text-muted-foreground text-sm">2025-01-15</TableCell>
                      <TableCell className="hidden lg:table-cell text-muted-foreground text-sm">2 hours ago</TableCell>
                      <TableCell>
                        <Badge className={getBadgeClasses('security.active')}>Active</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Copy className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Development API Key</TableCell>
                      <TableCell className="hidden md:table-cell font-mono text-sm">sk_test_...</TableCell>
                      <TableCell className="hidden lg:table-cell text-muted-foreground text-sm">2025-01-20</TableCell>
                      <TableCell className="hidden lg:table-cell text-muted-foreground text-sm">5 days ago</TableCell>
                      <TableCell>
                        <Badge className={getBadgeClasses('security.active')}>Active</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Copy className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
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

