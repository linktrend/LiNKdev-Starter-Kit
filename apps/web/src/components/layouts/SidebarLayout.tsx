'use client';

import React, { PropsWithChildren, useState } from 'react';
import { cn } from '@/lib/utils';

interface SidebarLayoutProps extends PropsWithChildren {
  sidebarComponent: React.ReactNode;
  topbarComponent: React.ReactNode;
}

export function SidebarLayout({ children, sidebarComponent, topbarComponent }: SidebarLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleToggle = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className="flex min-h-screen w-full">
      {/* Sidebar */}
      <div className="hidden lg:block">
        {React.cloneElement(sidebarComponent as React.ReactElement, {
          isCollapsed,
          onToggle: handleToggle,
        })}
      </div>

      {/* Main Content Area */}
      <div className={cn(
        "flex flex-col flex-1",
        isCollapsed ? "lg:pl-20" : "lg:pl-64"
      )}>
        {/* Topbar */}
        {React.cloneElement(topbarComponent as React.ReactElement, {
          isCollapsed,
        })}

        {/* Main Content */}
        <main className="flex-1 p-4 sm:px-6 sm:py-4">
          {children}
        </main>
      </div>
    </div>
  );
}
