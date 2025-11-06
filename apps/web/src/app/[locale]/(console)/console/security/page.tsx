'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getBadgeClasses } from '@/components/ui/badge.presets';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TableContainer } from '@/components/ui/table-container';
import { DateTimeCell, UserOrgCell, DetailsLink, ExpandedRowCell } from '@/components/ui/table-utils';
import { TableColgroup, TableHeadAction, TableCellAction } from '@/components/ui/table-columns';
import { TableHeadText, TableHeadStatus, TableCellText, TableCellStatus, ActionIconsCell } from '@/components/ui/table-cells';
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
import { formatDateTimeExact } from '@/utils/formatDateTime';
import { getUserDisplay } from '@/utils/userDisplay';

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

// Mock organisation mapping for users (userId -> organisation name)
const mockUserOrganisation: Record<string, string> = {
  '1': 'Acme Corp',
  '2': 'Globex',
  '3': 'Initech',
};

function formatDateTimeDDMMYYYYHHMMSS(date: Date): string {
  const two = (n: number) => n.toString().padStart(2, '0');
  const day = two(date.getDate());
  const month = two(date.getMonth() + 1);
  const year = date.getFullYear();
  const hours = two(date.getHours());
  const minutes = two(date.getMinutes());
  const seconds = two(date.getSeconds());
  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
}

