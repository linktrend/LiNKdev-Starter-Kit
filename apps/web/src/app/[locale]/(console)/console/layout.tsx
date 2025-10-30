'use client';

import { useState, PropsWithChildren } from 'react';
import { usePathname, useParams } from 'next/navigation';
import { ConsoleSidebar } from '@/components/navigation/ConsoleSidebar';
import { ConsoleTopbar } from '@/components/navigation/ConsoleTopbar';

const getScreenName = (pathname: string): string => {
  // Handle nested config routes first (most specific)
  if (pathname.includes('/console/config/application/deployment')) return 'Configuration > Application > Deployment';
  if (pathname.includes('/console/config/application/jobs')) return 'Configuration > Application > Jobs/Queue';
  if (pathname.includes('/console/config/application/feature-flags')) return 'Configuration > Application > Feature Flags';
  if (pathname.includes('/console/config/application/settings')) return 'Configuration > Application > Settings';
  if (pathname.includes('/console/config/application')) return 'Configuration > Application';
  if (pathname.includes('/console/config/integrations')) return 'Configuration > Integrations';
  if (pathname.includes('/console/config/automations')) return 'Configuration > Automations';
  if (pathname.includes('/console/config/api-keys')) return 'Configuration > External API';
  if (pathname.includes('/console/config/system')) return 'Configuration > System';
  if (pathname.includes('/console/config/environment')) return 'Configuration > Environment';
  if (pathname.includes('/console/config')) return 'Configuration';
  
  // Other console routes
  if (pathname.includes('/console/security')) return 'Security & Access';
  if (pathname.includes('/console/reports')) return 'Reports';
  if (pathname.includes('/console/billing')) return 'Billing & Subscriptions';
  if (pathname.includes('/console/errors')) return 'Errors & Logs';
  if (pathname.includes('/console/database')) return 'Database';
  if (pathname.includes('/console/health')) return 'Health Checks';
  if (pathname.includes('/console/overview') || pathname === '/console' || pathname.endsWith('/console')) return 'Overview';
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

  const sidebarWidth = isSidebarCollapsed ? 80 : 280;

  return (
    <div className="flex min-h-screen">
      <ConsoleSidebar 
        locale={locale} 
        displayName="Sarah Johnson"
        username="sarah.admin"
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      <div 
        className="flex flex-col min-w-0"
        style={{
          marginLeft: `${sidebarWidth}px`,
          width: `calc(100vw - ${sidebarWidth}px)`,
        }}
      >
        <ConsoleTopbar locale={locale} screenName={screenName} />
        <main className="flex-1 p-8 min-w-0 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
