'use client';

import { useMemo, useRef, useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { getBadgeClasses } from '@/components/ui/badge.presets';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useToast } from '@/components/ui/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
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
  TrendingUp,
  TrendingDown,
  Copy,
  Eye,
  EyeOff,
  Trash2,
  Plus,
  X,
  Terminal,
  Clock,
  Activity,
  Users,
  AlertTriangle,
  FileText,
  Settings,
  Timer,
  BarChart3,
  Link2,
  Pause,
  Filter,
  Search,
  ChevronRight,
} from 'lucide-react';

// Types
interface OverviewStats {
  lastDeployment: { status: 'success' | 'failed' | 'in-progress', id: string, timestamp: string };
  successRate7d: { value: number, trend: 'up' | 'down', sparkline: number[] };
  avgBuildTime: { p50: string, p95: string };
  queueLoad: { active: number, pending: number, blocked: number, slaBreach: boolean };
  workers: { online: number, capacity: number };
}

interface QueueStats {
  total: number;
  active: number;
  pending: number;
  failed: number;
  oldestWait: string;
  throughput: number;
  slaStatus: 'green' | 'amber' | 'red';
  hourlyData: Array<{ hour: string, processed: number, failed: number, avgWait: number }>;
}

interface PreviousBuild {
  id: string;
  status: 'success' | 'failed';
  duration: string;
  triggeredBy: string;
  commit: string;
  timestamp: string;
}

interface HealthMetrics {
  trend7d: Array<{ date: string, success: number, failed: number }>;
  mttr: string;
  topFailureCauses: Array<{ cause: string, count: number }>;
}

interface EnvVar {
  key: string;
  value: string;
  isSecret: boolean;
  revealed?: boolean;
}

// Mock data for deployment history (preserved)
const mockDeployments = [
  { id: 1, version: 'v2.1.0', environment: 'production', status: 'success', deployedAt: '2025-01-27 14:30:15', duration: '2m 34s', commit: 'a3f9b2c', branch: 'main', deployedBy: 'Sarah Johnson' },
  { id: 2, version: 'v2.0.9', environment: 'staging', status: 'success', deployedAt: '2025-01-27 12:15:42', duration: '1m 52s', commit: 'd7e8f1a', branch: 'develop', deployedBy: 'John Doe' },
  { id: 3, version: 'v2.0.8', environment: 'production', status: 'success', deployedAt: '2025-01-26 18:45:20', duration: '2m 10s', commit: 'f5a6b3c', branch: 'main', deployedBy: 'Sarah Johnson' },
  { id: 4, version: 'v2.0.7', environment: 'production', status: 'failed', deployedAt: '2025-01-26 16:20:55', duration: '45s', commit: 'e4d5c2b', branch: 'main', deployedBy: 'John Doe' },
];

// Mock data generators
const generateOverviewStats = (): OverviewStats => ({
  lastDeployment: { status: 'success', id: 'deploy-001', timestamp: '2025-01-27 14:30:15' },
  successRate7d: { value: 94.5, trend: 'up', sparkline: [88, 90, 92, 91, 93, 94, 94.5] },
  avgBuildTime: { p50: '2m 15s', p95: '4m 30s' },
  queueLoad: { active: 3, pending: 12, blocked: 0, slaBreach: false },
  workers: { online: 8, capacity: 10 },
});

const generateQueueStats = (): QueueStats => ({
  total: 245,
  active: 3,
  pending: 12,
  failed: 5,
  oldestWait: '3m 45s',
  throughput: 12.5,
  slaStatus: 'green',
  hourlyData: Array.from({ length: 24 }, (_, i) => ({
    hour: `${String(i).padStart(2, '0')}:00`,
    processed: Math.floor(Math.random() * 50) + 10,
    failed: Math.floor(Math.random() * 5),
    avgWait: Math.floor(Math.random() * 300) + 60,
  })),
});

const generatePreviousBuilds = (): PreviousBuild[] => [
  { id: 'build-001', status: 'success', duration: '2m 34s', triggeredBy: 'Sarah Johnson', commit: 'a3f9b2c', timestamp: '2 hours ago' },
  { id: 'build-002', status: 'success', duration: '1m 52s', triggeredBy: 'John Doe', commit: 'd7e8f1a', timestamp: '4 hours ago' },
  { id: 'build-003', status: 'failed', duration: '45s', triggeredBy: 'John Doe', commit: 'e4d5c2b', timestamp: '1 day ago' },
  { id: 'build-004', status: 'success', duration: '2m 10s', triggeredBy: 'Sarah Johnson', commit: 'f5a6b3c', timestamp: '1 day ago' },
];

