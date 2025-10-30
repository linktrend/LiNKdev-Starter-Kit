'use client';

import { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { getBadgeClasses } from '@/components/ui/badge.presets';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Flag,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Settings,
  Activity,
  Users,
  Zap,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
} from 'lucide-react';
import type { FeatureFlagName } from '@starter/types';

interface FeatureFlag {
  id: string;
  name: FeatureFlagName | string;
  displayName: string;
  description: string;
  isEnabled: boolean;
  category: 'core' | 'billing' | 'analytics' | 'beta' | 'security';
  environment: 'development' | 'staging' | 'production';
  createdAt: string;
  updatedAt: string;
  updatedBy: string;
  usageCount?: number;
  organizationIds?: string[];
}

// Mock data for UI/UX review
const mockFlags: FeatureFlag[] = [
  {
    id: '1',
    name: 'RECORDS_FEATURE_ENABLED',
    displayName: 'Records Feature',
    description: 'Enable the core records management system',
    isEnabled: true,
    category: 'core',
    environment: 'production',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-27T14:30:00Z',
    updatedBy: 'Sarah Johnson',
    usageCount: 1250,
    organizationIds: ['org-1', 'org-2', 'org-3'],
  },
  {
    id: '2',
    name: 'BILLING_FEATURE_ENABLED',
    displayName: 'Billing System',
    description: 'Enable billing and subscription management',
    isEnabled: true,
    category: 'billing',
    environment: 'production',
    createdAt: '2024-01-10T09:00:00Z',
    updatedAt: '2024-01-26T16:20:00Z',
    updatedBy: 'Michael Chen',
    usageCount: 890,
    organizationIds: ['org-1', 'org-2'],
  },
  {
    id: '3',
    name: 'AUDIT_FEATURE_ENABLED',
    displayName: 'Audit Logging',
    description: 'Enable comprehensive audit trail and logging',
    isEnabled: false,
    category: 'security',
    environment: 'production',
    createdAt: '2024-01-20T11:00:00Z',
    updatedAt: '2024-01-25T10:15:00Z',
    updatedBy: 'Sarah Johnson',
    usageCount: 450,
  },
  {
    id: '4',
    name: 'SCHEDULING_FEATURE_ENABLED',
    displayName: 'Scheduling Module',
    description: 'Enable appointment and task scheduling',
    isEnabled: true,
    category: 'core',
    environment: 'production',
    createdAt: '2024-01-12T08:00:00Z',
    updatedAt: '2024-01-27T09:45:00Z',
    updatedBy: 'Emily Rodriguez',
    usageCount: 2100,
    organizationIds: ['org-1', 'org-2', 'org-3', 'org-4'],
  },
  {
    id: '5',
    name: 'ATTACHMENTS_FEATURE_ENABLED',
    displayName: 'File Attachments',
    description: 'Enable file upload and attachment functionality',
    isEnabled: true,
    category: 'core',
    environment: 'production',
    createdAt: '2024-01-18T14:00:00Z',
    updatedAt: '2024-01-27T11:30:00Z',
    updatedBy: 'Michael Chen',
    usageCount: 3200,
    organizationIds: ['org-1', 'org-2', 'org-3', 'org-4', 'org-5'],
  },
  {
    id: '6',
    name: 'ADVANCED_ANALYTICS_ENABLED',
    displayName: 'Advanced Analytics',
    description: 'Enable advanced reporting and analytics dashboard',
    isEnabled: false,
    category: 'analytics',
    environment: 'staging',
    createdAt: '2024-01-22T13:00:00Z',
    updatedAt: '2024-01-26T15:00:00Z',
    updatedBy: 'Emily Rodriguez',
    usageCount: 120,
  },
  {
    id: '7',
    name: 'BETA_FEATURES_ENABLED',
    displayName: 'Beta Features',
    description: 'Enable access to experimental and beta features',
    isEnabled: true,
    category: 'beta',
    environment: 'development',
    createdAt: '2024-01-25T09:00:00Z',
    updatedAt: '2024-01-27T13:20:00Z',
    updatedBy: 'Sarah Johnson',
    usageCount: 85,
    organizationIds: ['org-1'],
  },
];

// Category and environment badges derive from centralized presets

