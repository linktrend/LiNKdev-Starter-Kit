'use client';

import { useState, type PropsWithChildren } from 'react';
import { usePathname, useParams } from 'next/navigation';
import { ConsoleSidebar } from '@/components/navigation/ConsoleSidebar';
import { ConsoleTopbar } from '@/components/navigation/ConsoleTopbar';
import { OrgProvider, useOrg } from '@/contexts/OrgContext';
import { OrgSwitcher } from '@/components/console/OrgSwitcher';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';

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

function ConsoleLayoutShell({
  children,
  pathname,
  locale,
}: PropsWithChildren<{ pathname: string; locale: string }>) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const screenName = getScreenName(pathname);
  const { isLoading, currentOrgId, refresh, organizations } = useOrg();

  const sidebarWidth = isSidebarCollapsed ? 80 : 280;

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex h-full items-center justify-center py-12">
          <div className="flex items-center gap-3 text-muted-foreground">
            <Spinner />
            <span>Loading organizations…</span>
          </div>
        </div>
      );
    }

    if (!currentOrgId) {
      return (
        <div className="flex h-full flex-col items-center justify-center gap-3 py-12 text-center">
          <p className="text-lg font-semibold">No organizations available</p>
          <p className="text-sm text-muted-foreground">
            You are not a member of any organizations yet.
          </p>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => refresh()}>
              Retry
            </Button>
            {organizations.length === 0 && (
              <span className="text-xs text-muted-foreground">
                Contact an admin to be added to an organization.
              </span>
            )}
          </div>
        </div>
      );
    }

    return children;
  };

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
        <ConsoleTopbar locale={locale} screenName={screenName} orgSwitcher={<OrgSwitcher />} />
        <main className="flex-1 p-8 min-w-0 overflow-y-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

export default function ConsoleLayoutClient({ children }: PropsWithChildren) {
  const pathname = usePathname() || '/';
  const params = useParams();
  const locale = (params.locale as string) || 'en';

  if (pathname?.includes('/console/login')) {
    return <>{children}</>;
  }

  return (
    <OrgProvider>
      <ConsoleLayoutShell pathname={pathname} locale={locale}>
        {children}
      </ConsoleLayoutShell>
    </OrgProvider>
  );
}
