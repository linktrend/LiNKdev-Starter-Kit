'use client';

import { PropsWithChildren, useState } from 'react';
import Link from 'next/link';
import { Button } from '@starter/ui';
import { Sheet, SheetContent, SheetTrigger } from '@starter/ui';
import { Menu, Bell, Eclipse } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { NotificationCounter } from '@/components/notification-counter';

interface TopNavLayoutProps extends PropsWithChildren {
  links?: Array<{
    href: string;
    label: string;
    icon?: React.ComponentType<{ className?: string }>;
  }>;
}

export function TopNavLayout({ children, links = [] }: TopNavLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen w-full flex-col">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 h-16 bg-glass-light dark:bg-glass-dark backdrop-blur-glass border-b border-glass-border-light dark:border-glass-border-dark shadow-glass-subtle">
        <div className="flex h-full items-center justify-between px-4 lg:px-6">
          {/* Logo and Brand */}
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <Eclipse className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold">Liquid Glass</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium hover:bg-glass-light-hover dark:hover:bg-glass-dark-hover transition-colors"
                >
                  {Icon && <Icon className="h-4 w-4" />}
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2">
            <NotificationCounter />
            <ThemeToggle />
            
            {/* Mobile Menu Button */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 bg-glass-light dark:bg-glass-dark backdrop-blur-glass border-l border-glass-border-light dark:border-glass-border-dark">
                <div className="flex flex-col gap-4 mt-8">
                  <div className="flex items-center gap-2 px-2">
                    <Eclipse className="h-6 w-6 text-primary" />
                    <span className="text-lg font-semibold">Liquid Glass</span>
                  </div>
                  
                  <nav className="flex flex-col gap-2">
                    {links.map((link) => {
                      const Icon = link.icon;
                      return (
                        <Link
                          key={link.href}
                          href={link.href}
                          className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium hover:bg-glass-light-hover dark:hover:bg-glass-dark-hover transition-colors"
                          onClick={() => setIsMobileMenuOpen(false)}
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
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 sm:px-6 sm:py-4">
        {children}
      </main>
    </div>
  );
}
