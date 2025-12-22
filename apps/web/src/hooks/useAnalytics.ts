'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  getAnalyticsSummary, 
  getApiMetrics, 
  getUserMetrics, 
  getFeatureMetrics,
  exportAnalytics,
  type AnalyticsSummary,
  type ApiMetric,
  type UserMetric,
  type FeatureMetric,
  type DateRange
} from '@/app/actions/analytics';
import { PRESETS } from '@/lib/analytics/formatters';

export function useAnalytics(orgId?: string) {
  const [dateRange, setDateRange] = useState<DateRange>(PRESETS.LAST_30_DAYS.getRange());
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [apiMetrics, setApiMetrics] = useState<ApiMetric[]>([]);
  const [userMetrics, setUserMetrics] = useState<UserMetric[]>([]);
  const [featureMetrics, setFeatureMetrics] = useState<FeatureMetric[]>([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [summaryData, apiData, userData, featureData] = await Promise.all([
        getAnalyticsSummary(orgId, dateRange),
        getApiMetrics(orgId, dateRange),
        getUserMetrics(orgId, dateRange),
        getFeatureMetrics(orgId, dateRange),
      ]);

      setSummary(summaryData);
      setApiMetrics(apiData);
      setUserMetrics(userData);
      setFeatureMetrics(featureData);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  }, [orgId, dateRange]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleExport = async (format: 'csv' | 'json') => {
    try {
      const data = await exportAnalytics(orgId, dateRange, format);
      // Trigger download
      const blob = new Blob([data], { type: format === 'json' ? 'application/json' : 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-${orgId || 'platform'}-${new Date().toISOString()}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Failed to export analytics:', error);
    }
  };

  return {
    dateRange,
    setDateRange,
    loading,
    summary,
    apiMetrics,
    userMetrics,
    featureMetrics,
    refresh: fetchData,
    exportData: handleExport,
  };
}
