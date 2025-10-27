'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Eclipse } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { marketingConfig } from '@/config/marketing';

interface MarketingHeaderProps {
  user: boolean;
}

export function MarketingHeader({ user }: MarketingHeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
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
          {marketingConfig.mainNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
            >
              {item.title}
            </Link>
          ))}
        </nav>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          
          {/* Authentication Buttons - Desktop */}
          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <Button variant="glass" asChild>
                <Link href="/en/dashboard">Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button variant="glass" asChild>
                  <Link href="/en/signin">Sign In</Link>
                </Button>
                <Button variant="glass" asChild>
                  <Link href="/en/signup">Sign Up</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <button 
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 w-10 md:hidden"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 bg-glass-light dark:bg-glass-dark backdrop-blur-glass border-l border-glass-border-light dark:border-glass-border-dark">
              <div className="flex flex-col gap-4 mt-8">
                <div className="flex items-center gap-2 px-2">
                  <Eclipse className="h-6 w-6 text-primary" />
                  <span className="text-lg font-semibold">Liquid Glass</span>
                </div>
                
                <nav className="flex flex-col gap-2">
                  {marketingConfig.mainNav.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="px-3 py-2 rounded-md text-sm font-medium text-foreground/80 hover:text-foreground hover:bg-glass-light-hover dark:hover:bg-glass-dark-hover transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {item.title}
                    </Link>
                  ))}
                </nav>

                {/* Authentication Buttons - Mobile */}
                <div className="flex flex-col gap-2 pt-4 border-t border-glass-border-light dark:border-glass-border-dark">
                  {user ? (
                    <Button variant="glass" asChild className="w-full">
                      <Link href="/en/dashboard" onClick={() => setIsMobileMenuOpen(false)}>Dashboard</Link>
                    </Button>
                  ) : (
                    <>
                      <Button variant="glass" asChild className="w-full">
                        <Link href="/en/signin" onClick={() => setIsMobileMenuOpen(false)}>Sign In</Link>
                      </Button>
                      <Button variant="glass" asChild className="w-full">
                        <Link href="/en/signup" onClick={() => setIsMobileMenuOpen(false)}>Sign Up</Link>
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
