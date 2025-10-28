'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SwitchAccountModal } from '@/components/modals/SwitchAccountModal';
import { LogoutConfirmModal } from '@/components/modals/LogoutConfirmModal';
import { 
  ChevronLeft,
  ChevronRight,
  Home,
  LayoutDashboard,
  FileText,
  Bell,
  User,
  Settings,
  Repeat,
  LogOut
} from 'lucide-react';

interface DashboardSidebarProps {
  locale?: string;
  displayName?: string;
  username?: string;
  userAvatar?: string;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

const dashboardNavItems = [
  { href: '/dashboard', label: 'Home', icon: Home },
  { href: '/dashboard/module1', label: 'Module 1', icon: LayoutDashboard },
  { href: '/dashboard/module2', label: 'Module 2', icon: LayoutDashboard },
  { href: '/dashboard/module3', label: 'Module 3', icon: LayoutDashboard },
];

export function DashboardSidebar({ 
  locale = 'en',
  displayName = 'User',
  username = 'username',
  userAvatar,
  isCollapsed = false, 
  onToggleCollapse
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const [isSwitchAccountOpen, setIsSwitchAccountOpen] = useState(false);
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);

  return (
    <aside 
      className="h-screen sticky top-0 flex flex-col transition-all duration-300 bg-background border-r"
      style={{
        width: isCollapsed ? '80px' : '280px',
      }}
    >
      <div className="flex-1 flex flex-col p-3">
        {/* Profile Section at Top */}
        <div className="mb-2 px-3">
          <div className="flex items-center justify-between">
            <Link
              href={`/${locale}/dashboard/profile`}
              className={cn(
                "flex items-center rounded-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-all",
                isCollapsed ? "justify-center px-3 py-3 w-full" : "gap-3 px-3 py-3 flex-1"
              )}
            >
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarImage src={userAvatar} alt={displayName} />
                <AvatarFallback>
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              {!isCollapsed && (
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-medium truncate">{displayName}</span>
                  <span className="text-xs text-muted-foreground truncate">@{username}</span>
                </div>
              )}
            </Link>
            
            {onToggleCollapse && !isCollapsed && (
              <button
                onClick={onToggleCollapse}
                className="flex-shrink-0 flex items-center justify-center rounded-lg px-3 h-14 hover:bg-accent transition-all"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            )}
          </div>
          
          {onToggleCollapse && isCollapsed && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleCollapse}
              className="mt-2 w-full"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {dashboardNavItems.map((item) => {
            // For home route, only match exact path, for others allow sub-paths
            const isActive = item.href === '/dashboard' 
              ? pathname === `/${locale}${item.href}`
              : pathname === `/${locale}${item.href}` || pathname.startsWith(`/${locale}${item.href}/`);
            const Icon = item.icon;
            
            return (
              <Link
                key={item.href}
                href={`/${locale}${item.href}`}
                className={cn(
                  "flex items-center rounded-lg transition-all duration-200",
                  isCollapsed ? "justify-center px-3 py-3" : "gap-3 px-3 py-3",
                  isActive
                    ? "bg-accent text-accent-foreground border border-border"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                )}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                {!isCollapsed && (
                  <span className="text-sm font-medium">{item.label}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Links */}
        <div className="px-3 mt-auto space-y-1 pt-4 border-t">
          <Link
            href={`/${locale}/dashboard/settings`}
            className={cn(
              "flex items-center rounded-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-all",
              isCollapsed ? "justify-center px-3 py-3" : "gap-3 px-3 py-3"
            )}
          >
            <Settings className="h-4 w-4 flex-shrink-0" />
            {!isCollapsed && (
              <span className="text-sm font-medium">Settings</span>
            )}
          </Link>
          
          <button 
            onClick={() => setIsSwitchAccountOpen(true)}
            className={cn(
              "w-full flex items-center rounded-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-all",
              isCollapsed ? "justify-center px-3 py-3" : "gap-3 px-3 py-3"
            )}
          >
            <Repeat className="h-4 w-4 flex-shrink-0" />
            {!isCollapsed && (
              <span className="text-sm font-medium">Switch Account</span>
            )}
          </button>
          
          <button 
            onClick={() => setIsLogoutOpen(true)}
            className={cn(
              "w-full flex items-center rounded-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-all",
              isCollapsed ? "justify-center px-3 py-3" : "gap-3 px-3 py-3"
            )}
          >
            <LogOut className="h-4 w-4 flex-shrink-0" />
            {!isCollapsed && (
              <span className="text-sm font-medium">Logout</span>
            )}
          </button>
        </div>
      </div>

      {/* Modals */}
      <SwitchAccountModal 
        isOpen={isSwitchAccountOpen} 
        onClose={() => setIsSwitchAccountOpen(false)} 
      />
      <LogoutConfirmModal 
        isOpen={isLogoutOpen} 
        onClose={() => setIsLogoutOpen(false)}
        locale={locale}
      />
    </aside>
  );
}

