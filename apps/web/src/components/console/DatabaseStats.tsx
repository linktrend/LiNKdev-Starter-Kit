'use client';

/**
 * Database Statistics Dashboard Component
 * Displays real-time database metrics and performance indicators
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Database, TableIcon, TrendingUp, HardDrive, Activity, Zap } from 'lucide-react';
import type { DatabaseStats } from '@/lib/database/stats';

interface DatabaseStatsDashboardProps {
  stats: DatabaseStats;
  totalRows?: number;
}

export function DatabaseStatsDashboard({ stats, totalRows = 0 }: DatabaseStatsDashboardProps) {
  const isOnline = stats.status === 'online';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {/* Database Status */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 !flex-row">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-primary flex-shrink-0" />
            <CardTitle className="text-sm font-medium">Database Status</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div
            className={`text-2xl font-bold ${
              isOnline ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            }`}
          >
            {isOnline ? 'Online' : 'Offline'}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {isOnline ? 'All systems operational' : 'Connection unavailable'}
          </p>
        </CardContent>
      </Card>

      {/* Total Tables */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 !flex-row">
          <div className="flex items-center gap-2">
            <TableIcon className="h-4 w-4 text-primary flex-shrink-0" />
            <CardTitle className="text-sm font-medium">Total Tables</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalTables}</div>
          <p className="text-xs text-muted-foreground mt-1">Active tables</p>
        </CardContent>
      </Card>

      {/* Total Rows */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 !flex-row">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary flex-shrink-0" />
            <CardTitle className="text-sm font-medium">Total Rows</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalRows.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground mt-1">Across all tables</p>
        </CardContent>
      </Card>

      {/* Database Size */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 !flex-row">
          <div className="flex items-center gap-2">
            <HardDrive className="h-4 w-4 text-primary flex-shrink-0" />
            <CardTitle className="text-sm font-medium">Database Size</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.databaseSize}</div>
          <p className="text-xs text-muted-foreground mt-1">Total storage used</p>
        </CardContent>
      </Card>

      {/* Active Connections */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 !flex-row">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary flex-shrink-0" />
            <CardTitle className="text-sm font-medium">Active Connections</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.activeConnections}</div>
          <p className="text-xs text-muted-foreground mt-1">Current database connections</p>
        </CardContent>
      </Card>

      {/* Cache Hit Ratio */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 !flex-row">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary flex-shrink-0" />
            <CardTitle className="text-sm font-medium">Cache Hit Ratio</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.cacheHitRatio ? `${stats.cacheHitRatio.toFixed(1)}%` : 'N/A'}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {stats.cacheHitRatio > 90 ? 'Excellent performance' : 'Cache performance'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
