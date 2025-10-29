'use client';

import { useState, useMemo, Fragment } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Plus,
  CheckCircle2,
  AlertCircle,
  Eye,
  Trash2,
  RefreshCw,
  Search as SearchIcon,
  Filter,
  Clock,
  User,
  Calendar,
  Link2,
  Loader2,
  AlertTriangle,
  TrendingUp,
  Activity,
  FileText,
  Zap,
  X,
  Save,
} from 'lucide-react';
import { api } from '@/trpc/react';
import { toast } from 'sonner';
import type { RouterOutputs } from '@/trpc/types';

type TaskStatus = 'todo' | 'in-progress' | 'review' | 'done' | 'blocked';
type TaskPriority = 'low' | 'normal' | 'high' | 'urgent';

type Task = RouterOutputs['developmentTasks']['list']['tasks'][0];

interface DevelopmentTasksSectionProps {
  orgId: string;
}

export function DevelopmentTasksSection({ orgId }: DevelopmentTasksSectionProps) {
  const [tasksTab, setTasksTab] = useState<'overview' | 'all' | 'active'>('overview');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'all'>('all');
  const [assigneeFilter, setAssigneeFilter] = useState<string | 'all' | 'unassigned'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deleteTaskId, setDeleteTaskId] = useState<string | null>(null);
  const [isNotionConfigOpen, setIsNotionConfigOpen] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'todo' as TaskStatus,
    priority: 'normal' as TaskPriority,
    assignee_id: '',
    due_date: '',
    notion_page_id: '',
    notion_database_id: '',
  });

  // Fetch tasks
  const { data: tasksData, isLoading, refetch } = api.developmentTasks.list.useQuery({
    org_id: orgId,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    priority: priorityFilter !== 'all' ? priorityFilter : undefined,
    assignee_id: assigneeFilter === 'unassigned' ? null : assigneeFilter !== 'all' ? assigneeFilter : undefined,
    search: searchQuery || undefined,
    limit: 100,
    offset: 0,
    sort_by: 'updated_at',
    sort_order: 'desc',
  });

  const tasks = tasksData?.tasks || [];
  const taskTotal = tasksData?.total || 0;

  // Create mutation
  const createTask = api.developmentTasks.create.useMutation({
    onSuccess: () => {
      toast.success('Task created successfully');
      setIsCreateDialogOpen(false);
      resetForm();
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create task');
    },
  });

  // Update mutation
  const updateTask = api.developmentTasks.update.useMutation({
    onSuccess: () => {
      toast.success('Task updated successfully');
      setIsEditDialogOpen(false);
      setSelectedTask(null);
      resetForm();
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update task');
    },
  });

  // Delete mutation
  const deleteTask = api.developmentTasks.delete.useMutation({
    onSuccess: () => {
      toast.success('Task deleted successfully');
      setDeleteTaskId(null);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete task');
    },
  });

  // Notion sync mutation
  const syncFromNotion = api.developmentTasks.syncFromNotion.useMutation({
    onSuccess: () => {
      toast.success('Tasks synced from Notion successfully');
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to sync from Notion');
    },
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      status: 'todo',
      priority: 'normal',
      assignee_id: '',
      due_date: '',
      notion_page_id: '',
      notion_database_id: '',
    });
  };

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setFormData({
      title: task.title,
      description: task.description || '',
      status: task.status as TaskStatus,
      priority: task.priority as TaskPriority,
      assignee_id: task.assignee_id || '',
      due_date: task.due_date ? new Date(task.due_date).toISOString().split('T')[0] : '',
      notion_page_id: task.notion_page_id || '',
      notion_database_id: task.notion_database_id || '',
    });
    setIsEditDialogOpen(true);
  };

  const handleCreateTask = () => {
    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }

    createTask.mutate({
      org_id: orgId,
      title: formData.title,
      description: formData.description || undefined,
      status: formData.status,
      priority: formData.priority,
      assignee_id: formData.assignee_id || undefined,
      due_date: formData.due_date || undefined,
      notion_page_id: formData.notion_page_id || undefined,
      notion_database_id: formData.notion_database_id || undefined,
    });
  };

  const handleUpdateTask = () => {
    if (!selectedTask || !formData.title.trim()) {
      toast.error('Title is required');
      return;
    }

    updateTask.mutate({
      id: selectedTask.id,
      title: formData.title,
      description: formData.description || null,
      status: formData.status,
      priority: formData.priority,
      assignee_id: formData.assignee_id || null,
      due_date: formData.due_date || null,
      notion_page_id: formData.notion_page_id || null,
      notion_database_id: formData.notion_database_id || null,
    });
  };

  const handleDeleteTask = () => {
    if (!deleteTaskId) return;
    deleteTask.mutate({ id: deleteTaskId });
  };

  // Calculate metrics
  const metrics = useMemo(() => {
    const total = taskTotal;
    const todo = tasks.filter(t => t.status === 'todo').length;
    const inProgress = tasks.filter(t => t.status === 'in-progress').length;
    const review = tasks.filter(t => t.status === 'review').length;
    const done = tasks.filter(t => t.status === 'done').length;
    const blocked = tasks.filter(t => t.status === 'blocked').length;
    const urgent = tasks.filter(t => t.priority === 'urgent').length;
    const overdue = tasks.filter(t => {
      if (!t.due_date) return false;
      return new Date(t.due_date) < new Date() && t.status !== 'done';
    }).length;

    return {
      total,
      todo,
      inProgress,
      review,
      done,
      blocked,
      urgent,
      overdue,
    };
  }, [tasks, taskTotal]);

  // Filtered tasks for display
  const filteredTasks = useMemo(() => {
    if (tasksTab === 'active') {
      return tasks.filter(t => ['todo', 'in-progress', 'review'].includes(t.status));
    }
    return tasks;
  }, [tasks, tasksTab]);

  // Get unique assignees for filter
  const assignees = useMemo(() => {
    const uniqueAssignees = new Map<string, { id: string; name: string; email?: string }>();
    tasks.forEach(task => {
      if (task.assignee_id && task.assignee) {
        uniqueAssignees.set(task.assignee_id, {
          id: task.assignee_id,
          name: task.assignee.raw_user_meta_data?.full_name || task.assignee.email || 'Unknown',
          email: task.assignee.email,
        });
      }
    });
    return Array.from(uniqueAssignees.values());
  }, [tasks]);

  // Helper functions
  const getStatusBadge = (status: TaskStatus) => {
    const variants: Record<TaskStatus, { variant: any; className: string; label: string }> = {
      'todo': { variant: 'secondary', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100', label: 'To Do' },
      'in-progress': { variant: 'default', className: 'bg-primary text-primary-foreground', label: 'In Progress' },
      'review': { variant: 'secondary', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100', label: 'Review' },
      'done': { variant: 'secondary', className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100', label: 'Done' },
      'blocked': { variant: 'destructive', className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100', label: 'Blocked' },
    };
    const variant = variants[status];
    return <Badge className={variant.className}>{variant.label}</Badge>;
  };

  const getPriorityBadge = (priority: TaskPriority) => {
    const variants: Record<TaskPriority, { className: string; label: string }> = {
      'low': { className: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100', label: 'Low' },
      'normal': { className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100', label: 'Normal' },
      'high': { className: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100', label: 'High' },
      'urgent': { className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100', label: 'Urgent' },
    };
    const variant = variants[priority];
    return <Badge className={variant.className}>{variant.label}</Badge>;
  };

  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case 'done':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'blocked':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'review':
        return <Eye className="h-4 w-4 text-yellow-600" />;
      case 'in-progress':
        return <Activity className="h-4 w-4 text-primary animate-pulse" />;
      default:
        return <FileText className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const formatAssignee = (task: Task) => {
    if (!task.assignee_id || !task.assignee) return 'Unassigned';
    return task.assignee.raw_user_meta_data?.full_name || task.assignee.email || 'Unknown';
  };

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          <span>Live</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
            Refresh
          </Button>
          <Button
            size="sm"
            onClick={() => setIsCreateDialogOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Task
          </Button>
        </div>
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <FileText className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.total}</div>
            <p className="text-xs text-muted-foreground mt-1">All tasks</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <Activity className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {metrics.todo + metrics.inProgress + metrics.review}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {metrics.todo} todo, {metrics.inProgress} in progress
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Done</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{metrics.done}</div>
            <p className="text-xs text-muted-foreground mt-1">Completed tasks</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Urgent</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{metrics.urgent}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {metrics.overdue > 0 && `${metrics.overdue} overdue`}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Development Tasks</CardTitle>
              <CardDescription>Manage development work items</CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsNotionConfigOpen(true)}
            >
              <Link2 className="h-4 w-4 mr-2" />
              Notion Sync
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={tasksTab} onValueChange={(v) => setTasksTab(v as typeof tasksTab)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="all">All Tasks</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Status Overview */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Status Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">To Do</span>
                        <Badge variant="outline">{metrics.todo}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">In Progress</span>
                        <Badge variant="outline">{metrics.inProgress}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Review</span>
                        <Badge variant="outline">{metrics.review}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Done</span>
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                          {metrics.done}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Blocked</span>
                        <Badge variant="destructive">{metrics.blocked}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Tasks */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Recent Tasks</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {tasks.slice(0, 5).map((task) => (
                        <div
                          key={task.id}
                          className="flex items-center justify-between p-2 rounded-lg hover:bg-accent transition-colors cursor-pointer"
                          onClick={() => handleEditTask(task)}
                        >
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            {getStatusIcon(task.status as TaskStatus)}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{task.title}</p>
                              <p className="text-xs text-muted-foreground truncate">
                                {task.status} • {new Date(task.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          {getStatusBadge(task.status as TaskStatus)}
                        </div>
                      ))}
                      {tasks.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No tasks yet
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* All Tasks / Active Tab */}
            <TabsContent value={tasksTab} className="space-y-4 mt-4">
              {/* Filters */}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                  <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search tasks..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as TaskStatus | 'all')}>
                  <SelectTrigger className="w-full sm:w-40">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="todo">To Do</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="review">Review</SelectItem>
                    <SelectItem value="done">Done</SelectItem>
                    <SelectItem value="blocked">Blocked</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={priorityFilter} onValueChange={(v) => setPriorityFilter(v as TaskPriority | 'all')}>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priority</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={assigneeFilter} onValueChange={(v) => setAssigneeFilter(v as string | 'all' | 'unassigned')}>
                  <SelectTrigger className="w-full sm:w-40">
                    <User className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Assignee" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Assignees</SelectItem>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {assignees.map((assignee) => (
                      <SelectItem key={assignee.id} value={assignee.id}>
                        {assignee.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Tasks Table */}
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Task</TableHead>
                      <TableHead className="hidden sm:table-cell">Status</TableHead>
                      <TableHead className="hidden md:table-cell">Priority</TableHead>
                      <TableHead className="hidden md:table-cell">Assignee</TableHead>
                      <TableHead className="hidden lg:table-cell">Due Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                        </TableCell>
                      </TableRow>
                    ) : filteredTasks.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          No tasks found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredTasks.map((task) => (
                        <TableRow key={task.id}>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-2">
                                {getStatusIcon(task.status as TaskStatus)}
                                <span className="font-medium">{task.title}</span>
                              </div>
                              {task.description && (
                                <p className="text-xs text-muted-foreground line-clamp-1">
                                  {task.description}
                                </p>
                              )}
                              <div className="flex items-center gap-3 flex-wrap sm:hidden text-xs text-muted-foreground">
                                {getStatusBadge(task.status as TaskStatus)}
                                {getPriorityBadge(task.priority as TaskPriority)}
                                {task.due_date && (
                                  <span className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {new Date(task.due_date).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            {getStatusBadge(task.status as TaskStatus)}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {getPriorityBadge(task.priority as TaskPriority)}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <span className="text-sm">{formatAssignee(task)}</span>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                            {task.due_date ? (
                              <span className={cn(
                                new Date(task.due_date) < new Date() && task.status !== 'done' && 'text-red-600 font-medium'
                              )}>
                                {new Date(task.due_date).toLocaleDateString()}
                              </span>
                            ) : (
                              '-'
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleEditTask(task)}
                                    >
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>View/Edit</TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => setDeleteTaskId(task.id)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Delete</TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
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

      {/* Create Task Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
            <DialogDescription>Add a new development task to track</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter task title"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter task description"
                rows={4}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(v) => setFormData({ ...formData, status: v as TaskStatus })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todo">To Do</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="review">Review</SelectItem>
                    <SelectItem value="done">Done</SelectItem>
                    <SelectItem value="blocked">Blocked</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(v) => setFormData({ ...formData, priority: v as TaskPriority })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="assignee_id">Assignee (User ID)</Label>
                <Input
                  id="assignee_id"
                  value={formData.assignee_id}
                  onChange={(e) => setFormData({ ...formData, assignee_id: e.target.value })}
                  placeholder="User UUID (optional)"
                />
              </div>
              <div>
                <Label htmlFor="due_date">Due Date</Label>
                <Input
                  id="due_date"
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Notion Integration (Optional)</Label>
              <Input
                placeholder="Notion Page ID"
                value={formData.notion_page_id}
                onChange={(e) => setFormData({ ...formData, notion_page_id: e.target.value })}
              />
              <Input
                placeholder="Notion Database ID"
                value={formData.notion_database_id}
                onChange={(e) => setFormData({ ...formData, notion_database_id: e.target.value })}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateTask} disabled={createTask.isPending}>
                {createTask.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Create Task
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Task Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogDescription>Update development task details</DialogDescription>
          </DialogHeader>
          {selectedTask && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-title">Title *</Label>
                <Input
                  id="edit-title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter task title"
                />
              </div>
              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter task description"
                  rows={4}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(v) => setFormData({ ...formData, status: v as TaskStatus })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todo">To Do</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="review">Review</SelectItem>
                      <SelectItem value="done">Done</SelectItem>
                      <SelectItem value="blocked">Blocked</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-priority">Priority</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(v) => setFormData({ ...formData, priority: v as TaskPriority })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-assignee_id">Assignee (User ID)</Label>
                  <Input
                    id="edit-assignee_id"
                    value={formData.assignee_id}
                    onChange={(e) => setFormData({ ...formData, assignee_id: e.target.value })}
                    placeholder="User UUID (optional)"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-due_date">Due Date</Label>
                  <Input
                    id="edit-due_date"
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Notion Integration (Optional)</Label>
                <Input
                  placeholder="Notion Page ID"
                  value={formData.notion_page_id}
                  onChange={(e) => setFormData({ ...formData, notion_page_id: e.target.value })}
                />
                <Input
                  placeholder="Notion Database ID"
                  value={formData.notion_database_id}
                  onChange={(e) => setFormData({ ...formData, notion_database_id: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateTask} disabled={updateTask.isPending}>
                  {updateTask.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Update Task
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteTaskId} onOpenChange={(open) => !open && setDeleteTaskId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Task</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this task? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeleteTaskId(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteTask} disabled={deleteTask.isPending}>
              {deleteTask.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Notion Configuration Dialog */}
      <Dialog open={isNotionConfigOpen} onOpenChange={setIsNotionConfigOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Notion Integration</DialogTitle>
            <DialogDescription>
              Configure Notion API credentials and sync settings (optional)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Notion API Key</Label>
              <Input
                type="password"
                placeholder="Enter Notion API key"
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Get your API key from{' '}
                <a
                  href="https://www.notion.so/my-integrations"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Notion Integrations
                </a>
              </p>
            </div>
            <div>
              <Label>Notion Database ID</Label>
              <Input
                placeholder="Enter Notion database ID"
                className="font-mono"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Enable Sync</Label>
                <p className="text-xs text-muted-foreground">
                  Automatically sync tasks from Notion
                </p>
              </div>
              <Switch />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsNotionConfigOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  toast.info('Notion integration will be implemented in a future update');
                  setIsNotionConfigOpen(false);
                }}
              >
                <Link2 className="h-4 w-4 mr-2" />
                Save Configuration
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

