export type TrendDirection = 'up' | 'down';

export interface KpiStat {
  id: string;
  label: string;
  value: string;
  delta: string;
  trend: TrendDirection;
  description: string;
  sparkline: number[];
  periodLabel: string;
}

export interface HealthCheck {
  id: string;
  label: string;
  status: 'pass' | 'warn' | 'fail';
  lastProbe: string;
}

export interface DatabaseStatus {
  latencyMs: number;
  successRate: number;
  storageUsedGb: number;
  storageTotalGb: number;
  replicationLagMs: number;
}

export interface ApiStatus {
  requestsPerSecond: number;
  successRatio: number;
  p95LatencyMs: number;
}

export interface ErrorItem {
  id: string;
  timestamp: string;
  service: string;
  severity: 'critical' | 'warning' | 'info';
  message: string;
  link: string;
}

export interface SecuritySnapshot {
  signups7d: number;
  signupTrend: TrendDirection;
  sessionsActive: number;
  accessAlerts: {
    failedLogins: number;
    newAdminInvites: number;
    mfaCoverage: number;
  };
}

export interface BillingSnapshot {
  mrr: number;
  arr: number;
  churnRate: number;
  trialConversions: number;
  failedPayments: number;
  currency: string;
}

export interface OverviewMockData {
  kpis: KpiStat[];
  healthChecks: HealthCheck[];
  database: DatabaseStatus;
  api: ApiStatus;
  errors: ErrorItem[];
  security: SecuritySnapshot;
  billing: BillingSnapshot;
}

export const overviewMockData: OverviewMockData = {
  kpis: [
    {
      id: 'active-users',
      label: 'Active Users',
      value: '12,842',
      delta: '+8.4%',
      trend: 'up',
      description: 'Active users in the last 24 hours',
      sparkline: [6, 8, 9, 10, 11, 11.5, 12.8],
      periodLabel: '24h',
    },
    {
      id: 'uptime',
      label: 'System Uptime',
      value: '99.98%',
      delta: '+0.02%',
      trend: 'up',
      description: 'Rolling 30 day uptime',
      sparkline: [99.92, 99.9, 99.91, 99.94, 99.95, 99.97, 99.98],
      periodLabel: '30d',
    },
    {
      id: 'api-response',
      label: 'API Response Time',
      value: '182 ms',
      delta: '-12 ms',
      trend: 'down',
      description: 'Average response time',
      sparkline: [240, 220, 210, 205, 198, 190, 182],
      periodLabel: 'avg',
    },
    {
      id: 'error-rate',
      label: 'Error Rate',
      value: '0.42%',
      delta: '-0.11%',
      trend: 'down',
      description: 'Errors in the last 24 hours',
      sparkline: [0.9, 0.8, 0.7, 0.6, 0.55, 0.48, 0.42],
      periodLabel: '24h',
    },
    {
      id: 'mrr',
      label: 'MRR',
      value: '$248K',
      delta: '+4.7%',
      trend: 'up',
      description: 'Current month MRR',
      sparkline: [180, 190, 205, 215, 225, 235, 248],
      periodLabel: 'MTD',
    },
  ],
  healthChecks: [
    { id: 'auth', label: 'Auth Service', status: 'pass', lastProbe: '2m ago' },
    { id: 'db', label: 'Database', status: 'pass', lastProbe: '2m ago' },
    { id: 'api', label: 'Public API', status: 'warn', lastProbe: '57s ago' },
    { id: 'cdn', label: 'CDN', status: 'pass', lastProbe: '1m ago' },
  ],
  database: {
    latencyMs: 12,
    successRate: 99.91,
    storageUsedGb: 428,
    storageTotalGb: 1024,
    replicationLagMs: 240,
  },
  api: {
    requestsPerSecond: 312,
    successRatio: 99.4,
    p95LatencyMs: 284,
  },
  errors: [
    {
      id: 'err-001',
      timestamp: '2025-01-28T14:42:10Z',
      service: 'Billing API',
      severity: 'critical',
      message: 'Stripe charge request failed for customer cus_9f8df',
      link: '/en/console/errors?service=billing',
    },
    {
      id: 'err-002',
      timestamp: '2025-01-28T14:37:02Z',
      service: 'Webhook Processor',
      severity: 'warning',
      message: 'Delivery to https://hook.example.com timed out',
      link: '/en/console/errors?service=webhooks',
    },
    {
      id: 'err-003',
      timestamp: '2025-01-28T14:20:18Z',
      service: 'Notification Worker',
      severity: 'warning',
      message: 'Retry limit reached for message queue job 89213',
      link: '/en/console/errors?service=notifications',
    },
    {
      id: 'err-004',
      timestamp: '2025-01-28T13:58:40Z',
      service: 'Realtime API',
      severity: 'critical',
      message: 'Websocket shard #7 degraded (latency > 1s)',
      link: '/en/console/errors?service=realtime',
    },
    {
      id: 'err-005',
      timestamp: '2025-01-28T13:35:55Z',
      service: 'Feature Flags',
      severity: 'info',
      message: 'Feature rollout paused for experiment exp-a12',
      link: '/en/console/errors?service=flags',
    },
  ],
  security: {
    signups7d: 642,
    signupTrend: 'up',
    sessionsActive: 1284,
    accessAlerts: {
      failedLogins: 32,
      newAdminInvites: 5,
      mfaCoverage: 87,
    },
  },
  billing: {
    mrr: 248000,
    arr: 2976000,
    churnRate: 1.8,
    trialConversions: 43,
    failedPayments: 9,
    currency: 'USD',
  },
};
