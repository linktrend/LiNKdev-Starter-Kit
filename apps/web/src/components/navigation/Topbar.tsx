'use client';

import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from '@starter/ui';
import { Sheet, SheetContent, SheetTrigger } from '@starter/ui';
import { Menu, Bell, Eclipse } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { NotificationCounter } from '@/components/notification-counter';

interface TopbarProps {
  isCollapsed?: boolean;
  title?: string;
  links?: Array<{
    href: string;
    label: string;
    icon?: React.ComponentType<{ className?: string }>;
  }>;
}

export function Topbar({ 
  isCollapsed = false, 
  title = "Dashboard",
  links = []
}: TopbarProps) {
  return (
    <header className={cn(
      "h-16 flex items-center gap-4 px-4 lg:px-6",
      // Glass styling
      "bg-glass-light dark:bg-glass-dark backdrop-blur-glass",
      "border-b border-glass-border-light dark:border-glass-border-dark",
      "shadow-glass-subtle dark:shadow-glass-subtle-dark"
    )}>
      {/* Mobile Menu Button */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="lg:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-80 bg-glass-light dark:bg-glass-dark backdrop-blur-glass border-r border-glass-border-light dark:border-glass-border-dark">
          <div className="flex flex-col gap-4 mt-8">
            <div className="flex items-center gap-2 px-2">
              <Eclipse className="h-6 w-6 text-primary" />
              <span className="text-lg font-semibold">{title}</span>
            </div>
            
            <nav className="flex flex-col gap-2">
              {links.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium hover:bg-glass-light-hover dark:hover:bg-glass-dark-hover transition-colors"
                  >
                    {Icon && <Icon className="h-4 w-4" />}
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </SheetContent>
      </Sheet>

      {/* Logo and Title */}
      <div className="flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2">
          <Eclipse className="h-6 w-6 text-primary" />
        </Link>
        <h1 className="text-lg font-semibold">{title}</h1>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Right Side Actions */}
      <div className="flex items-center gap-2">
        <NotificationCounter />
        <ThemeToggle />
      </div>
    </header>
  );
}
