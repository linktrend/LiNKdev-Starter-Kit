import { Metadata } from 'next';
import { requireAdmin } from '@/lib/auth/server';
import { AnalyticsPageClient } from './AnalyticsPageClient';

export const metadata: Metadata = {
  title: 'Console - Analytics',
};

export default async function ConsoleAnalyticsPage() {
  await requireAdmin();

  return <AnalyticsPageClient />;
}
