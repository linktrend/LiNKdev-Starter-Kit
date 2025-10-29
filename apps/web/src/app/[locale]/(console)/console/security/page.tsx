'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Users,
  Shield,
  History,
  LogIn,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  Globe,
  User,
  Key,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Activity,
  AlertTriangle,
  FileCheck,
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/utils/cn';

// Mock data types
interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  status: 'active' | 'inactive' | 'suspended';
  lastLogin?: Date;
  createdAt: Date;
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  userCount: number;
}

interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
}

interface AuditEntry {
  id: string;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  timestamp: Date;
  ip?: string;
  details?: string;
}

interface Session {
  id: string;
  userId: string;
  userName: string;
  email: string;
  ipAddress: string;
  userAgent: string;
  createdAt: Date;
  lastActivity: Date;
  isActive: boolean;
}

// Mock data
const mockUsers: User[] = [
  {
    id: '1',
    email: 'admin@example.com',
    name: 'Admin User',
    role: 'admin',
    status: 'active',
    lastLogin: new Date('2025-01-27T10:30:00Z'),
    createdAt: new Date('2024-01-15T09:00:00Z'),
  },
  {
    id: '2',
    email: 'user@example.com',
    name: 'Regular User',
    role: 'user',
    status: 'active',
    lastLogin: new Date('2025-01-27T08:15:00Z'),
    createdAt: new Date('2024-03-20T11:00:00Z'),
  },
  {
    id: '3',
    email: 'manager@example.com',
    name: 'Manager User',
    role: 'manager',
    status: 'active',
    lastLogin: new Date('2025-01-26T16:45:00Z'),
    createdAt: new Date('2024-02-10T14:30:00Z'),
  },
];

const mockRoles: Role[] = [
  {
    id: '1',
    name: 'Admin',
    description: 'Full system access',
    permissions: ['read', 'write', 'delete', 'manage_users', 'manage_roles'],
    userCount: 2,
  },
  {
    id: '2',
    name: 'Manager',
    description: 'Team management access',
    permissions: ['read', 'write', 'manage_team'],
    userCount: 5,
  },
  {
    id: '3',
    name: 'User',
    description: 'Standard user access',
    permissions: ['read', 'write'],
    userCount: 45,
  },
];

const mockAuditEntries: AuditEntry[] = [
  {
    id: '1',
    userId: '1',
    userName: 'Admin User',
    action: 'create',
    resource: 'user',
    timestamp: new Date('2025-01-27T10:30:00Z'),
    ip: '192.168.1.1',
    details: 'Created new user account',
  },
  {
    id: '2',
    userId: '2',
    userName: 'Regular User',
    action: 'update',
    resource: 'record',
    timestamp: new Date('2025-01-27T09:15:00Z'),
    ip: '192.168.1.2',
    details: 'Updated record #123',
  },
  {
    id: '3',
    userId: '1',
    userName: 'Admin User',
    action: 'delete',
    resource: 'role',
    timestamp: new Date('2025-01-26T16:20:00Z'),
    ip: '192.168.1.1',
    details: 'Deleted role assignment',
  },
];

const mockSessions: Session[] = [
  {
    id: '1',
    userId: '1',
    userName: 'Admin User',
    email: 'admin@example.com',
    ipAddress: '192.168.1.1',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    createdAt: new Date('2025-01-27T08:00:00Z'),
    lastActivity: new Date('2025-01-27T10:30:00Z'),
    isActive: true,
  },
  {
    id: '2',
    userId: '2',
    userName: 'Regular User',
    email: 'user@example.com',
    ipAddress: '192.168.1.2',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    createdAt: new Date('2025-01-27T07:30:00Z'),
    lastActivity: new Date('2025-01-27T09:15:00Z'),
    isActive: true,
  },
];

