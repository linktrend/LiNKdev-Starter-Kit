'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@starter/ui';
import { Avatar, AvatarFallback, AvatarImage } from '@starter/ui';
import { 
  ChevronLeft, 
  LayoutGrid, 
  Activity, 
  AlertTriangle, 
  Database, 
  Key, 
  Settings, 
  Clock, 
  Zap, 
  Shield, 
  LogOut,
  User
} from 'lucide-react';

interface ConsoleSidebarProps {
  isCollapsed?: boolean;
  onToggle?: () => void;
  user?: {
    name?: string;
    email?: string;
    avatar?: string;
  };
}

const consoleLinks = [
  { href: '/console', label: 'Overview', icon: LayoutGrid },
  { href: '/console/health', label: 'Health Checks', icon: Activity },
  { href: '/console/errors', label: 'Errors', icon: AlertTriangle },
  { href: '/console/database', label: 'Database', icon: Database },
  { href: '/console/api', label: 'API & Keys', icon: Key },
  { href: '/console/config', label: 'Configuration', icon: Settings },
  { href: '/console/jobs', label: 'Jobs', icon: Clock },
  { href: '/console/automations', label: 'Automations', icon: Zap },
  { href: '/console/security', label: 'Security', icon: Shield },
];

const bottomLinks = [
  { href: '/console/settings', label: 'Settings', icon: Settings },
  { href: '/logout', label: 'Logout', icon: LogOut },
];

export function ConsoleSidebar({ 
  isCollapsed = false, 
  onToggle,
  user 
}: ConsoleSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className={cn(
      "fixed inset-y-0 left-0 z-10 flex-col hidden lg:flex",
      isCollapsed ? "w-20" : "w-64"
    )}>
      <div className={cn(
        "flex flex-col h-full p-4 gap-4",
        // Glass styling
        "bg-glass-light dark:bg-glass-dark backdrop-blur-glass backdrop-saturate-[250%]",
        "border-r border-glass-border-light dark:border-glass-border-dark",
        "shadow-glass-subtle dark:shadow-glass-subtle-dark"
      )}>
        {/* Profile Section at Top */}
        <div className="flex items-center gap-2 p-2">
          <Avatar className="h-10 w-10 flex-shrink-0">
            <AvatarImage src={user?.avatar} alt={user?.name || "User"} />
            <AvatarFallback>
              <User className="h-5 w-5" />
            </AvatarFallback>
          </Avatar>
          
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name || "Console User"}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email || "admin@example.com"}</p>
            </div>
          )}
          
          {onToggle && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onToggle}
              className="h-8 w-8 flex-shrink-0"
            >
              <ChevronLeft className={cn(
                "h-4 w-4 transition-transform", 
                isCollapsed && "rotate-180"
              )} />
            </Button>
          )}
        </div>

        {/* Console Navigation Links */}
        <nav className="flex-1 space-y-1">
          {consoleLinks.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
            const Icon = link.icon;
            
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200',
                  'text-sm font-medium',
                  isActive 
                    ? 'bg-glass-light-hover dark:bg-glass-dark-hover text-primary shadow-[inset_0_2px_4px_rgba(255,255,255,0.6),inset_0_-1px_2px_rgba(0,0,0,0.1)]'
                    : 'text-foreground/80 hover:text-foreground hover:bg-glass-light dark:hover:bg-glass-dark'
                )}
                title={isCollapsed ? link.label : undefined}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {!isCollapsed && <span className="truncate">{link.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Links */}
        <div className="space-y-1">
          {bottomLinks.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200',
                  'text-sm font-medium',
                  isActive 
                    ? 'bg-glass-light-hover dark:bg-glass-dark-hover text-primary'
                    : 'text-foreground/80 hover:text-foreground hover:bg-glass-light dark:hover:bg-glass-dark'
                )}
                title={isCollapsed ? link.label : undefined}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {!isCollapsed && <span className="truncate">{link.label}</span>}
              </Link>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
