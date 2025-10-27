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
  Home, 
  FolderKanban, 
  BarChart3, 
  User,
  Settings,
  CreditCard,
  HelpCircle,
  LogOut,
  UserRoundCog
} from 'lucide-react';

interface SidebarLink {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface SidebarProps {
  locale?: string;
  userName?: string;
  userAvatar?: string;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  links?: SidebarLink[];
}

const defaultLinks: SidebarLink[] = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/projects', label: 'Projects', icon: FolderKanban },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/profile', label: 'Profile', icon: User },
];

const bottomLinks: SidebarLink[] = [
  { href: '/settings', label: 'Settings', icon: Settings },
  { href: '/switch-account', label: 'Switch Account', icon: UserRoundCog },
  { href: '/logout', label: 'Logout', icon: LogOut },
];

export function Sidebar({ 
  locale = 'en',
  userName = 'Guest User',
  userAvatar,
  isCollapsed = false, 
  onToggleCollapse,
  links = defaultLinks
}: SidebarProps) {
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
              href={`/${locale}/profile`}
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
                  <span className="text-xs text-muted-foreground truncate">user@example.com</span>
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
          {links.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
            const Icon = link.icon;
            
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200",
                  isActive
                    ? "bg-accent text-accent-foreground border border-border"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                )}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {!isCollapsed && (
                  <span className="text-sm font-medium">{link.label}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Links */}
        <div className="px-3 mt-auto space-y-1 pt-4 border-t">
          {bottomLinks.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
            const Icon = link.icon;
            
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200",
                  isActive
                    ? "bg-accent text-accent-foreground border border-border"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                )}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {!isCollapsed && (
                  <span className="text-sm font-medium">{link.label}</span>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