export default function ConsoleSecurityPage() {
  const [activeTab, setActiveTab] = useState<'users' | 'access-control' | 'audit-trail' | 'sessions'>('users');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | User['status']>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const [isCreateRoleOpen, setIsCreateRoleOpen] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  
  // State for managing user status (for toggling)
  const [userStatusMap, setUserStatusMap] = useState<Map<string, User['status']>>(new Map());

  const filteredUsers = useMemo(() => {
    let filtered = mockUsers;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(u => u.status === statusFilter);
    }

    if (roleFilter !== 'all') {
      filtered = filtered.filter(u => u.role === roleFilter);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(u => 
        u.email.toLowerCase().includes(query) ||
        u.name.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [searchQuery, statusFilter, roleFilter]);

  const filteredAuditEntries = useMemo(() => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return mockAuditEntries.filter(e =>
        e.userName.toLowerCase().includes(query) ||
        e.action.toLowerCase().includes(query) ||
        e.resource.toLowerCase().includes(query)
      );
    }
    return mockAuditEntries;
  }, [searchQuery]);

  const filteredSessions = useMemo(() => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return mockSessions.filter(s =>
        s.userName.toLowerCase().includes(query) ||
        s.email.toLowerCase().includes(query) ||
        s.ipAddress.toLowerCase().includes(query)
      );
    }
    return mockSessions;
  }, [searchQuery]);

  // Calculate stats
  const stats = useMemo(() => {
    const totalUsers = mockUsers.length;
    const activeUsers = mockUsers.filter(u => u.status === 'active').length;
    const totalRoles = mockRoles.length;
    const activeSessions = mockSessions.filter(s => s.isActive).length;
    
    return { totalUsers, activeUsers, totalRoles, activeSessions };
  }, []);

  const getStatusBadge = (status: User['status']) => {
    switch (status) {
      case 'active':
        return <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 flex items-center gap-1">
          <CheckCircle2 className="h-3 w-3" />
          Active
        </Badge>;
      case 'inactive':
        return <Badge variant="secondary" className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">Inactive</Badge>;
      case 'suspended':
        return <Badge variant="destructive">Suspended</Badge>;
    }
  };

  const getUserStatus = (user: User): User['status'] => {
    return userStatusMap.get(user.id) ?? user.status;
  };

  const toggleUserStatus = (userId: string, currentStatus: User['status']) => {
    setUserStatusMap(prev => {
      const newMap = new Map(prev);
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      newMap.set(userId, newStatus);
      return newMap;
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

      {/* Overview Stats Cards - Shown on all tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 !flex-row">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary flex-shrink-0" />
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground mt-1">{stats.activeUsers} active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 !flex-row">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary flex-shrink-0" />
              <CardTitle className="text-sm font-medium">Roles</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRoles}</div>
            <p className="text-xs text-muted-foreground mt-1">Access roles defined</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 !flex-row">
            <div className="flex items-center gap-2">
              <LogIn className="h-4 w-4 text-primary flex-shrink-0" />
              <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.activeSessions}</div>
            <p className="text-xs text-muted-foreground mt-1">Currently logged in</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 !flex-row">
            <div className="flex items-center gap-2">
              <History className="h-4 w-4 text-primary flex-shrink-0" />
              <CardTitle className="text-sm font-medium">Audit Events</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockAuditEntries.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Last 24 hours</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <div className="flex items-center gap-4">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
              <TabsList className="w-full sm:w-auto grid grid-cols-2 lg:grid-cols-4">
                <TabsTrigger value="users" className="flex-1">
                  <Users className="h-4 w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">User Management</span>
                  <span className="sm:hidden">Users</span>
                </TabsTrigger>
                <TabsTrigger value="access-control" className="flex-1">
                  <Shield className="h-4 w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Access Control</span>
                  <span className="sm:hidden">Access</span>
                </TabsTrigger>
                <TabsTrigger value="audit-trail" className="flex-1">
                  <History className="h-4 w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Audit Trail</span>
                  <span className="sm:hidden">Audit</span>
                </TabsTrigger>
                <TabsTrigger value="sessions" className="flex-1">
                  <LogIn className="h-4 w-4 mr-1 sm:mr-2" />
                  Sessions
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
            {/* User Management Tab */}
            <TabsContent value="users" className="space-y-4 mt-0">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
                    <SelectTrigger className="w-full sm:w-40">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="w-full sm:w-40">
                      <SelectValue placeholder="Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      {mockRoles.map(role => (
                        <SelectItem key={role.id} value={role.name}>{role.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button onClick={() => setIsCreateUserOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add User
                  </Button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead className="hidden md:table-cell">Role</TableHead>
                      <TableHead className="hidden lg:table-cell">Status</TableHead>
                      <TableHead className="hidden lg:table-cell">Last Login</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          No users found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              <div className="font-medium">{user.name}</div>
                              <div className="text-sm text-muted-foreground">{user.email}</div>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <Badge variant="outline" className="capitalize">{user.role}</Badge>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={getUserStatus(user) === 'active'}
                                onCheckedChange={() => toggleUserStatus(user.id, getUserStatus(user))}
                              />
                              {getStatusBadge(getUserStatus(user))}
                            </div>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                            {user.lastLogin ? user.lastLogin.toLocaleString() : 'Never'}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="icon">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            {/* Access Control Tab */}
            <TabsContent value="access-control" className="space-y-4 mt-0">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6">
                <div>
                  <CardTitle className="text-base">Roles & Permissions</CardTitle>
                  <CardDescription>Manage user roles and their permissions</CardDescription>
                </div>
                <Button onClick={() => setIsCreateRoleOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Role
                </Button>
              </div>

              {/* Roles Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
                {mockRoles.map((role) => (
                  <Card key={role.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-base">{role.name}</CardTitle>
                          <CardDescription className="mt-1">{role.description}</CardDescription>
                        </div>
                        <Badge variant="outline">{role.userCount} users</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Permissions</Label>
                        <div className="flex flex-wrap gap-1">
                          {role.permissions.map((permission, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {permission}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex gap-2 pt-2">
                          <Button variant="outline" size="sm" className="flex-1">
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                          <Button variant="outline" size="sm" className="flex-1">
                            <Trash2 className="h-3 w-3 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Permissions Matrix */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Permissions Matrix</CardTitle>
                  <CardDescription>View which roles have access to which resources and actions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Resource / Action</TableHead>
                          {mockRoles.map(role => (
                            <TableHead key={role.id} className="text-center">
                              {role.name}
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {[
                          { resource: 'Users', actions: ['read', 'write', 'delete', 'manage'] },
                          { resource: 'Records', actions: ['read', 'write', 'delete'] },
                          { resource: 'Roles', actions: ['read', 'write', 'manage'] },
                          { resource: 'Audit Logs', actions: ['read'] },
                        ].map((item, idx) => (
                          item.actions.map((action, actionIdx) => (
                            <TableRow key={`${item.resource}-${action}-${idx}-${actionIdx}`}>
                              {actionIdx === 0 && (
                                <TableCell rowSpan={item.actions.length} className="font-medium align-middle">
                                  {item.resource}
                                </TableCell>
                              )}
                              <TableCell className="text-sm text-muted-foreground">{action}</TableCell>
                              {mockRoles.map(role => {
                                const hasPermission = role.permissions.includes(action) || 
                                  role.permissions.includes(`${action}_${item.resource.toLowerCase()}`) ||
                                  (role.name === 'Admin' && action !== 'manage_users');
                                return (
                                  <TableCell key={role.id} className="text-center">
                                    {hasPermission ? (
                                      <CheckCircle2 className="h-5 w-5 text-green-600 mx-auto" />
                                    ) : (
                                      <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 mx-auto" />
                                    )}
                                  </TableCell>
                                );
                              })}
                            </TableRow>
                          ))
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Audit Trail Tab */}
            <TabsContent value="audit-trail" className="space-y-4 mt-0">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search audit trail..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select defaultValue="24h">
                  <SelectTrigger className="w-full sm:w-40">
                    <Clock className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1h">Last hour</SelectItem>
                    <SelectItem value="24h">Last 24 hours</SelectItem>
                    <SelectItem value="7d">Last 7 days</SelectItem>
                    <SelectItem value="30d">Last 30 days</SelectItem>
                    <SelectItem value="all">All time</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="hidden md:table-cell">Timestamp</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead className="hidden lg:table-cell">Action</TableHead>
                      <TableHead className="hidden lg:table-cell">Resource</TableHead>
                      <TableHead className="hidden md:table-cell">IP Address</TableHead>
                      <TableHead className="text-right">Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAuditEntries.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          No audit entries found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredAuditEntries.map((entry) => (
                        <TableRow key={entry.id}>
                          <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                            {entry.timestamp.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{entry.userName}</div>
                            <div className="text-xs text-muted-foreground md:hidden">
                              {entry.timestamp.toLocaleTimeString()}
                            </div>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            <Badge variant="outline" className="capitalize">{entry.action}</Badge>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            <Badge variant="secondary" className="capitalize">{entry.resource}</Badge>
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-sm text-muted-foreground font-mono">
                            {entry.ip}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            {/* Sessions Tab */}
            <TabsContent value="sessions" className="space-y-4 mt-0">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search sessions..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead className="hidden md:table-cell">IP Address</TableHead>
                      <TableHead className="hidden lg:table-cell">User Agent</TableHead>
                      <TableHead className="hidden md:table-cell">Created</TableHead>
                      <TableHead className="hidden lg:table-cell">Last Activity</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSessions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          No sessions found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredSessions.map((session) => (
                        <TableRow key={session.id}>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              <div className="font-medium">{session.userName}</div>
                              <div className="text-sm text-muted-foreground">{session.email}</div>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-sm font-mono">
                            {session.ipAddress}
                          </TableCell>
                          <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                            <div className="max-w-xs truncate">{session.userAgent}</div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                            {session.createdAt.toLocaleString()}
                          </TableCell>
                          <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                            {session.lastActivity.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            {session.isActive ? (
                              <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                                <Activity className="h-3 w-3 mr-1" />
                                Active
                              </Badge>
                            ) : (
                              <Badge variant="secondary">Inactive</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Create User Dialog */}
      <Dialog open={isCreateUserOpen} onOpenChange={setIsCreateUserOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
            <DialogDescription>
              Add a new user to the system
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="user-email">Email</Label>
              <Input id="user-email" type="email" placeholder="user@example.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="user-name">Name</Label>
              <Input id="user-name" placeholder="User Name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="user-role">Role</Label>
              <Select>
                <SelectTrigger id="user-role">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {mockRoles.map(role => (
                    <SelectItem key={role.id} value={role.name}>{role.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsCreateUserOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setIsCreateUserOpen(false)}>
              Create User
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Role Dialog */}
      <Dialog open={isCreateRoleOpen} onOpenChange={setIsCreateRoleOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Role</DialogTitle>
            <DialogDescription>
              Define a new role with specific permissions
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="role-name">Role Name</Label>
              <Input id="role-name" placeholder="Role Name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role-description">Description</Label>
              <Input id="role-description" placeholder="Role description" />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsCreateRoleOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setIsCreateRoleOpen(false)}>
              Create Role
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
