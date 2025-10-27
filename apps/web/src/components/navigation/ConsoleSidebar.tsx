'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  HeartPulse,
  Bug,
  Database,
  Key,
  Settings2,
  BriefcaseBusiness,
  Workflow,
  Shield,
  Flag,
  Settings,
  Repeat,
  User,
  LogOut
} from 'lucide-react';

interface ConsoleSidebarProps {
  locale?: string;
  userName?: string;
  userAvatar?: string;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

const consoleNavItems = [
  { href: '/console', label: 'Overview', icon: LayoutDashboard },
  { href: '/console/health', label: 'Health Checks', icon: HeartPulse },
  { href: '/console/errors', label: 'Errors & Logs', icon: Bug },
  { href: '/console/database', label: 'Database', icon: Database },
  { href: '/console/api-keys', label: 'API & Keys', icon: Key },
  { href: '/console/config', label: 'Configuration', icon: Settings2 },
  { href: '/console/jobs', label: 'Jobs/Queue', icon: BriefcaseBusiness },
  { href: '/console/automations', label: 'Automations', icon: Workflow },
  { href: '/console/security', label: 'Security & Access', icon: Shield },
  { href: '/console/flags', label: 'Flags', icon: Flag },
];

export function ConsoleSidebar({ 
  locale = 'en',
  userName = 'Admin User',
  userAvatar,
  isCollapsed = false, 
  onToggleCollapse
}: ConsoleSidebarProps) {
  const pathname = usePathname();

  return (
    <aside 
      className="h-screen sticky top-0 flex flex-col transition-all duration-300 bg-background border-r"
      style={{
        width: isCollapsed ? '80px' : '280px',
      }}
    >
      <div className="flex-1 flex flex-col p-3">
        {/* Profile Section at Top */}
        <div className="mb-2">
          <div className="flex items-center gap-2">
            <Link
              href={`/${locale}/console/profile`}
              className="flex-1 flex items-center gap-3 px-3 py-3 rounded-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-all"
            >
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarImage src={userAvatar} alt={userName} />
                <AvatarFallback>
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              {!isCollapsed && (
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-medium truncate">{userName}</span>
                  <span className="text-xs text-muted-foreground truncate">Console Admin</span>
                </div>
              )}
            </Link>
            
            {onToggleCollapse && !isCollapsed && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggleCollapse}
                className="flex-shrink-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
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
          {consoleNavItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            const Icon = item.icon;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200",
                  isActive
                    ? "bg-accent text-accent-foreground border border-border"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                )}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
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
            href={`/${locale}/console/settings`}
            className="flex items-center gap-3 px-3 py-3 rounded-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-all"
          >
            <Settings className="h-5 w-5" />
            {!isCollapsed && (
              <span className="text-sm font-medium">Settings</span>
            )}
          </Link>
          
          <button className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-all">
            <Repeat className="h-5 w-5" />
            {!isCollapsed && (
              <span className="text-sm font-medium">Switch Account</span>
            )}
          </button>
          
          <button className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-all">
            <LogOut className="h-5 w-5" />
            {!isCollapsed && (
              <span className="text-sm font-medium">Logout</span>
            )}
          </button>
        </div>
      </div>
    </aside>
  );
}