const generateHealthMetrics = (): HealthMetrics => ({
  trend7d: Array.from({ length: 7 }, (_, i) => ({
    date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    success: Math.floor(Math.random() * 20) + 15,
    failed: Math.floor(Math.random() * 3) + 1,
  })),
  mttr: '8 minutes',
  topFailureCauses: [
    { cause: 'Install error', count: 12 },
    { cause: 'Tests failed', count: 8 },
    { cause: 'Timeout', count: 5 },
  ],
});

const defaultEnvVars: EnvVar[] = [
  { key: 'NODE_ENV', value: 'production', isSecret: false },
  { key: 'DATABASE_URL', value: 'postgresql://user:pass@host:5432/db', isSecret: true },
  { key: 'API_KEY', value: 'sk_live_abc123...', isSecret: true },
];

// Local Components
function StatCard({ 
  icon: Icon, 
  title, 
  value, 
  subtitle, 
  trend, 
  sparkline, 
  badge, 
  link,
  tooltip 
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  value: string | React.ReactNode;
  subtitle?: string;
  trend?: 'up' | 'down';
  sparkline?: number[];
  badge?: React.ReactNode;
  link?: { label: string; onClick: () => void };
  tooltip?: string;
}) {
  const content = (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-xs font-medium text-muted-foreground">{title}</CardTitle>
          </div>
          {badge}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="text-2xl font-bold">{value}</div>
        {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
        {trend && (
          <div className="flex items-center gap-1 mt-1">
            {trend === 'up' ? (
              <TrendingUp className="h-3 w-3 text-green-500" />
            ) : (
              <TrendingDown className="h-3 w-3 text-red-500" />
            )}
          </div>
        )}
        {sparkline && (
          <div className="flex items-end gap-0.5 h-8 mt-2">
            {sparkline.map((val, i) => (
              <div
                key={i}
                className="flex-1 bg-primary/30 rounded-t"
                style={{ height: `${(val / 100) * 100}%` }}
              />
            ))}
          </div>
        )}
        {link && (
          <Button variant="link" size="sm" className="h-auto p-0 mt-1 text-xs" onClick={link.onClick}>
            {link.label}
          </Button>
        )}
      </CardContent>
    </Card>
  );

  if (tooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {content}
          </TooltipTrigger>
          <TooltipContent>
            <p>{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return content;
}

function StatusBanner({ 
  message, 
  onAcknowledge, 
  onViewLogs 
}: { 
  message: string; 
  onAcknowledge: () => void;
  onViewLogs: () => void;
}) {
  return (
    <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 text-destructive" />
        <p className="text-sm text-destructive font-medium">{message}</p>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={onViewLogs}>
          View logs
        </Button>
        <Button variant="ghost" size="sm" onClick={onAcknowledge}>
          Acknowledge
        </Button>
      </div>
    </div>
  );
}

function QueueMiniChart({ data }: { data: QueueStats['hourlyData'] }) {
  const maxProcessed = Math.max(...data.map(d => d.processed + d.failed), 1);
  
  return (
    <TooltipProvider>
      <div className="h-16 flex items-end gap-0.5">
        {data.map((hour, i) => (
          <Tooltip key={i}>
            <TooltipTrigger asChild>
              <div className="flex-1 flex flex-col gap-0.5 cursor-help">
                <div
                  className="w-full bg-green-500/70 rounded-t"
                  style={{ height: `${(hour.processed / maxProcessed) * 100}%` }}
                />
                {hour.failed > 0 && (
                  <div
                    className="w-full bg-red-500/70 rounded-t"
                    style={{ height: `${(hour.failed / maxProcessed) * 100}%` }}
                  />
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <div className="text-xs">
                <p className="font-medium">{hour.hour}</p>
                <p>Processed: {hour.processed}</p>
                <p>Failed: {hour.failed}</p>
                <p>Avg wait: {Math.floor(hour.avgWait / 60)}m {hour.avgWait % 60}s</p>
              </div>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
}

function HealthTrend({ data }: { data: HealthMetrics['trend7d'] }) {
  const maxValue = Math.max(...data.map(d => d.success + d.failed), 1);
  
  return (
    <div className="h-20 flex items-end gap-1">
      {data.map((day, i) => (
        <div key={i} className="flex-1 flex flex-col gap-0.5">
          <div
            className="w-full bg-green-500/70 rounded-t"
            style={{ height: `${((day.success / maxValue) * 100)}%` }}
          />
          {day.failed > 0 && (
            <div
              className="w-full bg-red-500/70 rounded-t"
              style={{ height: `${((day.failed / maxValue) * 100)}%` }}
            />
          )}
        </div>
      ))}
    </div>
  );
}

function ConfigDiffModal({ 
  isOpen, 
  onClose, 
  current, 
  original 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  current: any; 
  original: any;
}) {
  const changes = Object.keys(current).filter(key => current[key] !== original[key]);
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Configuration Changes Preview</DialogTitle>
          <DialogDescription>
            Review the changes before saving
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold mb-2">Current (Original)</h3>
            <div className="space-y-2 text-sm">
              {Object.entries(original).map(([key, value]) => (
                <div key={key} className={changes.includes(key) ? 'opacity-50' : ''}>
                  <div className="font-mono font-medium">{key}:</div>
                  <div className="ml-4 text-muted-foreground">{String(value)}</div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="font-semibold mb-2">New (Draft)</h3>
            <div className="space-y-2 text-sm">
              {Object.entries(current).map(([key, value]) => (
                <div key={key} className={changes.includes(key) ? 'text-green-600 dark:text-green-400' : ''}>
                  <div className="font-mono font-medium">{key}:</div>
                  <div className="ml-4">{String(value)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={onClose}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function ApplicationDeploymentPage() {
  const { toast } = useToast();
  
  const [deploymentConfig, setDeploymentConfig] = useState({
    buildCommand: 'pnpm build',
    startCommand: 'pnpm start',
    nodeVersion: '18.x',
    environment: 'production',
    autoDeploy: true,
    enableRollback: true,
    healthCheckUrl: '/api/health',
    deploymentTimeout: 600,
    deploymentTarget: 'vercel',
  });
  
  const [envVars, setEnvVars] = useState<EnvVar[]>(defaultEnvVars);
  const [isLoading, setIsLoading] = useState(false);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(false);
  const [bannerAcknowledged, setBannerAcknowledged] = useState(false);
  const [showDiffModal, setShowDiffModal] = useState(false);
  const [hasWritePermission] = useState(true); // Mock permission
  const [confirmModal, setConfirmModal] = useState<{ type: string; isOpen: boolean }>({ type: '', isOpen: false });
  const [deletingEnvVar, setDeletingEnvVar] = useState<string | null>(null);
  const [addingEnvVar, setAddingEnvVar] = useState(false);
  const [newEnvVar, setNewEnvVar] = useState({ key: '', value: '', isSecret: false });
  
  const [overviewStats, setOverviewStats] = useState<OverviewStats>(generateOverviewStats());
  const [queueStats, setQueueStats] = useState<QueueStats>(generateQueueStats());
  const [previousBuilds, setPreviousBuilds] = useState<PreviousBuild[]>(generatePreviousBuilds());
  const [healthMetrics, setHealthMetrics] = useState<HealthMetrics>(generateHealthMetrics());
  
  const [historyFilters, setHistoryFilters] = useState({
    status: [] as string[],
    dateRange: '7d',
    triggeredBy: '',
    commit: '',
  });
  const [filteredDeployments, setFilteredDeployments] = useState(mockDeployments);
  
  const initialConfigRef = useRef(deploymentConfig);
  const appliedAtRef = useRef<string | null>(null);
  const appliedByRef = useRef<string>('Current User');
  
  const isDirty = useMemo(() => {
    try {
      return JSON.stringify(deploymentConfig) !== JSON.stringify(initialConfigRef.current);
    } catch {
      return false;
    }
  }, [deploymentConfig]);
  
  // Auto-refresh
  useEffect(() => {
    if (!autoRefreshEnabled) return;
    
    const interval = setInterval(() => {
      setOverviewStats(generateOverviewStats());
      setQueueStats(generateQueueStats());
      setPreviousBuilds(generatePreviousBuilds());
      setHealthMetrics(generateHealthMetrics());
    }, 30000);
    
    return () => clearInterval(interval);
  }, [autoRefreshEnabled]);
  
  // Filter deployments
  useEffect(() => {
    let filtered = [...mockDeployments];
    
    if (historyFilters.status.length > 0) {
      filtered = filtered.filter(d => historyFilters.status.includes(d.status));
    }
    
    if (historyFilters.triggeredBy) {
      filtered = filtered.filter(d => 
        d.deployedBy.toLowerCase().includes(historyFilters.triggeredBy.toLowerCase())
      );
    }
    
    if (historyFilters.commit) {
      filtered = filtered.filter(d => 
        d.commit.toLowerCase().includes(historyFilters.commit.toLowerCase())
      );
    }
    
    if (historyFilters.dateRange) {
      const now = Date.now();
      const ranges: Record<string, number> = {
        '24h': 24 * 60 * 60 * 1000,
        '7d': 7 * 24 * 60 * 60 * 1000,
        '30d': 30 * 24 * 60 * 60 * 1000,
      };
      const range = ranges[historyFilters.dateRange] || 0;
      filtered = filtered.filter(d => {
        const deployed = new Date(d.deployedAt).getTime();
        return now - deployed <= range;
      });
    }
    
    setFilteredDeployments(filtered);
  }, [historyFilters]);
  
  // Hash navigation
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      if (hash) {
        const element = document.getElementById(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
          element.focus();
        }
      }
    };
    
    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();
    
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);
  
  const handleSave = useCallback(() => {
    setShowDiffModal(false);
    setIsLoading(true);
    
    setTimeout(() => {
      initialConfigRef.current = { ...deploymentConfig };
      appliedAtRef.current = new Date().toLocaleString();
      setIsLoading(false);
      toast({
        title: 'Configuration saved',
        description: `Applied at ${appliedAtRef.current} by ${appliedByRef.current}`,
      });
    }, 500);
  }, [deploymentConfig, toast]);
  
  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied',
      description: `${label} copied to clipboard`,
    });
  };
  
  const handleEnvVarReveal = (key: string) => {
    setEnvVars(prev => prev.map(v => 
      v.key === key ? { ...v, revealed: !v.revealed } : v
    ));
  };
  
  const handleEnvVarDelete = (key: string) => {
    setDeletingEnvVar(key);
  };
  
  const confirmEnvVarDelete = () => {
    if (deletingEnvVar) {
      setEnvVars(prev => prev.filter(v => v.key !== deletingEnvVar));
      setDeletingEnvVar(null);
      toast({
        title: 'Environment variable deleted',
        description: `${deletingEnvVar} has been removed`,
      });
    }
  };
  
  const handleAddEnvVar = () => {
    if (!newEnvVar.key || !newEnvVar.value) {
      toast({
        title: 'Validation error',
        description: 'Key and value are required',
        variant: 'destructive',
      });
      return;
    }
    
    if (envVars.some(v => v.key === newEnvVar.key)) {
      toast({
        title: 'Validation error',
        description: 'Key already exists',
        variant: 'destructive',
      });
      return;
    }
    
    setEnvVars(prev => [...prev, { ...newEnvVar, revealed: false }]);
    setNewEnvVar({ key: '', value: '', isSecret: false });
    setAddingEnvVar(false);
    toast({
      title: 'Environment variable added',
      description: `${newEnvVar.key} has been added`,
    });
  };
  
  const handleTestNodeVersion = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: 'Test completed',
        description: `Node.js ${deploymentConfig.nodeVersion} test passed in ephemeral runner`,
      });
    }, 2000);
  };
  
  const handleQuickAction = (action: string) => {
    setConfirmModal({ type: action, isOpen: true });
  };
  
  const confirmQuickAction = () => {
    toast({
      title: 'Action completed',
      description: `${confirmModal.type} executed successfully`,
    });
    setConfirmModal({ type: '', isOpen: false });
  };
  
  const shouldShowBanner = !bannerAcknowledged && (
    overviewStats.lastDeployment.status === 'failed' ||
    queueStats.slaStatus === 'red' ||
    queueStats.slaBreach
  );
  
  const lastDeployment = mockDeployments[0];
  const hasSuccessfulBuild = mockDeployments.some(d => d.status === 'success');
  
  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Sticky Overview Bar */}
      <div 
        id="overview"
        className="sticky top-[calc(var(--tabs-height,4rem)+1px)] z-40 backdrop-blur supports-[backdrop-filter]:bg-background/70 border-b bg-background/95"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 py-4">
          <StatCard
            icon={Rocket}
            title="Last Deployment"
            value={
              <div className="flex items-center gap-2">
                <Badge className={lastDeployment.status === 'success' ? 'bg-green-500' : 'bg-red-500'}>
                  {lastDeployment.status}
                </Badge>
                <span className="text-sm font-normal text-muted-foreground">
                  {lastDeployment.version}
                </span>
              </div>
            }
            link={{ label: 'View logs', onClick: () => {} }}
          />
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <StatCard
                    icon={BarChart3}
                    title="Success Rate (7d)"
                    value={`${overviewStats.successRate7d.value}%`}
                    trend={overviewStats.successRate7d.trend}
                    sparkline={overviewStats.successRate7d.sparkline}
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Rolling 7 days build success rate</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <StatCard
            icon={Timer}
            title="Avg Build Time"
            value={
              <div className="space-y-0.5">
                <div className="text-base">p50: {overviewStats.avgBuildTime.p50}</div>
                <div className="text-sm text-muted-foreground">p95: {overviewStats.avgBuildTime.p95}</div>
              </div>
            }
          />
          
          <StatCard
            icon={Activity}
            title="Queue Load"
            value={
              <div>
                {overviewStats.queueLoad.active} / {overviewStats.queueLoad.pending} / {overviewStats.queueLoad.blocked}
              </div>
            }
            subtitle="Active / Pending / Blocked"
            badge={overviewStats.queueLoad.slaBreach && (
              <Badge variant="destructive" className="text-xs">SLA Breach</Badge>
            )}
          />
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <StatCard
                    icon={Users}
                    title="Workers"
                    value={`${overviewStats.workers.online} / ${overviewStats.workers.capacity}`}
                    subtitle="Online / Capacity"
                    tooltip="Concurrency limit: 10 workers"
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Concurrency limit: {overviewStats.workers.capacity} workers</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        {/* Quick Actions */}
        <div className="flex items-center justify-between gap-4 py-2 border-t">
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={() => handleQuickAction('redeploy')}
              disabled={!lastDeployment}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Redeploy latest
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleQuickAction('rollback')}
              disabled={!hasSuccessfulBuild}
            >
              <History className="h-4 w-4 mr-2" />
              Rollback
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleQuickAction('trigger-build')}
            >
              <Play className="h-4 w-4 mr-2" />
              Trigger build
            </Button>
            <Switch
              checked={!deploymentConfig.autoDeploy}
              onCheckedChange={(checked) => setDeploymentConfig({ ...deploymentConfig, autoDeploy: !checked })}
              id="pause-auto-deploy"
            />
            <Label htmlFor="pause-auto-deploy" className="text-sm">
              Pause auto-deploy
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={autoRefreshEnabled}
              onCheckedChange={setAutoRefreshEnabled}
              id="auto-refresh"
            />
            <Label htmlFor="auto-refresh" className="text-sm">
              Auto-refresh
            </Label>
          </div>
        </div>
      </div>
      
      {/* Status Banner */}
      {shouldShowBanner && (
        <StatusBanner
          message={
            overviewStats.lastDeployment.status === 'failed'
              ? 'Last deployment failed. Check logs for details.'
              : 'Queue SLA breach detected. Pending jobs exceed threshold.'
          }
          onAcknowledge={() => setBannerAcknowledged(true)}
          onViewLogs={() => {}}
        />
      )}
      
      {/* Two Column Grid */}
      <div id="config" className="grid grid-cols-12 gap-6">
        {/* Left Column: Build Configuration */}
        <div className="col-span-12 xl:col-span-7 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Build Configuration
                  </CardTitle>
                  <CardDescription>
                    {appliedAtRef.current && (
                      <span className="text-xs">
                        Applied at {appliedAtRef.current} by {appliedByRef.current}
                      </span>
                    )}
                  </CardDescription>
                </div>
                {isDirty && (
                  <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 dark:text-yellow-400">
                    Draft
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <Accordion type="multiple" defaultValue={['general', 'commands', 'deployment']}>
                <AccordionItem value="general">
                  <AccordionTrigger>General Settings</AccordionTrigger>
                  <AccordionContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="nodeVersion">Node.js Version</Label>
                      <div className="flex gap-2">
                        <Select
                          value={deploymentConfig.nodeVersion}
                          onValueChange={(value) => setDeploymentConfig({ ...deploymentConfig, nodeVersion: value })}
                          disabled={!hasWritePermission}
                        >
                          <SelectTrigger id="nodeVersion" className="flex-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="16.x">16.x</SelectItem>
                            <SelectItem value="18.x">18.x</SelectItem>
                            <SelectItem value="20.x">20.x</SelectItem>
                            <SelectItem value="22.x">22.x</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          variant="outline"
                          onClick={handleTestNodeVersion}
                          disabled={!hasWritePermission || isLoading}
                        >
                          <Terminal className="h-4 w-4 mr-2" />
                          Test in runner
                        </Button>
                      </div>
                      {!hasWritePermission && (
                        <p className="text-xs text-muted-foreground">
                          You don't have permission to edit. Contact an admin.
                        </p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Environment Variables</Label>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setAddingEnvVar(true)}
                          disabled={!hasWritePermission}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add
                        </Button>
                      </div>
                      
                      {addingEnvVar && (
                        <Card className="p-4 space-y-3">
                          <div className="space-y-2">
                            <Label>Key</Label>
                            <Input
                              value={newEnvVar.key}
                              onChange={(e) => setNewEnvVar({ ...newEnvVar, key: e.target.value })}
                              placeholder="KEY_NAME"
                              className="font-mono"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Value</Label>
                            <Input
                              value={newEnvVar.value}
                              onChange={(e) => setNewEnvVar({ ...newEnvVar, value: e.target.value })}
                              placeholder="value"
                              type={newEnvVar.isSecret ? 'password' : 'text'}
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={newEnvVar.isSecret}
                              onCheckedChange={(checked) => setNewEnvVar({ ...newEnvVar, isSecret: checked })}
                              id="new-secret"
                            />
                            <Label htmlFor="new-secret" className="text-sm">Secret (masked)</Label>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" onClick={handleAddEnvVar}>Add</Button>
                            <Button size="sm" variant="outline" onClick={() => {
                              setAddingEnvVar(false);
                              setNewEnvVar({ key: '', value: '', isSecret: false });
                            }}>Cancel</Button>
                          </div>
                        </Card>
                      )}
                      
                      {envVars.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No environment variables. Add your first variable above.
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {envVars.map((envVar) => (
                            <div key={envVar.key} className="flex items-center gap-2 p-2 border rounded-lg">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <code className="text-sm font-mono">{envVar.key}</code>
                                  {envVar.isSecret && (
                                    <Badge variant="outline" className="text-xs">Secret</Badge>
                                  )}
                                </div>
                                <div className="text-sm text-muted-foreground truncate">
                                  {envVar.isSecret && !envVar.revealed
                                    ? '••••••••••••'
                                    : envVar.value}
                                </div>
                              </div>
                              <div className="flex items-center gap-1">
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() => handleCopy(envVar.key, 'Key')}
                                      >
                                        <Copy className="h-3 w-3" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Copy key</TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                                {envVar.isSecret && (
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-8 w-8"
                                          onClick={() => handleEnvVarReveal(envVar.key)}
                                        >
                                          {envVar.revealed ? (
                                            <EyeOff className="h-3 w-3" />
                                          ) : (
                                            <Eye className="h-3 w-3" />
                                          )}
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        {envVar.revealed ? 'Hide value' : 'Reveal value (warning: sensitive data)'}
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                )}
                                {!envVar.isSecret && (
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-8 w-8"
                                          onClick={() => handleCopy(envVar.value, 'Value')}
                                          disabled={envVar.isSecret && !envVar.revealed}
                                        >
                                          <Copy className="h-3 w-3" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>Copy value</TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                )}
                                {envVar.isSecret && (
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-8 w-8"
                                          onClick={() => toast({
                                            title: 'Rotate',
                                            description: `Rotating ${envVar.key}... (mock)`,
                                          })}
                                        >
                                          <RefreshCw className="h-3 w-3" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>Rotate secret</TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                )}
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-destructive"
                                        onClick={() => handleEnvVarDelete(envVar.key)}
                                        disabled={!hasWritePermission}
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Delete</TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="commands">
                  <AccordionTrigger>Build & Start Commands</AccordionTrigger>
                  <AccordionContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="buildCommand">Build Command</Label>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopy(deploymentConfig.buildCommand, 'Build command')}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <Input
                        id="buildCommand"
                        value={deploymentConfig.buildCommand}
                        onChange={(e) => setDeploymentConfig({ ...deploymentConfig, buildCommand: e.target.value })}
                        placeholder="pnpm build"
                        className="font-mono"
                        disabled={!hasWritePermission}
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="startCommand">Start Command</Label>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopy(deploymentConfig.startCommand, 'Start command')}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <Input
                        id="startCommand"
                        value={deploymentConfig.startCommand}
                        onChange={(e) => setDeploymentConfig({ ...deploymentConfig, startCommand: e.target.value })}
                        placeholder="pnpm start"
                        className="font-mono"
                        disabled={!hasWritePermission}
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="deployment">
                  <AccordionTrigger>Deployment Settings</AccordionTrigger>
                  <AccordionContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="environment">Environment</Label>
                      <Select
                        value={deploymentConfig.environment}
                        onValueChange={(value) => setDeploymentConfig({ ...deploymentConfig, environment: value })}
                        disabled={!hasWritePermission}
                      >
                        <SelectTrigger id="environment">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="production">Production</SelectItem>
                          <SelectItem value="staging">Staging</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Auto Deploy</Label>
                        <p className="text-sm text-muted-foreground">Automatically deploy on push to main</p>
                      </div>
                      <Switch
                        checked={deploymentConfig.autoDeploy}
                        onCheckedChange={(checked) => setDeploymentConfig({ ...deploymentConfig, autoDeploy: checked })}
                        disabled={!hasWritePermission}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="deploymentTarget">Deployment Target</Label>
                      <Select
                        value={deploymentConfig.deploymentTarget}
                        onValueChange={(value) => setDeploymentConfig({ ...deploymentConfig, deploymentTarget: value })}
                        disabled={!hasWritePermission}
                      >
                        <SelectTrigger id="deploymentTarget">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="vercel">Vercel</SelectItem>
                          <SelectItem value="netlify">Netlify</SelectItem>
                          <SelectItem value="aws">AWS</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
              
              <div className="flex justify-between gap-2 mt-6 pt-4 border-t">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setDeploymentConfig(initialConfigRef.current)}
                    disabled={!isDirty || !hasWritePermission}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Reset to Last Applied
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setDeploymentConfig({
                        buildCommand: 'pnpm build',
                        startCommand: 'pnpm start',
                        nodeVersion: '18.x',
                        environment: 'production',
                        autoDeploy: true,
                        enableRollback: true,
                        healthCheckUrl: '/api/health',
                        deploymentTimeout: 600,
                        deploymentTarget: 'vercel',
                      });
                    }}
                    disabled={!hasWritePermission}
                  >
                    Restore Defaults
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowDiffModal(true)}
                    disabled={!isDirty || !hasWritePermission}
                  >
                    Preview Diff
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={!isDirty || !hasWritePermission || isLoading}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Right Column: System Insights */}
        <div id="insights" className="col-span-12 xl:col-span-5 space-y-6">
          {/* Queue Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Queue Statistics Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-muted-foreground">Total</div>
                  <div className="text-2xl font-bold">{queueStats.total}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Active</div>
                  <div className="text-2xl font-bold text-blue-600">{queueStats.active}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Pending</div>
                  <div className="text-2xl font-bold text-yellow-600">{queueStats.pending}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Failed</div>
                  <div className="text-2xl font-bold text-red-600">{queueStats.failed}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Oldest Wait</div>
                  <div className="text-lg font-semibold">{queueStats.oldestWait}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Throughput</div>
                  <div className="text-lg font-semibold">{queueStats.throughput} jobs/min</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-muted-foreground">24h Load</div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge
                          className={
                            queueStats.slaStatus === 'green'
                              ? 'bg-green-500'
                              : queueStats.slaStatus === 'amber'
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                          }
                        >
                          SLA: {queueStats.slaStatus}
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Green: &lt;10 pending, Amber: 10-20 pending, Red: &gt;20 pending</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <QueueMiniChart data={queueStats.hourlyData} />
              </div>
            </CardContent>
          </Card>
          
          {/* Previous Builds */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Previous Builds Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {previousBuilds.map((build) => (
                  <div
                    key={build.id}
                    className="flex items-center justify-between p-2 border rounded-lg hover:bg-muted/50"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="link"
                          className="h-auto p-0 text-xs font-mono"
                          onClick={() => {}}
                        >
                          {build.id}
                        </Button>
                        <Badge
                          className={
                            build.status === 'success'
                              ? 'bg-green-500 text-white'
                              : 'bg-red-500 text-white'
                          }
                        >
                          {build.status}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {build.duration} • {build.triggeredBy} • {build.commit} • {build.timestamp}
                      </div>
                    </div>
                    {build.status === 'success' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleQuickAction(`redeploy-${build.id}`)}
                      >
                        Redeploy
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          {/* Deployment Health */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Deployment Health</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-xs text-muted-foreground mb-2">7d Trend</div>
                <HealthTrend data={healthMetrics.trend7d} />
              </div>
              
              <div>
                <div className="text-xs text-muted-foreground">MTTR</div>
                <div className="text-2xl font-bold">{healthMetrics.mttr}</div>
              </div>
              
              <div>
                <div className="text-xs text-muted-foreground mb-2">Top Failure Causes</div>
                <div className="flex flex-wrap gap-2">
                  {healthMetrics.topFailureCauses.map((cause, i) => (
                    <Badge key={i} variant="outline">
                      {cause.cause} ({cause.count})
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Action Links */}
          <div className="space-y-2">
            <Button variant="outline" className="w-full justify-start" onClick={() => {}}>
              <FileText className="h-4 w-4 mr-2" />
              View Logs
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => {}}>
              <Settings className="h-4 w-4 mr-2" />
              View Runners
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => {}}>
              <Link2 className="h-4 w-4 mr-2" />
              CI/CD Webhooks
            </Button>
          </div>
        </div>
      </div>
      
      {/* Deployment History Table */}
      <div id="history" className="space-y-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Full Deployment History
          </CardTitle>
        </div>
        
        {/* Filter Strip */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Label className="text-sm">Status:</Label>
                <Select
                  value={historyFilters.status.join(',') || 'all'}
                  onValueChange={(value) => {
                    if (value === 'all') {
                      setHistoryFilters({ ...historyFilters, status: [] });
                    } else {
                      setHistoryFilters({ ...historyFilters, status: [value] });
                    }
                  }}
                >
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="success">Success</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center gap-2">
                <Label className="text-sm">Date Range:</Label>
                <Select
                  value={historyFilters.dateRange}
                  onValueChange={(value) => setHistoryFilters({ ...historyFilters, dateRange: value })}
                >
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="24h">Last 24h</SelectItem>
                    <SelectItem value="7d">Last 7d</SelectItem>
                    <SelectItem value="30d">Last 30d</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by user..."
                  value={historyFilters.triggeredBy}
                  onChange={(e) => setHistoryFilters({ ...historyFilters, triggeredBy: e.target.value })}
                  className="max-w-[200px]"
                />
              </div>
              
              <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by commit SHA..."
                  value={historyFilters.commit}
                  onChange={(e) => setHistoryFilters({ ...historyFilters, commit: e.target.value })}
                  className="max-w-[200px] font-mono text-sm"
                />
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Table - Preserved exactly */}
        <Card>
          <CardContent className="p-0">
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
                {filteredDeployments.map((deployment) => (
                  <TableRow key={deployment.id}>
                    <TableCell className="font-medium">{deployment.version}</TableCell>
                    <TableCell className="hidden md:table-cell capitalize text-sm text-foreground">
                      {deployment.environment}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell font-mono text-sm">
                      {deployment.commit}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {deployment.branch}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                      {deployment.deployedAt}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm">
                      {deployment.duration}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={(deployment.status === 'success'
                          ? getBadgeClasses('deployment.success') + ' w-16 justify-center'
                          : getBadgeClasses('deployment.failed') + ' w-16 justify-center font-semibold')}
                      >
                        {deployment.status === 'success' ? 'Success' : 'Failed'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {deployment.status === 'success' && deploymentConfig.enableRollback && (
                          <Button variant="ghost" size="icon" aria-label="Rollback">
                            <RotateCcw className="h-4 w-4" />
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" aria-label="Open details">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
      
      {/* Modals */}
      <ConfigDiffModal
        isOpen={showDiffModal}
        onClose={() => setShowDiffModal(false)}
        current={deploymentConfig}
        original={initialConfigRef.current}
      />
      
      <AlertDialog open={confirmModal.isOpen} onOpenChange={(open) => setConfirmModal({ ...confirmModal, isOpen: open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm {confirmModal.type}</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to {confirmModal.type}? This action will be executed immediately.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmQuickAction}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <AlertDialog open={deletingEnvVar !== null} onOpenChange={(open) => !open && setDeletingEnvVar(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Environment Variable</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{deletingEnvVar}</strong>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmEnvVarDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