function formatDateDDMMYYYY(date: Date): string {
  const two = (n: number) => n.toString().padStart(2, '0');
  const day = two(date.getDate());
  const month = two(date.getMonth() + 1);
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

function formatTimeHHMMSS(date: Date): string {
  const two = (n: number) => n.toString().padStart(2, '0');
  const hours = two(date.getHours());
  const minutes = two(date.getMinutes());
  const seconds = two(date.getSeconds());
  return `${hours}:${minutes}:${seconds}`;
}

function getAuditUserDisplay(userId: string) {
  const user = mockUsers.find((u) => u.id === userId);
  return getUserDisplay(user);
}

// Map audit actions to standardized badge presets for consistent color/size
function actionToPreset(action: string): string {
  switch (action) {
    case 'created':
    case 'accepted':
    case 'succeeded':
    case 'completed':
      return 'success.soft';
    case 'updated':
    case 'started':
    case 'stopped':
    case 'role_changed':
      return 'info.soft';
    case 'deleted':
    case 'failed':
    case 'rejected':
    case 'cancelled':
      return 'danger.soft';
    case 'invited':
    case 'snoozed':
      return 'warning.soft';
    default:
      return 'outline';
  }
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
  const [showGrantedOnly, setShowGrantedOnly] = useState(false);
  const [matrixScope, setMatrixScope] = useState<'application' | 'console'>('application');
  const [selectedResource, setSelectedResource] = useState<'' | 'Users' | 'Records' | 'Roles' | 'Audit Logs'>('');
  const [selectedAction, setSelectedAction] = useState<'' | 'read' | 'write' | 'delete' | 'manage'>('');
  const [selectedUserRole, setSelectedUserRole] = useState<string>('');

  // Fixed role taxonomy across User and Console applications (ordered from most restricted to full access)
  const ROLE_GROUPS = useMemo(() => ({
    userStandard: {
      label: 'User Application — Standard Users',
      roles: [
        { id: 'std-free', name: 'Standard User Free', description: 'Limited access', permissions: ['read'], userCount: 0 },
        { id: 'std-basic', name: 'Standard User Basic', description: 'Basic access', permissions: ['read'], userCount: 0 },
        { id: 'std-pro', name: 'Standard User Pro', description: 'Pro access', permissions: ['read', 'write'], userCount: 0 },
        { id: 'std-enterprise', name: 'Standard User Enterprise', description: 'Enterprise access', permissions: ['read', 'write'], userCount: 0 },
      ],
    },
    userManager: {
      label: 'User Application — Manager Users',
      roles: [
        { id: 'mgr', name: 'Manager User Manager', description: 'Team management', permissions: ['read', 'write', 'manage_team'], userCount: 0 },
        { id: 'mgr-sr', name: 'Manager User Senior Manager', description: 'Advanced team management', permissions: ['read', 'write', 'manage_team'], userCount: 0 },
      ],
    },
    consoleManager: {
      label: 'Console Application — Manager Users',
      roles: [
        { id: 'c-mgr', name: 'Administrator User Admin', description: 'Administrative access', permissions: ['read', 'write', 'delete', 'manage_users'], userCount: 0 },
        { id: 'c-mgr-sr', name: 'Administrator User Senior Admin', description: 'Full administrative access', permissions: ['read', 'write', 'delete', 'manage_users', 'manage_roles'], userCount: 0 },
      ],
    },
  }), []);

  const ALL_ROLES_ORDERED = useMemo(() => (
    [
      ...ROLE_GROUPS.userStandard.roles,
      ...ROLE_GROUPS.userManager.roles,
      ...ROLE_GROUPS.consoleManager.roles,
    ]
  ), [ROLE_GROUPS]);

  const APPLICATION_ROLES = useMemo(() => ([
    ...ROLE_GROUPS.userStandard.roles,
    ...ROLE_GROUPS.userManager.roles,
  ]), [ROLE_GROUPS]);

  const CONSOLE_ROLES = useMemo(() => ([
    ...ROLE_GROUPS.userManager.roles,
    ...ROLE_GROUPS.consoleManager.roles,
  ]), [ROLE_GROUPS]);

  const RESOURCES = useMemo(() => (
    ['Users', 'Records', 'Roles', 'Audit Logs'] as const
  ), []);

  const ACTIONS = useMemo(() => (
    ['read', 'write', 'delete', 'manage'] as const
  ), []);
  
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
        return <Badge className={getBadgeClasses('security.active')}>Active</Badge>;
      case 'inactive':
        return <Badge className={getBadgeClasses('security.inactive')}>Inactive</Badge>;
      case 'suspended':
        return <Badge className={getBadgeClasses('security.suspended')}>Suspended</Badge>;
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

              <TableContainer id="security-users-table" height="lg">
                <Table className="min-w-[980px] [&_th]:px-4 [&_td]:px-4 [&_th]:py-3 [&_td]:py-4">
                  <TableHeader>
                    <TableRow>
                      <TableHeadText className="hidden sm:table-cell w-36">Organisation</TableHeadText>
                      <TableHeadText className="min-w-0 max-w-[25%]">User</TableHeadText>
                      <TableHeadText className="hidden md:table-cell w-36">Role</TableHeadText>
                      <TableHeadStatus className="hidden md:table-cell w-36">Status</TableHeadStatus>
                      <TableHeadText className="hidden md:table-cell w-40">Last Login</TableHeadText>
                      <TableHeadAction className="w-36">Actions</TableHeadAction>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          No users found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCellText className="hidden sm:table-cell align-top w-36">
                            <div>
                              <span className="text-sm text-zinc-700 dark:text-zinc-300 truncate block whitespace-nowrap">
                                {mockUserOrganisation[user.id] ?? '—'}
                              </span>
                            </div>
                          </TableCellText>
                          <TableCellText className="min-w-0 max-w-[25%]">
                            <UserOrgCell
                              primary={getUserDisplay({ name: user.name, email: user.email }).primary}
                              secondary={getUserDisplay({ name: user.name, email: user.email }).secondary}
                            />
                          </TableCellText>
                          <TableCellText className="hidden md:table-cell w-36">
                            <span className="capitalize text-sm text-zinc-700 dark:text-zinc-300 block truncate whitespace-nowrap">
                              {user.role}
                            </span>
                          </TableCellText>
                          <TableCellStatus className="hidden md:table-cell w-36">
                            {getStatusBadge(getUserStatus(user))}
                          </TableCellStatus>
                          <TableCellText className="hidden md:table-cell whitespace-nowrap w-40">
                            {user.lastLogin ? (
                              <DateTimeCell date={user.lastLogin} />
                            ) : (
                              '—'
                            )}
                          </TableCellText>
                          <TableCellAction className="w-36">
                            <ActionIconsCell>
                              <Button variant="ghost" size="icon">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </ActionIconsCell>
                          </TableCellAction>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </TabsContent>

            {/* Access Control Tab */}
            <TabsContent value="access-control" className="space-y-4 mt-0">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 w-full sm:w-auto">
                  <Select value={matrixScope} onValueChange={(v) => setMatrixScope(v as typeof matrixScope)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="App" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="application">User Application</SelectItem>
                      <SelectItem value="console">Console</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={selectedResource} onValueChange={(v) => setSelectedResource(v as typeof selectedResource)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Resource" />
                    </SelectTrigger>
                    <SelectContent>
                      {RESOURCES.map(r => (
                        <SelectItem key={r} value={r}>{r}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={selectedAction} onValueChange={(v) => setSelectedAction(v as typeof selectedAction)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Action" />
                    </SelectTrigger>
                    <SelectContent>
                      {ACTIONS.map(a => (
                        <SelectItem key={a} value={a}>{a}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={selectedUserRole} onValueChange={(v) => setSelectedUserRole(v)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="User" />
                    </SelectTrigger>
                    <SelectContent>
                      {(matrixScope === 'application' ? APPLICATION_ROLES : CONSOLE_ROLES).map(role => (
                        <SelectItem key={role.id} value={role.name}>{role.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={() => setIsCreateRoleOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Role
                </Button>
              </div>

              {/* Roles Grid removed per request */}

              {/* Permissions Matrix */}
              <Card>
                <CardHeader>
                  {/* Header removed per request */}
                </CardHeader>
                <CardContent>
                  <TableContainer id="security-permissions-matrix-table" height="md">
                    <Table className="min-w-[1020px] [&_th]:px-4 [&_td]:px-4 [&_th]:py-3 [&_td]:py-4">
                      <TableColgroup columns={[
                        { width: 'md' },
                        { width: 'sm' },
                        ...(matrixScope === 'application' ? APPLICATION_ROLES : CONSOLE_ROLES).map(() => ({ width: 'md' as const })),
                      ]} />
                      <TableHeader>
                        <TableRow>
                          <TableHead className="sticky left-0 z-10 bg-background">Resource</TableHead>
                          <TableHead className="sticky left-[140px] z-10 bg-background">Action</TableHead>
                          {(matrixScope === 'application' ? APPLICATION_ROLES : CONSOLE_ROLES).map(role => (
                            <TableHeadAction key={role.id} className="whitespace-nowrap">{role.name}</TableHeadAction>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {RESOURCES.map((resource) => ({ resource, actions: (resource === 'Audit Logs' ? ['read'] : ['read', 'write', ...(resource === 'Records' || resource === 'Users' || resource === 'Roles' ? ['delete'] : []), ...(resource === 'Users' || resource === 'Roles' ? ['manage'] : [])]) as string[] }))
                          .flatMap((item) => {
                          const matchesQuery = (key: string) => key.toLowerCase().includes(searchQuery.toLowerCase());
                          const displayedRoles = (matrixScope === 'application' ? APPLICATION_ROLES : CONSOLE_ROLES);
                          const actionRows = item.actions
                            .filter(a => (selectedResource === '' || item.resource === selectedResource))
                            .filter(a => (selectedAction === '' || a === selectedAction))
                            .filter(a => matchesQuery(item.resource) || matchesQuery(a) || searchQuery === '')
                            .filter(a => {
                              if (!showGrantedOnly) return true;
                              // Keep action row only if any displayed role has the permission
                              return displayedRoles.some(role => {
                                const has = role.permissions.includes(a) ||
                                  role.permissions.includes(`${a}_${item.resource.toLowerCase()}`) ||
                                  (role.name.includes('Senior Admin') && a !== 'manage_users');
                                return has;
                              });
                            })
                            .map((action, actionIdx, arr) => {
                              return (
                                <TableRow key={`${item.resource}-${action}`} className={actionIdx % 2 === 1 ? 'bg-muted/30' : ''}>
                                  {actionIdx === 0 && (
                                    <TableCell rowSpan={arr.length} className="font-medium align-middle sticky left-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                                      <div className="min-w-[140px]">
                                        {item.resource}
                                      </div>
                                    </TableCell>
                                  )}
                                  <TableCell className="text-xs sm:text-sm text-muted-foreground">
                                    <Badge variant="outline" className="px-1.5 py-0 text-[10px] sm:text-[11px]">{action}</Badge>
                                  </TableCell>
                                  {(matrixScope === 'application' ? APPLICATION_ROLES : CONSOLE_ROLES)
                                    .filter(role => (selectedUserRole === '' || role.name === selectedUserRole))
                                    .map(role => {
                                    const hasPermission = role.permissions.includes(action) ||
                                      role.permissions.includes(`${action}_${item.resource.toLowerCase()}`) ||
                                      (role.name.includes('Senior Admin') && action !== 'manage_users');
                                    // optional: show-only-granted could hide denied cells; keeping all visible for clarity
                                    return (
                                      <TableCell key={role.id} className="text-center">
                                        {hasPermission ? (
                                          <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 mx-auto" />
                                        ) : (
                                          <XCircle className={cn('h-4 w-4 sm:h-5 sm:w-5 mx-auto text-red-600 dark:text-red-400', showGrantedOnly ? 'opacity-20' : '')} />
                                        )}
                                      </TableCell>
                                    );
                                  })}
                                </TableRow>
                              );
                            });
                          return actionRows;
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
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

              <TableContainer id="security-audit-table" height="lg">
                <Table className="min-w-[940px] [&_th]:px-4 [&_td]:px-4 [&_th]:py-3 [&_td]:py-4">
                  <TableHeader>
                    <TableRow>
                      <TableHeadText className="hidden md:table-cell w-40">Timestamp</TableHeadText>
                      <TableHeadText className="min-w-0">User</TableHeadText>
                      <TableHeadStatus className="hidden lg:table-cell w-36">Action</TableHeadStatus>
                      <TableHeadText className="hidden lg:table-cell w-36">Resource</TableHeadText>
                      <TableHeadText className="hidden md:table-cell w-36">IP Address</TableHeadText>
                      <TableHeadAction className="w-36">Details</TableHeadAction>
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
                      filteredAuditEntries.map((entry) => {
                        const d = getAuditUserDisplay(entry.userId);
                        return (
                          <TableRow key={entry.id}>
                            <TableCellText className="hidden md:table-cell w-40">
                              <DateTimeCell 
                                date={entry.timestamp instanceof Date ? entry.timestamp : new Date(entry.timestamp)}
                              />
                            </TableCellText>
                            <TableCellText className="min-w-0">
                              <UserOrgCell primary={d.primary} secondary={`@${d.secondary}`} />
                            </TableCellText>
                            <TableCellStatus className="hidden lg:table-cell w-36">
                              <Badge className={getBadgeClasses(actionToPreset(entry.action)) + ' capitalize'}>
                                {entry.action}
                              </Badge>
                            </TableCellStatus>
                            <TableCellText className="hidden lg:table-cell w-36">
                              <span className="text-sm capitalize">{entry.resource}</span>
                            </TableCellText>
                            <TableCellText className="hidden md:table-cell text-sm text-muted-foreground w-36">
                              {entry.ip}
                            </TableCellText>
                            <TableCellAction className="w-36">
                              <ActionIconsCell>
                                <Button variant="ghost" size="icon">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </ActionIconsCell>
                            </TableCellAction>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
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

              <TableContainer id="security-sessions-table" height="lg">
                <Table className="min-w-[980px] [&_th]:px-4 [&_td]:px-4 [&_th]:py-3 [&_td]:py-4">
                  <TableHeader>
                    <TableRow>
                      <TableHeadText className="min-w-0 max-w-[25%]">User</TableHeadText>
                      <TableHeadText className="hidden md:table-cell w-36">IP Address</TableHeadText>
                      <TableHeadText className="hidden lg:table-cell w-40">User Agent</TableHeadText>
                      <TableHeadText className="hidden md:table-cell w-40">Created</TableHeadText>
                      <TableHeadText className="hidden lg:table-cell w-40">Last Activity</TableHeadText>
                      <TableHeadStatus className="w-36">Status</TableHeadStatus>
                      <TableHeadAction className="w-36">Actions</TableHeadAction>
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
                      filteredSessions.map((session) => {
                        const userDisplay = getUserDisplay({ name: session.userName, email: session.email });
                        const uaMain = session.userAgent.match(/^([^()]+)/)?.[1]?.trim() || session.userAgent;
                        const uaParen = session.userAgent.match(/\(([^)]+)\)/)?.[1]?.trim() || '';
                        return (
                          <TableRow key={session.id}>
                            <TableCellText className="min-w-0 max-w-[25%]">
                              <UserOrgCell 
                                primary={userDisplay.primary} 
                                secondary={`@${userDisplay.secondary}`}
                              />
                            </TableCellText>
                            <TableCellText className="hidden md:table-cell text-sm text-muted-foreground w-36">
                              <div className="truncate whitespace-nowrap">{session.ipAddress}</div>
                            </TableCellText>
                            <TableCellText className="hidden lg:table-cell w-40">
                              <div className="leading-tight line-clamp-2">
                                <div className="text-sm truncate whitespace-nowrap">{uaMain}</div>
                                {uaParen && (
                                  <div className="text-xs text-muted-foreground truncate whitespace-nowrap">{uaParen}</div>
                                )}
                              </div>
                            </TableCellText>
                            <TableCellText className="hidden md:table-cell w-40">
                              <DateTimeCell date={session.createdAt} />
                            </TableCellText>
                            <TableCellText className="hidden lg:table-cell w-40">
                              <DateTimeCell date={session.lastActivity} />
                            </TableCellText>
                            <TableCellStatus className="w-36">
                              {session.isActive ? (
                                <Badge className={getBadgeClasses('security.active')}>Active</Badge>
                              ) : (
                                <Badge className={getBadgeClasses('security.inactive')}>Inactive</Badge>
                              )}
                            </TableCellStatus>
                            <TableCellAction className="w-36">
                              <ActionIconsCell>
                                <Button variant="ghost" size="icon">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </ActionIconsCell>
                            </TableCellAction>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
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
