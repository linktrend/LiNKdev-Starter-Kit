'use client';

import React, { useState, useEffect } from 'react';
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
  ChevronDown,
  LayoutDashboard,
  HeartPulse,
  Bug,
  Database,
  Key,
  Settings2,
  BriefcaseBusiness,
  Workflow,
  Shield,
  Settings,
  Repeat,
  User,
  LogOut,
  FileText,
  AppWindow,
  Flag,
  Clock,
  Rocket,
  Globe,
  Cpu,
  Plug
} from 'lucide-react';

interface ConsoleSidebarProps {
  locale?: string;
  displayName?: string;
  username?: string;
  userAvatar?: string;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  children?: NavItem[];
}

const consoleNavItems: NavItem[] = [
  { href: '/console', label: 'Overview', icon: LayoutDashboard, path: '/console' },
  { href: '/console/health', label: 'Health Checks', icon: HeartPulse, path: '/console/health' },
  { href: '/console/database', label: 'Database', icon: Database, path: '/console/database' },
  { href: '/console/errors', label: 'Errors & Logs', icon: Bug, path: '/console/errors' },
  { href: '/console/reports', label: 'Reports', icon: FileText, path: '/console/reports' },
  { href: '/console/security', label: 'Security & Access', icon: Shield, path: '/console/security' },
  {
    href: '/console/config',
    label: 'Configuration',
    icon: Settings2,
    path: '/console/config',
    children: [
      {
        href: '/console/config/application',
        label: 'Application',
        icon: AppWindow,
        path: '/console/config/application',
        children: [
          { href: '/console/config/application/settings', label: 'Settings', icon: Settings, path: '/console/config/application/settings' },
          { href: '/console/config/application/feature-flags', label: 'Feature Flags', icon: Flag, path: '/console/config/application/feature-flags' },
          { href: '/console/config/application/jobs', label: 'Jobs/Queue', icon: Clock, path: '/console/config/application/jobs' },
          { href: '/console/config/application/deployment', label: 'Deployment', icon: Rocket, path: '/console/config/application/deployment' },
        ]
      },
      { href: '/console/config/environment', label: 'Environment', icon: Globe, path: '/console/config/environment' },
      { href: '/console/config/system', label: 'System', icon: Cpu, path: '/console/config/system' },
      { href: '/console/config/api-keys', label: 'External API & Keys', icon: Key, path: '/console/config/api-keys' },
      { href: '/console/config/automations', label: 'Automations', icon: Workflow, path: '/console/config/automations' },
      { href: '/console/config/integrations', label: 'Integrations', icon: Plug, path: '/console/config/integrations' },
    ]
  },
];

