'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Menu, Sparkles } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

interface MarketingHeaderProps {
  user: boolean;
}

export function MarketingHeader({ user }: MarketingHeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 h-16 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-full items-center justify-between px-8">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Sparkles className="h-7 w-7 text-primary" />
          <span className="text-xl font-bold">LTM Starter Kit</span>
        </div>

        {/* Desktop Buttons */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <Button asChild variant="default">
              <Link href="/en/dashboard">Dashboard</Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="outline">
                <Link href="/en/login">Log In</Link>
              </Button>
              <Button asChild variant="default" style={{ backgroundColor: 'hsl(var(--accent-red))', color: 'hsl(var(--accent-red-foreground))' }}>
                <Link href="/en/signup">Sign Up</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu */}
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger asChild className="md:hidden">
            <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 w-10">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </button>
          </SheetTrigger>
          <SheetContent side="right" className="w-80">
            <div className="flex flex-col gap-4 mt-8">
              <div className="flex items-center gap-2 px-2">
                <Sparkles className="h-6 w-6 text-primary" />
                <span className="text-lg font-semibold">LTM Starter Kit</span>
              </div>
              
              {user ? (
                <Button asChild variant="default" className="w-full">
                  <Link href="/en/dashboard" onClick={() => setIsMobileMenuOpen(false)}>Dashboard</Link>
                </Button>
              ) : (
                <div className="flex flex-col gap-2">
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/en/login" onClick={() => setIsMobileMenuOpen(false)}>Log In</Link>
                  </Button>
                  <Button asChild variant="default" className="w-full" style={{ backgroundColor: 'hsl(var(--accent-red))', color: 'hsl(var(--accent-red-foreground))' }}>
                    <Link href="/en/signup" onClick={() => setIsMobileMenuOpen(false)}>Sign Up</Link>
                  </Button>
                </div>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
