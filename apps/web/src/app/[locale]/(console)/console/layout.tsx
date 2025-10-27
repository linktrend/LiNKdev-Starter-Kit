'use client';

import { useState, PropsWithChildren } from 'react';
import { usePathname, useParams } from 'next/navigation';
import { ConsoleSidebar } from '@/components/navigation/ConsoleSidebar';
import { ConsoleTopbar } from '@/components/navigation/ConsoleTopbar';

const getScreenName = (pathname: string): string => {
  if (pathname.includes('/console/overview')) return 'Overview';
  if (pathname.includes('/console/health')) return 'Health Checks';
  if (pathname.includes('/console/errors')) return 'Errors & Logs';
  if (pathname.includes('/console/database')) return 'Database';
  if (pathname.includes('/console/api-keys')) return 'API & Keys';
  if (pathname.includes('/console/config')) return 'Configuration';
  if (pathname.includes('/console/jobs')) return 'Jobs/Queue';
  if (pathname.includes('/console/automations')) return 'Automations';
  if (pathname.includes('/console/security')) return 'Security & Access';
  if (pathname.includes('/console/flags')) return 'Flags';
  if (pathname.includes('/console/settings')) return 'Settings';
  if (pathname.includes('/console/profile')) return 'Profile';
  return 'Overview';
};

export default function ConsoleLayout({ children }: PropsWithChildren) {
  const pathname = usePathname();
  const params = useParams();
  const locale = params.locale as string || 'en';
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const screenName = getScreenName(pathname);

  // Don't show sidebar/topbar on login page
  if (pathname?.includes('/console/login')) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen">
      <ConsoleSidebar 
        locale={locale} 
        userName="Admin User"
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      <div className="flex-1 flex flex-col">
        <ConsoleTopbar locale={locale} screenName={screenName} />
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