export function ConsoleSidebar({ 
  locale = 'en',
  displayName = 'Admin User',
  username = 'admin',
  userAvatar,
  isCollapsed = false, 
  onToggleCollapse
}: ConsoleSidebarProps) {
  const pathname = usePathname();
  const [isSwitchAccountOpen, setIsSwitchAccountOpen] = useState(false);
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  // Auto-expand Configuration if on any config route
  useEffect(() => {
    if (pathname.includes('/console/config')) {
      setExpandedItems(prev => new Set([...Array.from(prev), '/console/config']));
      if (pathname.includes('/console/config/application')) {
        setExpandedItems(prev => new Set([...Array.from(prev), '/console/config/application']));
      }
    }
  }, [pathname]);

  const toggleExpand = (path: string) => {
    setExpandedItems(prev => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  const isItemActive = (item: NavItem): boolean => {
    if (item.path === '/console') {
      return pathname === `/${locale}${item.path}`;
    }
    const isActive = pathname === `/${locale}${item.path}` || pathname.startsWith(`/${locale}${item.path}/`);
    if (isActive) return true;
    // Check if any child is active
    if (item.children) {
      return item.children.some(child => isItemActive(child));
    }
    return false;
  };

  const renderNavItem = (item: NavItem, level: number = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.has(item.path);
    const isActive = isItemActive(item);
    const Icon = item.icon;

    if (hasChildren && !isCollapsed) {
      return (
        <div key={item.path}>
          <button
            onClick={() => toggleExpand(item.path)}
            className={cn(
              "w-full flex items-center rounded-lg transition-all duration-200 px-3 py-3 gap-3",
              isActive
                ? "bg-accent text-accent-foreground border border-border"
                : "text-muted-foreground hover:text-foreground hover:bg-accent"
            )}
          >
            <Icon className="h-4 w-4 flex-shrink-0" />
            <span className="text-sm font-medium whitespace-nowrap flex-1 text-left">{item.label}</span>
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 flex-shrink-0 transition-transform duration-200" />
            ) : (
              <ChevronRight className="h-4 w-4 flex-shrink-0 transition-transform duration-200" />
            )}
          </button>
          {isExpanded && (
            <div className={cn("mt-1 space-y-1", level > 0 && "ml-4")}>
              {item.children?.map(child => renderNavItem(child, level + 1))}
            </div>
          )}
        </div>
      );
    }

    // For collapsed sidebar or items without children, render as link
    if (!hasChildren || isCollapsed) {
      return (
        <Link
          key={item.path}
          href={`/${locale}${item.path}`}
          className={cn(
            "flex items-center rounded-lg transition-all duration-200 px-3 py-3",
            isCollapsed ? "justify-center" : level > 0 ? "gap-3 ml-4" : "gap-3",
            isActive
              ? "bg-accent text-accent-foreground border border-border"
              : "text-muted-foreground hover:text-foreground hover:bg-accent"
          )}
          title={isCollapsed ? item.label : undefined}
        >
          <Icon className="h-4 w-4 flex-shrink-0" />
          {!isCollapsed && (
            <span className="text-sm font-medium whitespace-nowrap">{item.label}</span>
          )}
        </Link>
      );
    }

    return null;
  };

  return (
    <aside 
      className="fixed left-0 top-0 h-screen flex flex-col flex-shrink-0 transition-all duration-300 bg-background border-r z-10"
      style={{
        width: isCollapsed ? '80px' : '280px',
        minWidth: isCollapsed ? '80px' : '280px',
        maxWidth: isCollapsed ? '80px' : '280px',
      }}
    >
      <div className="flex-1 flex flex-col p-3">
        {/* Profile Section at Top */}
        <div className="mb-2 px-3">
          <div className="flex items-center justify-between">
            <Link
              href={`/${locale}/console/profile`}
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
          {consoleNavItems.map((item) => renderNavItem(item))}
        </nav>

        {/* Bottom Links */}
        <div className="px-3 mt-auto space-y-1 pt-4 border-t">
          <Link
            href={`/${locale}/console/settings`}
            className={cn(
              "flex items-center rounded-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-all px-3 py-3",
              isCollapsed ? "justify-center" : "gap-3"
            )}
          >
            <Settings className="h-4 w-4 flex-shrink-0" />
            {!isCollapsed && (
              <span className="text-sm font-medium whitespace-nowrap">Settings</span>
            )}
          </Link>
          
          <button 
            onClick={() => setIsSwitchAccountOpen(true)}
            className={cn(
              "w-full flex items-center rounded-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-all px-3 py-3",
              isCollapsed ? "justify-center" : "gap-3"
            )}
          >
            <Repeat className="h-4 w-4 flex-shrink-0" />
            {!isCollapsed && (
              <span className="text-sm font-medium whitespace-nowrap">Switch Account</span>
            )}
          </button>
          
          <button 
            onClick={() => setIsLogoutOpen(true)}
            className={cn(
              "w-full flex items-center rounded-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-all px-3 py-3",
              isCollapsed ? "justify-center" : "gap-3"
            )}
          >
            <LogOut className="h-4 w-4 flex-shrink-0" />
            {!isCollapsed && (
              <span className="text-sm font-medium whitespace-nowrap">Logout</span>
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