export function ConsoleFlagsPage() {
  const [flags, setFlags] = useState<FeatureFlag[]>(mockFlags);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [environmentFilter, setEnvironmentFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingFlag, setEditingFlag] = useState<FeatureFlag | null>(null);
  const [deleteFlagId, setDeleteFlagId] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [expandedFlags, setExpandedFlags] = useState<Set<string>>(new Set());

  const filteredFlags = useMemo(() => {
    return flags.filter((flag) => {
      const matchesSearch =
        flag.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        flag.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        flag.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || flag.category === categoryFilter;
      const matchesEnvironment =
        environmentFilter === 'all' || flag.environment === environmentFilter;
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'enabled' && flag.isEnabled) ||
        (statusFilter === 'disabled' && !flag.isEnabled);

      return matchesSearch && matchesCategory && matchesEnvironment && matchesStatus;
    });
  }, [flags, searchQuery, categoryFilter, environmentFilter, statusFilter]);

  const stats = useMemo(() => {
    const total = flags.length;
    const enabled = flags.filter((f) => f.isEnabled).length;
    const disabled = total - enabled;
    const productionFlags = flags.filter((f) => f.environment === 'production').length;
    const totalUsage = flags.reduce((sum, f) => sum + (f.usageCount || 0), 0);

    return { total, enabled, disabled, productionFlags, totalUsage };
  }, [flags]);

  const handleToggle = (id: string, newValue: boolean) => {
    setFlags((prev) =>
      prev.map((flag) =>
        flag.id === id
          ? {
              ...flag,
              isEnabled: newValue,
              updatedAt: new Date().toISOString(),
              updatedBy: 'Current User', // Mock
            }
          : flag
      )
    );
  };

  const handleCreate = (data: Omit<FeatureFlag, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newFlag: FeatureFlag = {
      ...data,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setFlags((prev) => [...prev, newFlag]);
    setIsCreateModalOpen(false);
  };

  const handleUpdate = (id: string, data: Partial<FeatureFlag>) => {
    setFlags((prev) =>
      prev.map((flag) =>
        flag.id === id
          ? {
              ...flag,
              ...data,
              updatedAt: new Date().toISOString(),
              updatedBy: 'Current User', // Mock
            }
          : flag
      )
    );
    setEditingFlag(null);
  };

  const handleDelete = (id: string) => {
    setFlags((prev) => prev.filter((flag) => flag.id !== id));
    setDeleteFlagId(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const toggleFlagDetails = (flagId: string) => {
    setExpandedFlags((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(flagId)) {
        newSet.delete(flagId);
      } else {
        newSet.add(flagId);
      }
      return newSet;
    });
  };

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8 px-2 sm:px-0">
      {/* Controls */}
      <div className="flex items-center justify-end gap-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          <span>Live monitoring</span>
        </div>
        <button
          onClick={() => setAutoRefresh(!autoRefresh)}
          className="flex items-center gap-2 px-3 py-2 text-sm border rounded-lg hover:bg-accent transition-colors"
        >
          <RefreshCw className={`h-4 w-4 ${autoRefresh ? 'animate-spin' : ''}`} />
          {autoRefresh ? 'Auto-refresh' : 'Manual'}
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Flags</CardTitle>
            <Flag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Feature flags configured</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Enabled</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-green-600">{stats.enabled}</div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disabled</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-red-600">{stats.disabled}</div>
            <p className="text-xs text-muted-foreground">Inactive flags</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Production</CardTitle>
            <Activity className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{stats.productionFlags}</div>
            <p className="text-xs text-muted-foreground">Live environment</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-xl sm:text-2xl">Feature Flags</CardTitle>
              <CardDescription className="text-sm">
                Manage feature flags and control feature rollouts across environments
              </CardDescription>
            </div>
            <Button onClick={() => setIsCreateModalOpen(true)} className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Create Flag
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters and Search */}
          <div className="flex flex-col gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
              <Input
                placeholder="Search flags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="core">Core</SelectItem>
                  <SelectItem value="billing">Billing</SelectItem>
                  <SelectItem value="analytics">Analytics</SelectItem>
                  <SelectItem value="beta">Beta</SelectItem>
                  <SelectItem value="security">Security</SelectItem>
                </SelectContent>
              </Select>
              <Select value={environmentFilter} onValueChange={setEnvironmentFilter}>
                <SelectTrigger className="w-full">
                  <Zap className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Environment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Environments</SelectItem>
                  <SelectItem value="development">Development</SelectItem>
                  <SelectItem value="staging">Staging</SelectItem>
                  <SelectItem value="production">Production</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full">
                  <Settings className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="enabled">Enabled</SelectItem>
                  <SelectItem value="disabled">Disabled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Table - Desktop View */}
          <div className="hidden lg:block rounded-md border overflow-x-auto">
            <Table className="w-full">
              <TableHeader>
                <TableRow>
                  <TableHead>Flag</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Environment</TableHead>
                  <TableHead>Enable</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFlags.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No flags found. Try adjusting your filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredFlags.flatMap((flag) => {
                    const isExpanded = expandedFlags.has(flag.id);
                    return [
                      <TableRow key={flag.id}>
                        <TableCell>
                          <div className="flex flex-col">
                            <div className="font-medium">{flag.displayName}</div>
                            <button
                              onClick={() => toggleFlagDetails(flag.id)}
                              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors self-start"
                            >
                              {isExpanded ? (
                                <ChevronDown className="h-3 w-3" />
                              ) : (
                                <ChevronRight className="h-3 w-3" />
                              )}
                              <span>Details</span>
                            </button>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="capitalize">{flag.category}</span>
                        </TableCell>
                        <TableCell>
                          <span className="capitalize">{flag.environment}</span>
                        </TableCell>
                        <TableCell>
                          <Switch
                            checked={flag.isEnabled}
                            onCheckedChange={(checked) => handleToggle(flag.id, checked)}
                            className="data-[state=checked]:bg-green-500 dark:data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-red-500 dark:data-[state=unchecked]:bg-red-600"
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setEditingFlag(flag)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeleteFlagId(flag.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>,
                      isExpanded && (
                        <TableRow key={`${flag.id}-details`}>
                          <TableCell colSpan={5} className="bg-muted/30">
                            <div className="py-3 px-4 space-y-3">
                              <div>
                                <div className="text-sm font-medium mb-2">Description</div>
                                <div className="text-sm text-muted-foreground">{flag.description}</div>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t">
                                <div>
                                  <div className="text-sm font-medium mb-1">Usage</div>
                                  <div className="text-sm text-muted-foreground">
                                    <span className="font-medium">
                                      {flag.usageCount?.toLocaleString() || 0}
                                    </span>
                                    {flag.organizationIds && flag.organizationIds.length > 0 && (
                                      <span className="ml-2">
                                        ({flag.organizationIds.length} orgs)
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-sm font-medium mb-1">Last Updated</div>
                                  <div className="text-sm text-muted-foreground">
                                    {formatDate(flag.updatedAt)}
                                  </div>
                                  <div className="text-xs text-muted-foreground mt-1">
                                    by {flag.updatedBy}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      ),
                    ].filter(Boolean);
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Card View - Mobile/Tablet */}
          <div className="lg:hidden space-y-4">
            {filteredFlags.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground rounded-md border">
                No flags found. Try adjusting your filters.
              </div>
            ) : (
              filteredFlags.map((flag) => (
                <Card key={flag.id} className="overflow-hidden">
                  <CardContent className="p-4 sm:p-6">
                    <div className="space-y-4">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-base mb-1">{flag.displayName}</div>
                          <div className="text-xs text-muted-foreground font-mono mb-2">
                            {flag.name}
                          </div>
                          <p className="text-sm text-muted-foreground">{flag.description}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setEditingFlag(flag)}
                            className="h-8 w-8"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteFlagId(flag.id)}
                            className="h-8 w-8"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>

                      {/* Badges */}
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge className={getBadgeClasses('tag')}>
                          {flag.category}
                        </Badge>
                        <Badge className={getBadgeClasses(
                          flag.environment === 'production' ? 'env.production' :
                          flag.environment === 'staging' ? 'env.staging' : 'env.development'
                        )}>
                          {flag.environment}
                        </Badge>
                      </div>

                      {/* Status Toggle */}
                      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">Status</span>
                          <span className="text-xs text-muted-foreground">
                            {flag.isEnabled ? 'Enabled' : 'Disabled'}
                          </span>
                        </div>
                        <Switch
                          checked={flag.isEnabled}
                          onCheckedChange={(checked) => handleToggle(flag.id, checked)}
                        />
                      </div>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                        <div>
                          <span className="text-xs text-muted-foreground block mb-1">Usage</span>
                          <span className="text-sm font-semibold">
                            {flag.usageCount?.toLocaleString() || 0}
                          </span>
                          {flag.organizationIds && flag.organizationIds.length > 0 && (
                            <span className="text-xs text-muted-foreground ml-1">
                              ({flag.organizationIds.length} orgs)
                            </span>
                          )}
                        </div>
                        <div>
                          <span className="text-xs text-muted-foreground block mb-1">
                            Last Updated
                          </span>
                          <span className="text-sm font-semibold block">
                            {formatDate(flag.updatedAt)}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            by {flag.updatedBy}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Create Flag Modal */}
      <CreateFlagModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreate}
      />

      {/* Edit Flag Modal */}
      {editingFlag && (
        <EditFlagModal
          flag={editingFlag}
          onClose={() => setEditingFlag(null)}
          onUpdate={(data) => handleUpdate(editingFlag.id, data)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteFlagId && (
        <DeleteConfirmModal
          flagName={flags.find((f) => f.id === deleteFlagId)?.displayName || 'this flag'}
          onClose={() => setDeleteFlagId(null)}
          onConfirm={() => handleDelete(deleteFlagId)}
        />
      )}
    </div>
  );
}

// Create Flag Modal Component
function CreateFlagModal({
  isOpen,
  onClose,
  onCreate,
}: {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: Omit<FeatureFlag, 'id' | 'createdAt' | 'updatedAt'>) => void;
}) {
  const [formData, setFormData] = useState({
    name: '',
    displayName: '',
    description: '',
    category: 'core' as FeatureFlag['category'],
    environment: 'production' as FeatureFlag['environment'],
    isEnabled: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate({
      ...formData,
      updatedBy: 'Current User',
      usageCount: 0,
    });
    setFormData({
      name: '',
      displayName: '',
      description: '',
      category: 'core',
      environment: 'production',
      isEnabled: false,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl w-[95vw] sm:w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Feature Flag</DialogTitle>
          <DialogDescription>
            Add a new feature flag to control feature rollouts across your application.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Flag Name (Technical)</Label>
              <Input
                id="name"
                placeholder="FEATURE_FLAG_NAME"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              <p className="text-xs text-muted-foreground">
                Use uppercase with underscores (e.g., NEW_FEATURE_ENABLED)
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                placeholder="Feature Name"
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe what this feature flag controls..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                required
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value: FeatureFlag['category']) =>
                    setFormData({ ...formData, category: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="core">Core</SelectItem>
                    <SelectItem value="billing">Billing</SelectItem>
                    <SelectItem value="analytics">Analytics</SelectItem>
                    <SelectItem value="beta">Beta</SelectItem>
                    <SelectItem value="security">Security</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="environment">Environment</Label>
                <Select
                  value={formData.environment}
                  onValueChange={(value: FeatureFlag['environment']) =>
                    setFormData({ ...formData, environment: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="development">Development</SelectItem>
                    <SelectItem value="staging">Staging</SelectItem>
                    <SelectItem value="production">Production</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="isEnabled"
                checked={formData.isEnabled}
                onCheckedChange={(checked) => setFormData({ ...formData, isEnabled: checked })}
              />
              <Label htmlFor="isEnabled">Enable flag immediately</Label>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Create Flag</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Edit Flag Modal Component
function EditFlagModal({
  flag,
  onClose,
  onUpdate,
}: {
  flag: FeatureFlag;
  onClose: () => void;
  onUpdate: (data: Partial<FeatureFlag>) => void;
}) {
  const [formData, setFormData] = useState({
    displayName: flag.displayName,
    description: flag.description,
    category: flag.category,
    environment: flag.environment,
    isEnabled: flag.isEnabled,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(formData);
  };

  return (
    <Dialog open={!!flag} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl w-[95vw] sm:w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Feature Flag</DialogTitle>
          <DialogDescription>
            Update the configuration for {flag.name}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Flag Name (Technical)</Label>
              <Input value={flag.name} disabled />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-displayName">Display Name</Label>
              <Input
                id="edit-displayName"
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                required
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value: FeatureFlag['category']) =>
                    setFormData({ ...formData, category: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="core">Core</SelectItem>
                    <SelectItem value="billing">Billing</SelectItem>
                    <SelectItem value="analytics">Analytics</SelectItem>
                    <SelectItem value="beta">Beta</SelectItem>
                    <SelectItem value="security">Security</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-environment">Environment</Label>
                <Select
                  value={formData.environment}
                  onValueChange={(value: FeatureFlag['environment']) =>
                    setFormData({ ...formData, environment: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="development">Development</SelectItem>
                    <SelectItem value="staging">Staging</SelectItem>
                    <SelectItem value="production">Production</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="edit-isEnabled"
                checked={formData.isEnabled}
                onCheckedChange={(checked) => setFormData({ ...formData, isEnabled: checked })}
              />
              <Label htmlFor="edit-isEnabled">Enable flag</Label>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Delete Confirmation Modal
function DeleteConfirmModal({
  flagName,
  onClose,
  onConfirm,
}: {
  flagName: string;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!flagName || !mounted) return null;

  const modalContent = (
    <div 
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{ zIndex: 99999 }}
      onClick={onClose}
    >
      {/* Backdrop */}
      <div 
        className="fixed inset-0 modal-backdrop"
      />
      
      {/* Modal */}
      <div
        className="relative w-full max-w-md rounded-lg border shadow-2xl overflow-hidden modal-bg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-1 rounded-full bg-destructive/80 border-2 border-destructive shadow-lg shadow-destructive/50">
              <AlertTriangle className="h-6 w-6 text-destructive-foreground" />
            </div>
            <h2 className="text-xl font-bold">
              Delete Feature Flag
            </h2>
          </div>

          <p className="text-sm text-muted-foreground/70 mb-6">
            Are you sure you want to delete <strong>{flagName}</strong>? This action cannot be
            undone and will affect all organizations using this flag.
          </p>

          <div className="flex gap-3">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={onConfirm}
              variant="destructive"
              className="flex-1"
            >
              Delete
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

