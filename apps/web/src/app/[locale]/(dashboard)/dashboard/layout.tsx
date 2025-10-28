'use client';

import { useState, useEffect, PropsWithChildren } from 'react';
import { usePathname, useParams, useSearchParams } from 'next/navigation';
import { DashboardSidebar } from '@/components/navigation/DashboardSidebar';
import { DashboardTopbar } from '@/components/navigation/DashboardTopbar';

const getScreenName = (pathname: string, searchParams: URLSearchParams): string => {
  if (pathname.includes('/help')) return 'Help Center';
  if (pathname.includes('/profile')) return 'Profile';
  if (pathname.includes('/settings')) {
    const tab = searchParams.get('tab');
    if (tab) {
      // Format tab names nicely
      const tabNames: Record<string, string> = {
        'account': 'Account',
        'security': 'Security',
        'preferences': 'Preferences',
        'data': 'Data & Integrations',
      };
      return `Settings: ${tabNames[tab] || tab}`;
    }
    return 'Settings: Account'; // Default to Account tab
  }
  if (pathname.includes('/dashboard')) return 'Home';
  return 'Home';
};

export default function DashboardLayout({ children }: PropsWithChildren) {
  const pathname = usePathname();
  const params = useParams();
  const searchParams = useSearchParams();
  const locale = params.locale as string || 'en';
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [screenName, setScreenName] = useState('Home');
  
  useEffect(() => {
    setScreenName(getScreenName(pathname, searchParams));
  }, [pathname, searchParams]);

  return (
    <div className="flex min-h-screen">
      <DashboardSidebar 
        locale={locale} 
        displayName="John Doe"
        username="johndoe167"
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      <div className="flex-1 flex flex-col">
        <DashboardTopbar locale={locale} screenName={screenName} />
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
