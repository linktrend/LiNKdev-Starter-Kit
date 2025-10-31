'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TableContainer } from '@/components/ui/table-container';
import { DateTimeCell, UserOrgCell, DetailsLink, ExpandedRowCell } from '@/components/ui/table-utils';
import { TableColgroup, TableHeadAction, TableCellAction, COLUMN_WIDTHS, type ColumnDef } from '@/components/ui/table-columns';
import { TableHeadText, TableHeadNumeric, TableHeadStatus, TableCellText, TableCellNumeric, TableCellStatus, ActionIconsCell } from '@/components/ui/table-cells';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import {
  CreditCard,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  Calendar,
  Search,
  Filter,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  Plus,
  Copy,
  Download,
  FileText,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock,
  BarChart3,
  PieChart,
  LineChart,
  Activity,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Archive,
  MoreHorizontal,
  Send,
  Receipt,
  Tag,
  Building2,
  Mail,
  Globe
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { toast } from '@/components/ui/use-toast';
import { format } from 'date-fns';
import { getUserDisplay } from '@/utils/userDisplay';

// Types
type SubscriptionStatus = 'active' | 'trial' | 'past_due' | 'cancelled' | 'expired';
type PlanStatus = 'active' | 'inactive';
type InvoiceStatus = 'paid' | 'pending' | 'failed';
type DiscountType = 'percentage' | 'fixed';
type BillingCycle = 'monthly' | 'yearly' | 'custom';

// Mock Data - Overview Metrics
const overviewMetrics = {
  mrr: 125000,
  arr: 1500000,
  activeSubscriptions: 342,
  trialSubscriptions: 28,
  churnRate: 2.4,
  revenueGrowth: 12.5,
  arpu: 365.5,
  ltv: 4500
};

// Mock Data - Revenue Chart Data (last 12 months)
const revenueData = [
  { month: 'Jan 2024', mrr: 98000, arr: 1176000 },
  { month: 'Feb 2024', mrr: 102000, arr: 1224000 },
  { month: 'Mar 2024', mrr: 105000, arr: 1260000 },
  { month: 'Apr 2024', mrr: 108000, arr: 1296000 },
  { month: 'May 2024', mrr: 110000, arr: 1320000 },
  { month: 'Jun 2024', mrr: 112000, arr: 1344000 },
  { month: 'Jul 2024', mrr: 115000, arr: 1380000 },
  { month: 'Aug 2024', mrr: 118000, arr: 1416000 },
  { month: 'Sep 2024', mrr: 120000, arr: 1440000 },
  { month: 'Oct 2024', mrr: 122000, arr: 1464000 },
  { month: 'Nov 2024', mrr: 123500, arr: 1482000 },
  { month: 'Dec 2024', mrr: 125000, arr: 1500000 },
];

// Mock Data - Subscription Distribution
const subscriptionDistribution = [
  { plan: 'Starter', count: 156, percentage: 45.6, color: 'bg-blue-500' },
  { plan: 'Professional', count: 128, percentage: 37.4, color: 'bg-green-500' },
  { plan: 'Enterprise', count: 45, percentage: 13.2, color: 'bg-purple-500' },
  { plan: 'Trial', count: 28, percentage: 8.2, color: 'bg-orange-500' },
];

// Mock Data - Plans
interface Plan {
  id: string;
  name: string;
  slug: string;
  description: string;
  status: PlanStatus;
  monthlyPrice: number;
  yearlyPrice: number;
  setupFee: number;
  trialDays: number;
  currency: string;
  isPublic: boolean;
  displayOrder: number;
  subscriptionsCount: number;
  features: string[];
  limits: {
    users: number | null;
    storage: number | null;
    apiRateLimit: number | null;
  };
}

const mockPlans: Plan[] = [
  {
    id: 'plan-1',
    name: 'Free',
    slug: 'free',
    description: 'Get started with essential features',
    status: 'active',
    monthlyPrice: 0,
    yearlyPrice: 0,
    setupFee: 0,
    trialDays: 0,
    currency: 'USD',
    isPublic: true,
    displayOrder: 1,
    subscriptionsCount: 500,
    features: ['Core usage limits', 'Community support'],
    limits: { users: 1, storage: 1, apiRateLimit: 500 }
  },
  {
    id: 'plan-2',
    name: 'Basic',
    slug: 'basic',
    description: 'Perfect for small teams getting started',
    status: 'inactive',
    monthlyPrice: 29,
    yearlyPrice: 290,
    setupFee: 0,
    trialDays: 14,
    currency: 'USD',
    isPublic: true,
    displayOrder: 2,
    subscriptionsCount: 156,
    features: ['10 users', '10 GB storage', 'Email support', 'API access'],
    limits: { users: 10, storage: 10, apiRateLimit: 1000 }
  },
  {
    id: 'plan-3',
    name: 'Pro',
    slug: 'pro',
    description: 'For growing teams and businesses',
    status: 'active',
    monthlyPrice: 99,
    yearlyPrice: 990,
    setupFee: 0,
    trialDays: 14,
    currency: 'USD',
    isPublic: true,
    displayOrder: 3,
    subscriptionsCount: 128,
    features: ['50 users', '100 GB storage', 'Priority support', 'Advanced analytics', 'Custom integrations'],
    limits: { users: 50, storage: 100, apiRateLimit: 10000 }
  },
  {
    id: 'plan-4',
    name: 'Enterprise',
    slug: 'enterprise',
    description: 'For large organizations with custom needs',
    status: 'active',
    monthlyPrice: 499,
    yearlyPrice: 4990,
    setupFee: 500,
    trialDays: 30,
    currency: 'USD',
    isPublic: true,
    displayOrder: 4,
    subscriptionsCount: 45,
    features: ['Unlimited users', 'Unlimited storage', '24/7 support', 'SLA guarantee', 'Dedicated account manager', 'White-labeling'],
    limits: { users: null, storage: null, apiRateLimit: null }
  },
];

// Mock Data - Subscriptions
interface Subscription {
  id: string;
  organizationId: string;
  organizationName: string;
  planId: string;
  planName: string;
  status: SubscriptionStatus;
  amount: number;
  billingCycle: BillingCycle;
  nextBillingDate: Date;
  createdDate: Date;
  trialEndsAt?: Date;
  user?: {
    name?: string;
    email?: string;
    username?: string;
  };
}

const mockSubscriptions: Subscription[] = [
  {
    id: 'sub-1',
    organizationId: 'org-1',
    organizationName: 'Acme Corp',
    planId: 'plan-2',
    planName: 'Pro',
    status: 'active',
    amount: 99,
    billingCycle: 'monthly',
    nextBillingDate: new Date('2025-02-15'),
    createdDate: new Date('2024-01-15'),
    user: { name: 'Jane Cooper', email: 'jane.cooper@example.com', username: 'janecooper' },
  },
  {
    id: 'sub-2',
    organizationId: 'org-2',
    organizationName: 'TechStart Inc',
    planId: 'plan-1',
    planName: 'Basic',
    status: 'active',
    amount: 29,
    billingCycle: 'monthly',
    nextBillingDate: new Date('2025-02-10'),
    createdDate: new Date('2024-06-10'),
    user: { name: 'Robert Fox', email: 'robert.fox@example.com', username: 'robfox' },
  },
  {
    id: 'sub-3',
    organizationId: 'org-3',
    organizationName: 'Enterprise Solutions',
    planId: 'plan-3',
    planName: 'Enterprise',
    status: 'active',
    amount: 499,
    billingCycle: 'monthly',
    nextBillingDate: new Date('2025-02-20'),
    createdDate: new Date('2023-11-20'),
    user: { name: 'Courtney Henry', email: 'courtney.henry@example.com', username: 'courtney' },
  },
  {
    id: 'sub-4',
    organizationId: 'org-4',
    organizationName: 'Demo Company',
    planId: 'plan-1',
    planName: 'Basic',
    status: 'trial',
    amount: 0,
    billingCycle: 'monthly',
    nextBillingDate: new Date('2025-02-05'),
    createdDate: new Date('2025-01-22'),
    trialEndsAt: new Date('2025-02-05'),
    user: { name: 'Devon Lane', email: 'devon.lane@example.com', username: 'devon' },
  },
  {
    id: 'sub-5',
    organizationId: 'org-5',
    organizationName: 'Past Due Corp',
    planId: 'plan-2',
    planName: 'Pro',
    status: 'past_due',
    amount: 99,
    billingCycle: 'monthly',
    nextBillingDate: new Date('2025-01-28'),
    createdDate: new Date('2023-07-28'),
    user: { name: 'Darlene Robertson', email: 'darlene.robertson@example.com', username: 'darlene' },
  },
  {
    id: 'sub-6',
    organizationId: 'org-6',
    organizationName: 'Cancelled Org',
    planId: 'plan-1',
    planName: 'Basic',
    status: 'cancelled',
    amount: 29,
    billingCycle: 'monthly',
    nextBillingDate: new Date('2025-02-01'),
    createdDate: new Date('2023-05-01'),
    user: { name: 'Leslie Alexander', email: 'leslie.alexander@example.com', username: 'leslie' },
  },
];

// Mock Data - Invoices
interface Invoice {
  id: string;
  number: string;
  organizationId: string;
  organizationName: string;
  amount: number;
  status: InvoiceStatus;
  dueDate: Date;
  paidDate?: Date;
  createdAt: Date;
}

const mockInvoices: Invoice[] = [
  {
    id: 'inv-1',
    number: 'INV-2025-001',
    organizationId: 'org-1',
    organizationName: 'Acme Corp',
    amount: 99,
    status: 'paid',
    dueDate: new Date('2025-01-15'),
    paidDate: new Date('2025-01-14'),
    createdAt: new Date('2025-01-01'),
  },
  {
    id: 'inv-2',
    number: 'INV-2025-002',
    organizationId: 'org-2',
    organizationName: 'TechStart Inc',
    amount: 29,
    status: 'paid',
    dueDate: new Date('2025-01-10'),
    paidDate: new Date('2025-01-09'),
    createdAt: new Date('2025-01-01'),
  },
  {
    id: 'inv-3',
    number: 'INV-2025-003',
    organizationId: 'org-5',
    organizationName: 'Past Due Corp',
    amount: 99,
    status: 'pending',
    dueDate: new Date('2025-01-28'),
    createdAt: new Date('2025-01-14'),
  },
  {
    id: 'inv-4',
    number: 'INV-2025-004',
    organizationId: 'org-7',
    organizationName: 'Failed Payments LLC',
    amount: 49,
    status: 'failed',
    dueDate: new Date('2025-01-25'),
    createdAt: new Date('2025-01-11'),
  },
];

// Mock Data - Coupons
interface Coupon {
  id: string;
  code: string;
  discountType: DiscountType;
  discountValue: number;
  status: 'active' | 'expired' | 'inactive';
  usageCount: number;
  usageLimit: number | null;
  validFrom: Date;
  validUntil: Date;
  eligiblePlans: string[];
  minPurchase?: number;
}

const mockCoupons: Coupon[] = [
  {
    id: 'coupon-1',
    code: 'WELCOME20',
    discountType: 'percentage',
    discountValue: 20,
    status: 'active',
    usageCount: 45,
    usageLimit: 100,
    validFrom: new Date('2024-01-01'),
    validUntil: new Date('2025-12-31'),
    eligiblePlans: ['plan-1', 'plan-2'],
  },
  {
    id: 'coupon-2',
    code: 'SUMMER2024',
    discountType: 'fixed',
    discountValue: 50,
    status: 'expired',
    usageCount: 78,
    usageLimit: 100,
    validFrom: new Date('2024-06-01'),
    validUntil: new Date('2024-08-31'),
    eligiblePlans: ['plan-2', 'plan-3'],
  },
  {
    id: 'coupon-3',
    code: 'ENTERPRISE30',
    discountType: 'percentage',
    discountValue: 30,
    status: 'active',
    usageCount: 12,
    usageLimit: null,
    validFrom: new Date('2024-01-01'),
    validUntil: new Date('2026-12-31'),
    eligiblePlans: ['plan-3'],
    minPurchase: 500,
  },
];

// Mock Data - Organizations
interface Organization {
  id: string;
  name: string;
  email: string;
  currentPlan: string;
  planStatus: SubscriptionStatus;
  mrr: number;
  nextBillingDate: Date;
}

const mockOrganizations: Organization[] = [
  {
    id: 'org-1',
    name: 'Acme Corp',
    email: 'billing@acme.com',
    currentPlan: 'Professional',
    planStatus: 'active',
    mrr: 99,
    nextBillingDate: new Date('2025-02-15'),
  },
  {
    id: 'org-2',
    name: 'TechStart Inc',
    email: 'admin@techstart.com',
    currentPlan: 'Starter',
    planStatus: 'active',
    mrr: 29,
    nextBillingDate: new Date('2025-02-10'),
  },
  {
    id: 'org-3',
    name: 'Enterprise Solutions',
    email: 'contact@enterprise.com',
    currentPlan: 'Enterprise',
    planStatus: 'active',
    mrr: 499,
    nextBillingDate: new Date('2025-02-20'),
  },
];

// Available Features (initial)
const initialFeatures = [
  { id: 'f1', name: 'Multi-user support', category: 'Core' },
  { id: 'f2', name: 'API access', category: 'Core' },
  { id: 'f3', name: 'Basic analytics', category: 'Core' },
  { id: 'f4', name: 'Email support', category: 'Core' },
  { id: 'f5', name: 'Advanced analytics', category: 'Advanced' },
  { id: 'f6', name: 'Custom integrations', category: 'Advanced' },
  { id: 'f7', name: 'Priority support', category: 'Advanced' },
  { id: 'f8', name: 'SLA guarantee', category: 'Advanced' },
  { id: 'f9', name: 'Custom features', category: 'Add-ons' },
  { id: 'f10', name: 'Dedicated account manager', category: 'Add-ons' },
  { id: 'f11', name: 'White-labeling', category: 'Add-ons' },
];

export default function ConsoleBillingPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'plans' | 'subscriptions' | 'revenue' | 'payments' | 'coupons' | 'organizations'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [showPlanDialog, setShowPlanDialog] = useState(false);
  const [showSubscriptionDialog, setShowSubscriptionDialog] = useState(false);
  const [showInvoiceDialog, setShowInvoiceDialog] = useState(false);
  const [showCouponDialog, setShowCouponDialog] = useState(false);
  const [showOrgDialog, setShowOrgDialog] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [revenueView, setRevenueView] = useState<'monthly' | 'yearly' | 'arpu'>('monthly');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const tabsListRef = useRef<HTMLDivElement>(null);
  // Feature Library state
  const [features, setFeatures] = useState(initialFeatures);
  const [showAddFeatureDialog, setShowAddFeatureDialog] = useState(false);
  const [newFeatureName, setNewFeatureName] = useState('');
  const [newFeatureCategory, setNewFeatureCategory] = useState('Core');

  // Plan -> Feature mapping state (by feature id)
  const planIds = useMemo(() => mockPlans.map((p) => p.id), []);
  const initialPlanFeatures = useMemo(() => {
    // Seed: Free minimal, Basic ⊇ Free, Pro ⊇ Basic, Enterprise = all
    const byId: Record<string, Set<string>> = {};
    const freeFeatureIds = new Set(['f1', 'f2', 'f3', 'f4']);
    const basicFeatureIds = new Set([...freeFeatureIds, 'f5']);
    const proFeatureIds = new Set([...basicFeatureIds, 'f6', 'f7']);
    const enterpriseFeatureIds = new Set(initialFeatures.map((f) => f.id));
    for (const p of mockPlans) {
      if (p.slug === 'free') byId[p.id] = new Set(freeFeatureIds);
      else if (p.slug === 'basic') byId[p.id] = new Set(basicFeatureIds);
      else if (p.slug === 'pro') byId[p.id] = new Set(proFeatureIds);
      else if (p.slug === 'enterprise') byId[p.id] = new Set(enterpriseFeatureIds);
      else byId[p.id] = new Set();
    }
    return byId;
  }, []);

  const [planFeaturesApplied, setPlanFeaturesApplied] = useState<Record<string, Set<string>>>(initialPlanFeatures);
  const [planFeaturesDraft, setPlanFeaturesDraft] = useState<Record<string, Set<string>>>(initialPlanFeatures);

  const togglePlanFeature = (planId: string, featureId: string) => {
    setPlanFeaturesDraft((prev) => {
      const next = { ...prev };
      const set = new Set(next[planId] ?? []);
      if (set.has(featureId)) set.delete(featureId); else set.add(featureId);
      next[planId] = set;
      return next;
    });
  };

  const mappingsEqual = (a: Record<string, Set<string>>, b: Record<string, Set<string>>): boolean => {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length !== keysB.length) return false;
    for (const k of keysA) {
      const sa = a[k] ?? new Set<string>();
      const sb = b[k] ?? new Set<string>();
      if (sa.size !== sb.size) return false;
      for (const v of sa) if (!sb.has(v)) return false;
    }
    return true;
  };

  const hasUnsavedChanges = useMemo(() => !mappingsEqual(planFeaturesDraft, planFeaturesApplied), [planFeaturesDraft, planFeaturesApplied]);

  // Enforce fixed tab width (200px) for all tabs
  useEffect(() => {
    let resizeTimer: NodeJS.Timeout;

    const applyFixedWidth = () => {
      if (!tabsListRef.current) return;
      const tabs = Array.from(tabsListRef.current.querySelectorAll('[role="tab"]')) as HTMLElement[];
      tabs.forEach((tab) => {
        tab.style.width = '200px';
        tab.style.maxWidth = '200px';
      });
    };

    const run = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(applyFixedWidth, 50);
    };

    run();
    window.addEventListener('resize', run);
    return () => {
      clearTimeout(resizeTimer);
      window.removeEventListener('resize', run);
    };
  }, []);

  // Filtered data
  const filteredPlans = useMemo(() => {
    let filtered = mockPlans;
    if (searchTerm) {
      const query = searchTerm.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(query) || 
        p.description.toLowerCase().includes(query)
      );
    }
    if (statusFilter !== 'all') {
      filtered = filtered.filter(p => p.status === statusFilter);
    }
    return filtered;
  }, [searchTerm, statusFilter]);

  const filteredSubscriptions = useMemo(() => {
    let filtered = mockSubscriptions;
    if (searchTerm) {
      const query = searchTerm.toLowerCase();
      filtered = filtered.filter(s => 
        s.organizationName.toLowerCase().includes(query) ||
        s.planName.toLowerCase().includes(query)
      );
    }
    if (statusFilter !== 'all') {
      filtered = filtered.filter(s => s.status === statusFilter);
    }
    return filtered;
  }, [searchTerm, statusFilter]);

  const filteredInvoices = useMemo(() => {
    let filtered = mockInvoices;
    if (searchTerm) {
      const query = searchTerm.toLowerCase();
      filtered = filtered.filter(i => 
        i.organizationName.toLowerCase().includes(query) ||
        i.number.toLowerCase().includes(query)
      );
    }
    if (statusFilter !== 'all') {
      filtered = filtered.filter(i => i.status === statusFilter);
    }
    return filtered;
  }, [searchTerm, statusFilter]);

  const filteredCoupons = useMemo(() => {
    let filtered = mockCoupons;
    if (searchTerm) {
      const query = searchTerm.toLowerCase();
      filtered = filtered.filter(c => 
        c.code.toLowerCase().includes(query)
      );
    }
    if (statusFilter !== 'all') {
      filtered = filtered.filter(c => c.status === statusFilter);
    }
    return filtered;
  }, [searchTerm, statusFilter]);

  const filteredOrganizations = useMemo(() => {
    let filtered = mockOrganizations;
    if (searchTerm) {
      const query = searchTerm.toLowerCase();
      filtered = filtered.filter(o => 
        o.name.toLowerCase().includes(query) ||
        o.email.toLowerCase().includes(query)
      );
    }
    return filtered;
  }, [searchTerm]);

  const getStatusBadge = (status: SubscriptionStatus | InvoiceStatus | PlanStatus | string) => {
    const variants: Record<string, { className: string; label: string }> = {
      active: { className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100', label: 'Active' },
      trial: { className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100', label: 'Trial' },
      past_due: { className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100', label: 'Past Due' },
      cancelled: { className: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200', label: 'Cancelled' },
      expired: { className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100', label: 'Expired' },
      paid: { className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100', label: 'Paid' },
      pending: { className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100', label: 'Pending' },
      failed: { className: 'border border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-900/20 dark:text-red-300', label: 'Failed' },
      inactive: { className: 'border border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-900/20 dark:text-red-300', label: 'Inactive' },
    };

    const config = variants[status] || { className: '', label: String(status) };
    return (
      <Badge
        variant="outline"
        className={cn('inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-semibold min-w-[80px] border', config.className)}
      >
        {config.label}
      </Badge>
    );
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
          <RefreshCw className={cn('h-4 w-4', autoRefresh && 'animate-spin')} />
          {autoRefresh ? 'Auto-refresh' : 'Manual'}
        </button>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <TabsList ref={tabsListRef} className="inline-flex w-full flex-wrap gap-1 justify-start">
              <TabsTrigger value="overview" className="w-[200px] flex-initial">
                <BarChart3 className="h-4 w-4 mr-1 sm:mr-2 flex-shrink-0" />
                <span className="truncate">Overview</span>
              </TabsTrigger>
              <TabsTrigger value="plans" className="w-[200px] flex-initial">
                <CreditCard className="h-4 w-4 mr-1 sm:mr-2 flex-shrink-0" />
                <span className="truncate">Plans & Features</span>
              </TabsTrigger>
              <TabsTrigger value="subscriptions" className="w-[200px] flex-initial">
                <Activity className="h-4 w-4 mr-1 sm:mr-2 flex-shrink-0" />
                <span className="truncate">Subscriptions</span>
              </TabsTrigger>
              <TabsTrigger value="revenue" className="w-[200px] flex-initial">
                <TrendingUp className="h-4 w-4 mr-1 sm:mr-2 flex-shrink-0" />
                <span className="truncate">Revenue & Analytics</span>
              </TabsTrigger>
              <TabsTrigger value="payments" className="w-[200px] flex-initial">
                <Receipt className="h-4 w-4 mr-1 sm:mr-2 flex-shrink-0" />
                <span className="truncate">Payments & Invoices</span>
              </TabsTrigger>
              <TabsTrigger value="coupons" className="w-[200px] flex-initial">
                <Tag className="h-4 w-4 mr-1 sm:mr-2 flex-shrink-0" />
                <span className="truncate">Coupons & Promotions</span>
              </TabsTrigger>
              <TabsTrigger value="organizations" className="w-[200px] flex-initial">
                <Building2 className="h-4 w-4 mr-1 sm:mr-2 flex-shrink-0" />
                <span className="truncate">Organization Billing</span>
              </TabsTrigger>
            </TabsList>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4 mt-0">
              {/* Key Metrics Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2 !flex-row">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-primary flex-shrink-0" />
                      <CardTitle className="text-sm font-medium">MRR</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">${overviewMetrics.mrr.toLocaleString()}</div>
                    <div className="flex items-center gap-1 mt-1">
                      <TrendingUp className="h-3 w-3 text-green-600" />
                      <p className="text-xs text-muted-foreground">+{overviewMetrics.revenueGrowth}% from last month</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2 !flex-row">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-primary flex-shrink-0" />
                      <CardTitle className="text-sm font-medium">ARR</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">${(overviewMetrics.arr / 1000).toFixed(0)}K</div>
                    <p className="text-xs text-muted-foreground mt-1">Annual recurring revenue</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2 !flex-row">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-primary flex-shrink-0" />
                      <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{overviewMetrics.activeSubscriptions}</div>
                    <p className="text-xs text-muted-foreground mt-1">{overviewMetrics.trialSubscriptions} on trial</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2 !flex-row">
                    <div className="flex items-center gap-2">
                      <TrendingDown className="h-4 w-4 text-primary flex-shrink-0" />
                      <CardTitle className="text-sm font-medium">Churn Rate</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{overviewMetrics.churnRate}%</div>
                    <p className="text-xs text-muted-foreground mt-1">Monthly churn rate</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2 !flex-row">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-primary flex-shrink-0" />
                      <CardTitle className="text-sm font-medium">ARPU</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">${overviewMetrics.arpu}</div>
                    <p className="text-xs text-muted-foreground mt-1">Average revenue per user</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2 !flex-row">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-primary flex-shrink-0" />
                      <CardTitle className="text-sm font-medium">LTV</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">${overviewMetrics.ltv.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground mt-1">Customer lifetime value</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2 !flex-row">
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-primary flex-shrink-0" />
                      <CardTitle className="text-sm font-medium">Revenue Growth</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">+{overviewMetrics.revenueGrowth}%</div>
                    <p className="text-xs text-muted-foreground mt-1">Month over month</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2 !flex-row">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary flex-shrink-0" />
                      <CardTitle className="text-sm font-medium">Trial Subscriptions</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{overviewMetrics.trialSubscriptions}</div>
                    <p className="text-xs text-muted-foreground mt-1">Active trial periods</p>
                  </CardContent>
                </Card>
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Revenue Trend</CardTitle>
                    <CardDescription>MRR and ARR over the last 12 months</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-center justify-center border rounded-lg bg-muted/30">
                      <div className="text-center">
                        <LineChart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Revenue chart visualization</p>
                        <p className="text-xs text-muted-foreground mt-2">MRR: ${overviewMetrics.mrr.toLocaleString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Month on Month Churn Rate</CardTitle>
                    <CardDescription>Churn rate trends over the last 12 months</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-center justify-center border rounded-lg bg-muted/30">
                      <div className="text-center">
                        <TrendingDown className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Churn rate chart visualization</p>
                        <p className="text-xs text-muted-foreground mt-2">Current: {overviewMetrics.churnRate}%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Subscription Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Subscription Distribution</CardTitle>
                  <CardDescription>Breakdown by plan type</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {subscriptionDistribution.map((item) => (
                      <div key={item.plan} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={cn('h-3 w-3 rounded-full', item.color)} />
                            <span className="text-sm font-medium">{item.plan}</span>
                          </div>
                          <span className="text-sm text-muted-foreground">{item.count} ({item.percentage}%)</span>
                        </div>
                        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                          <div className={cn('h-full', item.color)} style={{ width: `${item.percentage}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Alerts Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Alerts & Notifications</CardTitle>
                  <CardDescription>Subscriptions and payments requiring attention</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 rounded-lg border border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20">
                      <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">5 subscriptions expiring soon</p>
                        <p className="text-xs text-muted-foreground">Trial periods ending within 7 days</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
                      <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">3 failed payments requiring attention</p>
                        <p className="text-xs text-muted-foreground">Payment retry needed</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg border border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/20">
                      <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Unusual churn pattern detected</p>
                        <p className="text-xs text-muted-foreground">Churn rate increased 15% this week</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Plans & Features Tab - Implementation continues... */}
            <TabsContent value="plans" className="space-y-4 mt-0">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6">
                <div>
                  <h3 className="text-lg font-semibold">Plans & Features</h3>
                  <p className="text-sm text-muted-foreground">Manage subscription plans and feature assignments</p>
                </div>
                <Button onClick={() => { setSelectedPlan(null); setShowPlanDialog(true); }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Plan
                </Button>
              </div>

              {/* Filters */}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Filter"
                    className="pl-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-48">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Plans Table */}
              <TableContainer id="billing-plans-table" height="lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHeadText className="w-[25%]">Plan Name</TableHeadText>
                      <TableHeadStatus className="hidden sm:table-cell w-36">Status</TableHeadStatus>
                      <TableHeadNumeric className="hidden md:table-cell w-36">Monthly Price</TableHeadNumeric>
                      <TableHeadNumeric className="hidden md:table-cell w-36">Yearly Price</TableHeadNumeric>
                      <TableHeadNumeric className="hidden lg:table-cell w-36">Trial Period</TableHeadNumeric>
                      <TableHeadNumeric className="hidden lg:table-cell w-36">Subscriptions</TableHeadNumeric>
                      <TableHeadAction className="w-28">Actions</TableHeadAction>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPlans.map((plan) => (
                      <TableRow key={plan.id}>
                        <TableCellText className="w-[25%]">
                          <div className="flex flex-col gap-1">
                            <div className="font-medium">{plan.name}</div>
                            <div className="text-xs text-muted-foreground sm:hidden">
                              Status: {plan.status} • ${plan.monthlyPrice}/mo
                            </div>
                          </div>
                        </TableCellText>
                        <TableCellStatus className="hidden sm:table-cell w-36">
                          {getStatusBadge(plan.status)}
                        </TableCellStatus>
                        <TableCellNumeric className="hidden md:table-cell w-36">
                          ${plan.monthlyPrice}/mo
                        </TableCellNumeric>
                        <TableCellNumeric className="hidden md:table-cell w-36">
                          ${plan.yearlyPrice}/yr
                        </TableCellNumeric>
                        <TableCellNumeric className="hidden lg:table-cell w-36">
                          {plan.trialDays} days
                        </TableCellNumeric>
                        <TableCellNumeric className="hidden lg:table-cell w-36">
                          {plan.subscriptionsCount}
                        </TableCellNumeric>
                        <TableCellAction className="w-28">
                          <ActionIconsCell>
                            <Button variant="ghost" size="icon" onClick={() => { setSelectedPlan(plan); setShowPlanDialog(true); }}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <Archive className="h-4 w-4" />
                            </Button>
                          </ActionIconsCell>
                        </TableCellAction>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Feature Management Section */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base">Feature Library</CardTitle>
                      <CardDescription>Toggle which features are included in each plan</CardDescription>
                    </div>
                    <Button onClick={() => setShowAddFeatureDialog(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Feature
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <TableContainer id="billing-features-table" height="md">
                    <Table>
                      <TableColgroup columns={[
                        { width: 'lg' },
                        ...mockPlans.map(() => ({ width: 'md' as const })),
                      ]} />
                      <TableHeader>
                        <TableRow>
                          <TableHead className="sticky left-0 bg-background z-10">Feature</TableHead>
                          {mockPlans.map((plan) => (
                            <TableHeadAction key={plan.id}>{plan.name}</TableHeadAction>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                            {features.map((feature) => (
                          <TableRow key={feature.id}>
                            <TableCell className="sticky left-0 bg-background z-10">
                              <span className="text-sm font-medium">{feature.name}</span>
                            </TableCell>
                            {mockPlans.map((plan) => (
                              <TableCell key={plan.id} className="text-center">
                                <Checkbox
                                  checked={planFeaturesDraft[plan.id]?.has(feature.id) ?? false}
                                  onCheckedChange={() => togglePlanFeature(plan.id, feature.id)}
                                />
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <div className="flex justify-end mt-4">
                    <Button
                      disabled={!hasUnsavedChanges}
                      onClick={() => {
                        // Apply draft to applied
                        const applied: Record<string, Set<string>> = {};
                        for (const [k, v] of Object.entries(planFeaturesDraft)) {
                          applied[k] = new Set(v);
                        }
                        setPlanFeaturesApplied(applied);
                        toast({
                          title: 'Changes saved',
                          description: 'Feature assignments have been updated.'
                        });
                      }}
                    >
                      Save changes
                    </Button>
                  </div>
                </CardContent>
              </Card>

              

              {/* Plans Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Plans Overview</CardTitle>
                  <CardDescription>Quick reference: pricing, trials, annual discounts, and features per plan</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {mockPlans.map((plan) => {
                      const annualUndiscounted = plan.monthlyPrice * 12;
                      const hasAnnual = plan.yearlyPrice > 0;
                      const discount = hasAnnual && annualUndiscounted > 0
                        ? Math.max(0, Math.round(((annualUndiscounted - plan.yearlyPrice) / annualUndiscounted) * 100))
                        : 0;
                      return (
                        <div key={plan.id} className="p-3 border rounded-lg">
                          <div className="min-h-48">
                            <div className="flex items-center justify-between mb-3">
                              <div className="font-medium">{plan.name}</div>
                              <div>
                                {getStatusBadge(plan.status)}
                              </div>
                            </div>
                            <div className="space-y-2 text-sm mb-4">
                              <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Monthly Price</span>
                                <span className="font-medium">${plan.monthlyPrice}{plan.monthlyPrice > 0 ? '/mo' : ''}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Yearly Price</span>
                                <span className="font-medium">${plan.yearlyPrice}{plan.yearlyPrice > 0 ? '/yr' : ''}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Trial Period</span>
                                <span className="font-medium">{plan.trialDays} days</span>
                              </div>
                              {hasAnnual && annualUndiscounted > 0 && (
                                <div className="flex items-center justify-between">
                                  <span className="text-muted-foreground">Annual Discount</span>
                                  <span className="font-medium">{discount}%</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Features</div>
                          <ul className="space-y-2 text-sm">
                            {features
                              .filter((f) => planFeaturesApplied[plan.id]?.has(f.id))
                              .map((f) => (
                                <li key={f.id} className="flex items-center gap-2">
                                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                                  <span>{f.name}</span>
                                </li>
                              ))}
                          </ul>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Subscriptions Tab */}
            <TabsContent value="subscriptions" className="space-y-4 mt-0">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6">
                <div>
                  <h3 className="text-lg font-semibold">Subscriptions</h3>
                  <p className="text-sm text-muted-foreground">Manage subscriptions</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline">
                    <Send className="h-4 w-4 mr-2" />
                    Bulk Email
                  </Button>
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Filter"
                    className="pl-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-48">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="trial">Trial</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="past_due">Past Due</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Subscriptions Table */}
              <TableContainer id="billing-subscriptions-table" height="lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHeadText className="w-[200px]">Organization</TableHeadText>
                      <TableHeadText className="w-[180px]">User</TableHeadText>
                      <TableHeadStatus className="hidden md:table-cell w-[150px]">Status</TableHeadStatus>
                      <TableHeadText className="hidden md:table-cell w-[150px]">Billing Cycle</TableHeadText>
                      <TableHeadText className="hidden lg:table-cell w-[150px]">Next Billing</TableHeadText>
                      <TableHeadAction className="w-[150px]">Actions</TableHeadAction>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSubscriptions.map((subscription) => (
                      <>
                        <TableRow key={subscription.id}>
                          <TableCellText className="w-[200px]">
                            <div className="min-w-0">
                              <div className="flex flex-col gap-2">
                                <p className="text-sm font-medium break-words line-clamp-2">
                                  {subscription.organizationName}
                                </p>
                                <DetailsLink
                                  isExpanded={expandedRows.has(subscription.id)}
                                  onToggle={() => {
                                    setExpandedRows((prev) => {
                                      const next = new Set(prev);
                                      if (next.has(subscription.id)) next.delete(subscription.id); else next.add(subscription.id);
                                      return next;
                                    });
                                  }}
                                />
                              </div>
                            </div>
                          </TableCellText>
                          <TableCellText className="w-[180px]">
                            <UserOrgCell
                              primary={getUserDisplay(subscription.user).primary}
                              secondary={getUserDisplay(subscription.user).secondary}
                              className="min-w-0"
                            />
                          </TableCellText>
                          <TableCellStatus className="hidden md:table-cell w-[150px]">
                            {getStatusBadge(subscription.status)}
                          </TableCellStatus>
                          <TableCellText className="hidden md:table-cell capitalize whitespace-nowrap w-[150px]">{subscription.billingCycle}</TableCellText>
                          <TableCellText className="hidden lg:table-cell whitespace-nowrap w-[150px]">
                            {format(subscription.nextBillingDate, 'MMM dd, yyyy')}
                          </TableCellText>
                          <TableCellAction className="w-[150px]">
                            <ActionIconsCell>
                              <Button variant="ghost" size="icon" onClick={() => { setSelectedSubscription(subscription); setShowSubscriptionDialog(true); }}>
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </ActionIconsCell>
                          </TableCellAction>
                        </TableRow>
                        {expandedRows.has(subscription.id) && (
                          <TableRow>
                            <ExpandedRowCell colSpan={6}>
                              <div className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                  <div>
                                    <h4 className="font-medium mb-2">Plan</h4>
                                    <p className="text-sm text-muted-foreground font-mono">
                                      {(mockPlans.find(p => p.id === subscription.planId)?.name) ?? subscription.planName}
                                    </p>
                                  </div>
                                  <div>
                                    <h4 className="font-medium mb-2">Amount</h4>
                                    <p className="text-sm text-muted-foreground font-mono">${subscription.amount}/mo</p>
                                  </div>
                                </div>
                              </div>
                            </ExpandedRowCell>
                          </TableRow>
                        )}
                      </>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </TabsContent>

            {/* Revenue & Analytics Tab */}
            <TabsContent value="revenue" className="space-y-4 mt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2 !flex-row">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-primary" />
                      <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">${(overviewMetrics.arr / 1000).toFixed(0)}K</div>
                    <p className="text-xs text-muted-foreground mt-1">Annual revenue</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2 !flex-row">
                    <div className="flex items-center gap-2">
                      <PieChart className="h-4 w-4 text-blue-500" />
                      <CardTitle className="text-sm font-medium">Revenue by Plan</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Enterprise</span>
                        <span className="font-medium">$22,455</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Professional</span>
                        <span className="font-medium">$12,672</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Starter</span>
                        <span className="font-medium">$4,524</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2 !flex-row">
                    <div className="flex items-center gap-2">
                      <TrendingDown className="h-4 w-4 text-rose-500" />
                      <CardTitle className="text-sm font-medium">Churn Rate</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{overviewMetrics.churnRate}%</div>
                    <p className="text-xs text-muted-foreground mt-1">Monthly</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2 !flex-row">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      <CardTitle className="text-sm font-medium">Trial Conversion</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">68%</div>
                    <p className="text-xs text-muted-foreground mt-1">Conversion rate</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <CardTitle className="text-base">Revenue Over Time</CardTitle>
                      <CardDescription>Monthly recurring revenue trends</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant={revenueView === 'monthly' ? 'default' : 'outline'}
                        onClick={() => setRevenueView('monthly')}
                        aria-label="Show monthly revenue"
                      >
                        Monthly
                      </Button>
                      <Button
                        size="sm"
                        variant={revenueView === 'yearly' ? 'default' : 'outline'}
                        onClick={() => setRevenueView('yearly')}
                        aria-label="Show yearly revenue"
                      >
                        Yearly
                      </Button>
                      <Button
                        size="sm"
                        variant={revenueView === 'arpu' ? 'default' : 'outline'}
                        onClick={() => setRevenueView('arpu')}
                        aria-label="Show ARPU metric"
                      >
                        ARPU
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center border rounded-lg bg-muted/30">
                    <div className="text-center">
                      <LineChart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Revenue chart visualization</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="p-3 rounded-lg border">
                  <div className="text-xs text-muted-foreground">MRR</div>
                  <div className="text-base md:text-lg font-semibold">${overviewMetrics.mrr.toLocaleString()}</div>
                </div>
                <div className="p-3 rounded-lg border">
                  <div className="text-xs text-muted-foreground">ARR</div>
                  <div className="text-base md:text-lg font-semibold">${overviewMetrics.arr.toLocaleString()}</div>
                </div>
                <div className="p-3 rounded-lg border">
                  <div className="text-xs text-muted-foreground">ARPU</div>
                  <div className="text-base md:text-lg font-semibold">${overviewMetrics.arpu.toLocaleString()}</div>
                </div>
                <div className="p-3 rounded-lg border">
                  <div className="text-xs text-muted-foreground">LTV</div>
                  <div className="text-base md:text-lg font-semibold">${overviewMetrics.ltv.toLocaleString()}</div>
                </div>
                <div className="p-3 rounded-lg border">
                  <div className="text-xs text-muted-foreground">Active Subs</div>
                  <div className="text-base md:text-lg font-semibold">{overviewMetrics.activeSubscriptions.toLocaleString()}</div>
                </div>
                <div className="p-3 rounded-lg border">
                  <div className="text-xs text-muted-foreground">Trial Subs</div>
                  <div className="text-base md:text-lg font-semibold">{overviewMetrics.trialSubscriptions.toLocaleString()}</div>
                </div>
              </div>
            </TabsContent>

            {/* Payments & Invoices Tab */}
            <TabsContent value="payments" className="space-y-4 mt-0">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6">
                <div>
                  <h3 className="text-lg font-semibold">Payments & Invoices</h3>
                  <p className="text-sm text-muted-foreground">Manage payments and invoices</p>
                </div>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Invoice
                </Button>
              </div>

              {/* Filters */}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Filter"
                    className="pl-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-48">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Invoices Table */}
              <TableContainer id="billing-invoices-table" height="lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHeadText className="w-36">Invoice Number</TableHeadText>
                      <TableHeadText className="hidden sm:table-cell w-[25%]">Organization</TableHeadText>
                      <TableHeadNumeric className="hidden md:table-cell w-[105px]">Amount</TableHeadNumeric>
                      <TableHeadStatus className="hidden md:table-cell w-[105px]">Status</TableHeadStatus>
                      <TableHeadText className="hidden lg:table-cell w-[105px]">Due Date</TableHeadText>
                      <TableHeadAction className="w-24">Actions</TableHeadAction>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInvoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCellText className="font-medium w-36">{invoice.number}</TableCellText>
                        <TableCellText className="hidden sm:table-cell w-[25%]">{invoice.organizationName}</TableCellText>
                        <TableCellNumeric className="hidden md:table-cell w-[105px]">${invoice.amount}</TableCellNumeric>
                        <TableCellStatus className="hidden md:table-cell w-[105px]">
                          {getStatusBadge(invoice.status)}
                        </TableCellStatus>
                        <TableCellText className="hidden lg:table-cell w-[105px]">
                          {format(invoice.dueDate, 'MMM dd, yyyy')}
                        </TableCellText>
                        <TableCellAction className="w-24">
                          <ActionIconsCell>
                            <Button variant="ghost" size="icon" onClick={() => { setSelectedInvoice(invoice); setShowInvoiceDialog(true); }}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <Mail className="h-4 w-4" />
                            </Button>
                          </ActionIconsCell>
                        </TableCellAction>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Payment Issues Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Failed Payments</CardTitle>
                  <CardDescription>Payments requiring attention</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="text-sm font-medium">Past Due Corp</p>
                        <p className="text-xs text-muted-foreground">Failure reason: Insufficient funds</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">Retry Payment</Button>
                        <Button variant="outline" size="sm">Update Method</Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Coupons & Promotions Tab */}
            <TabsContent value="coupons" className="space-y-4 mt-0">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6">
                <div>
                  <h3 className="text-lg font-semibold">Coupons & Promotions</h3>
                  <p className="text-sm text-muted-foreground">Manage discount codes and promotions</p>
                </div>
                <Button onClick={() => { setSelectedCoupon(null); setShowCouponDialog(true); }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Coupon
                </Button>
              </div>

              {/* Filters */}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Filter"
                    className="pl-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-48">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Coupons Table */}
              <TableContainer id="billing-coupons-table" height="lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHeadText className="w-[20%]">Code</TableHeadText>
                      <TableHeadText className="hidden sm:table-cell w-36">Discount Type</TableHeadText>
                      <TableHeadNumeric className="hidden md:table-cell w-36">Value</TableHeadNumeric>
                      <TableHeadStatus className="hidden md:table-cell w-36">Status</TableHeadStatus>
                      <TableHeadNumeric className="hidden lg:table-cell w-36">Usage Count</TableHeadNumeric>
                      <TableHeadText className="hidden lg:table-cell w-36">Valid Until</TableHeadText>
                      <TableHeadAction className="w-36">Actions</TableHeadAction>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCoupons.map((coupon) => (
                      <TableRow key={coupon.id}>
                        <TableCellText className="font-mono font-medium w-[20%]">{coupon.code}</TableCellText>
                        <TableCellText className="hidden sm:table-cell capitalize w-36">{coupon.discountType}</TableCellText>
                        <TableCellNumeric className="hidden md:table-cell w-36">
                          {coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `$${coupon.discountValue}`}
                        </TableCellNumeric>
                        <TableCellStatus className="hidden md:table-cell w-36">
                          {getStatusBadge(coupon.status)}
                        </TableCellStatus>
                        <TableCellNumeric className="hidden lg:table-cell w-36">
                          {coupon.usageCount} / {coupon.usageLimit ?? '∞'}
                        </TableCellNumeric>
                        <TableCellText className="hidden lg:table-cell w-36">
                          {format(coupon.validUntil, 'MMM dd, yyyy')}
                        </TableCellText>
                        <TableCellAction className="w-36">
                          <ActionIconsCell>
                            <Button variant="ghost" size="icon" onClick={() => { setSelectedCoupon(coupon); setShowCouponDialog(true); }}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </ActionIconsCell>
                        </TableCellAction>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </TabsContent>

            {/* Organization Billing Tab */}
            <TabsContent value="organizations" className="space-y-4 mt-0">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6">
                <div>
                  <h3 className="text-lg font-semibold">Organization Billing</h3>
                  <p className="text-sm text-muted-foreground">Manage billing for each organization</p>
                </div>
              </div>

              {/* Filters */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search organizations..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Organizations Table */}
              <TableContainer id="billing-organizations-table" height="lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHeadText className="min-w-0">Organization Name</TableHeadText>
                      <TableHeadText className="hidden sm:table-cell w-36">Current Plan</TableHeadText>
                      <TableHeadStatus className="hidden md:table-cell w-36">Status</TableHeadStatus>
                      <TableHeadNumeric className="hidden lg:table-cell w-36">MRR</TableHeadNumeric>
                      <TableHeadText className="hidden md:table-cell w-36">Next Billing</TableHeadText>
                      <TableHeadAction className="w-36">Actions</TableHeadAction>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrganizations.map((org) => (
                      <TableRow key={org.id}>
                        <TableCellText className="min-w-0">
                          <div className="flex flex-col gap-1">
                            <div className="font-medium">{org.name}</div>
                            <div className="text-xs text-muted-foreground sm:hidden">
                              {org.currentPlan} • ${org.mrr}/mo
                            </div>
                          </div>
                        </TableCellText>
                        <TableCellText className="hidden sm:table-cell w-36">{org.currentPlan}</TableCellText>
                        <TableCellStatus className="hidden md:table-cell w-36">
                          {getStatusBadge(org.planStatus)}
                        </TableCellStatus>
                        <TableCellNumeric className="hidden lg:table-cell w-36">${org.mrr}/mo</TableCellNumeric>
                        <TableCellText className="hidden md:table-cell w-36">
                          {format(org.nextBillingDate, 'MMM dd, yyyy')}
                        </TableCellText>
                        <TableCellAction className="w-36">
                          <ActionIconsCell>
                            <Button variant="ghost" size="icon" onClick={() => { setSelectedOrg(org); setShowOrgDialog(true); }}>
                              <Eye className="h-4 w-4" />
                            </Button>
                          </ActionIconsCell>
                        </TableCellAction>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </TabsContent>
          </CardContent>
        </Card>
      </Tabs>

      {/* Dialogs */}
      {/* Plan Dialog */}
      <Dialog open={showPlanDialog} onOpenChange={setShowPlanDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedPlan ? `Edit ${selectedPlan.name}` : 'Create New Plan'}</DialogTitle>
            <DialogDescription>Configure plan details and features</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Plan Name</Label>
                <Input defaultValue={selectedPlan?.name || ''} />
              </div>
              <div className="space-y-2">
                <Label>Slug</Label>
                <Input defaultValue={selectedPlan?.slug || ''} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea defaultValue={selectedPlan?.description || ''} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Monthly Price ($)</Label>
                <Input type="number" defaultValue={selectedPlan?.monthlyPrice || ''} />
              </div>
              <div className="space-y-2">
                <Label>Yearly Price ($)</Label>
                <Input type="number" defaultValue={selectedPlan?.yearlyPrice || ''} />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Active</Label>
                <p className="text-xs text-muted-foreground">Enable this plan</p>
              </div>
              <Switch defaultChecked={selectedPlan?.status === 'active'} />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowPlanDialog(false)}>Cancel</Button>
              <Button>Save Plan</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Subscription Dialog */}
      <Dialog open={showSubscriptionDialog} onOpenChange={setShowSubscriptionDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Subscription Details</DialogTitle>
            <DialogDescription>{selectedSubscription?.organizationName}</DialogDescription>
          </DialogHeader>
          {selectedSubscription && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Plan</Label>
                  <p className="text-sm">{selectedSubscription.planName}</p>
                </div>
                <div>
                  <Label>Status</Label>
                  <div>{getStatusBadge(selectedSubscription.status)}</div>
                </div>
                <div>
                  <Label>Amount</Label>
                  <p className="text-sm">${selectedSubscription.amount}/mo</p>
                </div>
                <div>
                  <Label>Next Billing</Label>
                  <p className="text-sm">{format(selectedSubscription.nextBillingDate, 'MMM dd, yyyy')}</p>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowSubscriptionDialog(false)}>Close</Button>
                <Button>Edit Subscription</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Invoice Dialog */}
      <Dialog open={showInvoiceDialog} onOpenChange={setShowInvoiceDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Invoice Details</DialogTitle>
            <DialogDescription>{selectedInvoice?.number}</DialogDescription>
          </DialogHeader>
          {selectedInvoice && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Organization</Label>
                  <p className="text-sm">{selectedInvoice.organizationName}</p>
                </div>
                <div>
                  <Label>Amount</Label>
                  <p className="text-sm">${selectedInvoice.amount}</p>
                </div>
                <div>
                  <Label>Status</Label>
                  <div>{getStatusBadge(selectedInvoice.status)}</div>
                </div>
                <div>
                  <Label>Due Date</Label>
                  <p className="text-sm">{format(selectedInvoice.dueDate, 'MMM dd, yyyy')}</p>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowInvoiceDialog(false)}>Close</Button>
                <Button>Download PDF</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Coupon Dialog */}
      <Dialog open={showCouponDialog} onOpenChange={setShowCouponDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedCoupon ? `Edit Coupon` : 'Create New Coupon'}</DialogTitle>
            <DialogDescription>Configure coupon details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Coupon Code</Label>
              <Input defaultValue={selectedCoupon?.code || ''} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Discount Type</Label>
                <Select defaultValue={selectedCoupon?.discountType || 'percentage'}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage</SelectItem>
                    <SelectItem value="fixed">Fixed Amount</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Discount Value</Label>
                <Input type="number" defaultValue={selectedCoupon?.discountValue || ''} />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCouponDialog(false)}>Cancel</Button>
              <Button>Save Coupon</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Feature Dialog */}
      <Dialog open={showAddFeatureDialog} onOpenChange={setShowAddFeatureDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Feature</DialogTitle>
            <DialogDescription>Create a feature and include it in plans.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Feature Name</Label>
              <Input value={newFeatureName} onChange={(e) => setNewFeatureName(e.target.value)} placeholder="e.g. SSO" />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={newFeatureCategory} onValueChange={setNewFeatureCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Core">Core</SelectItem>
                  <SelectItem value="Advanced">Advanced</SelectItem>
                  <SelectItem value="Add-ons">Add-ons</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAddFeatureDialog(false)}>Cancel</Button>
              <Button
                onClick={() => {
                  if (!newFeatureName.trim()) return;
                  const newId = `f${Date.now()}`;
                  const newFeature = { id: newId, name: newFeatureName.trim(), category: newFeatureCategory };
                  setFeatures((prev) => [...prev, newFeature]);
                  // Include new features by default in Enterprise
                  const enterprise = mockPlans.find((p) => p.slug === 'enterprise');
                  if (enterprise) {
                    setPlanFeaturesDraft((prev) => {
                      const next = { ...prev };
                      const set = new Set(next[enterprise.id] ?? []);
                      set.add(newId);
                      next[enterprise.id] = set;
                      return next;
                    });
                  }
                  setNewFeatureName('');
                  setNewFeatureCategory('Core');
                  setShowAddFeatureDialog(false);
                }}
              >
                Save Feature
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Organization Dialog */}
      <Dialog open={showOrgDialog} onOpenChange={setShowOrgDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Organization Billing Details</DialogTitle>
            <DialogDescription>{selectedOrg?.name}</DialogDescription>
          </DialogHeader>
          {selectedOrg && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Current Plan</Label>
                  <p className="text-sm">{selectedOrg.currentPlan}</p>
                </div>
                <div>
                  <Label>Status</Label>
                  <div>{getStatusBadge(selectedOrg.planStatus)}</div>
                </div>
                <div>
                  <Label>MRR</Label>
                  <p className="text-sm">${selectedOrg.mrr}/mo</p>
                </div>
                <div>
                  <Label>Next Billing</Label>
                  <p className="text-sm">{format(selectedOrg.nextBillingDate, 'MMM dd, yyyy')}</p>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowOrgDialog(false)}>Close</Button>
                <Button>View Full Details</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

