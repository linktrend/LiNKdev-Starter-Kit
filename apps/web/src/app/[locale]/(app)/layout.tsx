'use client';

import { useState, PropsWithChildren } from 'react';
import { useParams } from 'next/navigation';
import { Sidebar } from '@/components/navigation/Sidebar';
import { Topbar } from '@/components/navigation/Topbar';

export default function AppLayout({ children }: PropsWithChildren) {
  const params = useParams();
  const locale = params.locale as string || 'en';
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen">
      <Sidebar 
        locale={locale} 
        userName="John Doe"
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      <div className="flex-1 flex flex-col">
        <Topbar locale={locale} screenName="Dashboard" />
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
