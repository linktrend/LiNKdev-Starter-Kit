'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Menu, Sparkles, Globe, ChevronDown, X } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface MarketingHeaderProps {
  user: {
    account_type: 'super_admin' | 'admin' | 'user';
  } | null;
  showNavigation?: boolean;
}

const navigationItems = {
  platform: {
    label: 'Platform',
    items: [
      { label: 'Advantage 1', href: '/platform/advantage-1' },
      { label: 'Advantage 2', href: '/platform/advantage-2' },
      { label: 'AI', href: '/platform/ai' },
      { label: 'Innovation & Support', href: '/platform/innovation-support' },
    ],
  },
  solutions: {
    label: 'Solutions',
    items: [
      { label: 'Customers', href: '/solutions/customers' },
      { label: 'Industry', href: '/solutions/industry' },
      { label: 'Company Size', href: '/solutions/company-size' },
      { label: 'Role', href: '/solutions/role' },
    ],
  },
  resources: {
    label: 'Resources',
    items: [
      { label: 'Library', href: '/resources/library' },
      { label: 'For Customers', href: '/resources/for-customers' },
    ],
  },
};

const languages = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
  { code: 'zh-tw', label: '繁體中文' },
];

export function MarketingHeader({ user, showNavigation = false }: MarketingHeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedMobileSection, setExpandedMobileSection] = useState<string | null>(null);
  const params = useParams();
  const pathname = usePathname();
  const locale = params.locale as string || 'en';
  const isAuthenticated = Boolean(user);
  const isAdmin = Boolean(user && (user.account_type === 'super_admin' || user.account_type === 'admin'));

  const currentLanguage = languages.find(lang => lang.code === locale) || languages[0];

  const switchLanguage = (newLocale: string) => {
    const pathWithoutLocale = pathname.replace(`/${locale}`, '');
    window.location.href = `/${newLocale}${pathWithoutLocale || ''}`;
  };

  const toggleMobileSection = (section: string) => {
    setExpandedMobileSection(expandedMobileSection === section ? null : section);
  };

  return (
    <header className="sticky top-0 z-50 h-16 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-full items-center justify-between px-8">
        {/* Logo */}
        <Link href={`/${locale}`} className="flex items-center gap-2">
          <Sparkles className="h-7 w-7 text-primary" />
          <span className="text-xl font-bold">LTM Starter Kit</span>
        </Link>

        {/* Desktop Navigation Links - Only show on home page */}
        {showNavigation && (
        <nav className="hidden lg:flex items-center gap-6 flex-1 justify-center">
          {/* Platform Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1 text-sm font-medium hover:text-primary transition-colors">
              Platform
              <ChevronDown className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56 border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              {navigationItems.platform.items.map((item) => (
                <DropdownMenuItem key={item.href} asChild>
                  <Link href={`/${locale}${item.href}`} className="w-full cursor-pointer">
                    {item.label}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Solutions Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1 text-sm font-medium hover:text-primary transition-colors">
              Solutions
              <ChevronDown className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56 border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              {navigationItems.solutions.items.map((item) => (
                <DropdownMenuItem key={item.href} asChild>
                  <Link href={`/${locale}${item.href}`} className="w-full cursor-pointer">
                    {item.label}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Pricing Link */}
          <Link 
            href={`/${locale}/pricing`} 
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            Pricing
          </Link>

          {/* Enterprise Link */}
          <Link 
            href={`/${locale}/enterprise`} 
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            Enterprise
          </Link>

          {/* Resources Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1 text-sm font-medium hover:text-primary transition-colors">
              Resources
              <ChevronDown className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56 border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              {navigationItems.resources.items.map((item) => (
                <DropdownMenuItem key={item.href} asChild>
                  <Link href={`/${locale}${item.href}`} className="w-full cursor-pointer">
                    {item.label}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>
        )}

        {/* Desktop Right Side: Language Switcher + Auth Buttons */}
        <div className="hidden md:flex items-center gap-3">
          {/* Language Switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-accent transition-colors">
              <Globe className="h-4 w-4" />
              <span className="text-sm font-medium uppercase">{currentLanguage.code}</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              {languages.map((lang) => (
                <DropdownMenuItem 
                  key={lang.code}
                  onClick={() => switchLanguage(lang.code)}
                  className={cn(
                    "cursor-pointer",
                    lang.code === locale && "bg-accent"
                  )}
                >
                  <span>{lang.label}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Auth Buttons */}
          {isAdmin && (
            <Button asChild variant="secondary">
              <Link href={`/${locale}/console`}>Admin Console</Link>
            </Button>
          )}
          {isAuthenticated ? (
            <Button asChild variant="outline">
              <Link href={`/${locale}/logout-confirmation`}>Log Out</Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="outline">
                <Link href={`/${locale}/login`}>Log In</Link>
              </Button>
              <Button asChild variant="ghost" className="!bg-[hsl(var(--accent-red))] !text-[hsl(var(--accent-red-foreground))] !hover:bg-[hsl(var(--accent-red))]/90">
                <Link href={`/${locale}/signup`}>Sign Up</Link>
              </Button>
            </>
          )}

          {/* Hamburger Menu (Desktop) */}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <button 
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 w-10"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[200px] h-fit p-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-l">
              <div className="flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-6 w-6 text-primary" />
                    <span className="text-lg font-semibold">Menu</span>
                  </div>
                </div>

                {/* Menu Content */}
                <div className="overflow-y-auto p-6">
                  <nav className="flex flex-col gap-2">
                    {/* Platform Section */}
                    <div>
                      <button
                        onClick={() => toggleMobileSection('platform')}
                        className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium hover:bg-accent transition-colors rounded-md"
                      >
                        Platform
                        <ChevronDown
                          className={cn(
                            "h-4 w-4 transition-transform",
                            expandedMobileSection === 'platform' && "rotate-180"
                          )}
                        />
                      </button>
                      {expandedMobileSection === 'platform' && (
                        <div className="pl-4 pt-1 space-y-1">
                          {navigationItems.platform.items.map((item) => (
                            <Link
                              key={item.href}
                              href={`/${locale}${item.href}`}
                              onClick={() => { setIsMobileMenuOpen(false); setExpandedMobileSection(null); }}
                              className="block px-4 py-2 text-sm hover:bg-accent rounded-md transition-colors"
                            >
                              {item.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Solutions Section */}
                    <div>
                      <button
                        onClick={() => toggleMobileSection('solutions')}
                        className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium hover:bg-accent transition-colors rounded-md"
                      >
                        Solutions
                        <ChevronDown
                          className={cn(
                            "h-4 w-4 transition-transform",
                            expandedMobileSection === 'solutions' && "rotate-180"
                          )}
                        />
                      </button>
                      {expandedMobileSection === 'solutions' && (
                        <div className="pl-4 pt-1 space-y-1">
                          {navigationItems.solutions.items.map((item) => (
                            <Link
                              key={item.href}
                              href={`/${locale}${item.href}`}
                              onClick={() => { setIsMobileMenuOpen(false); setExpandedMobileSection(null); }}
                              className="block px-4 py-2 text-sm hover:bg-accent rounded-md transition-colors"
                            >
                              {item.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>

                    <Link
                      href={`/${locale}/pricing`}
                      onClick={() => { setIsMobileMenuOpen(false); setExpandedMobileSection(null); }}
                      className="px-4 py-3 rounded-md hover:bg-accent transition-colors text-sm font-medium"
                    >
                      Pricing
                    </Link>

                    <Link
                      href={`/${locale}/enterprise`}
                      onClick={() => { setIsMobileMenuOpen(false); setExpandedMobileSection(null); }}
                      className="px-4 py-3 rounded-md hover:bg-accent transition-colors text-sm font-medium"
                    >
                      Enterprise
                    </Link>

                    {/* Resources Section */}
                    <div>
                      <button
                        onClick={() => toggleMobileSection('resources')}
                        className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium hover:bg-accent transition-colors rounded-md"
                      >
                        Resources
                        <ChevronDown
                          className={cn(
                            "h-4 w-4 transition-transform",
                            expandedMobileSection === 'resources' && "rotate-180"
                          )}
                        />
                      </button>
                      {expandedMobileSection === 'resources' && (
                        <div className="pl-4 pt-1 space-y-1">
                          {navigationItems.resources.items.map((item) => (
                            <Link
                              key={item.href}
                              href={`/${locale}${item.href}`}
                              onClick={() => { setIsMobileMenuOpen(false); setExpandedMobileSection(null); }}
                              className="block px-4 py-2 text-sm hover:bg-accent rounded-md transition-colors"
                            >
                              {item.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>

                    <Link
                      href={`/${locale}/about`}
                      onClick={() => { setIsMobileMenuOpen(false); setExpandedMobileSection(null); }}
                      className="px-4 py-3 rounded-md hover:bg-accent transition-colors text-sm font-medium"
                    >
                      About Us
                    </Link>

                    <Link
                      href={`/${locale}/contact`}
                      onClick={() => { setIsMobileMenuOpen(false); setExpandedMobileSection(null); }}
                      className="px-4 py-3 rounded-md hover:bg-accent transition-colors text-sm font-medium"
                    >
                      Contact Us
                    </Link>

                    <div className="mt-4 border-t pt-4 space-y-2">
                      {isAdmin && (
                        <Link
                          href={`/${locale}/console`}
                          onClick={() => { setIsMobileMenuOpen(false); setExpandedMobileSection(null); }}
                          className="block rounded-md border border-dashed border-primary/40 px-4 py-3 text-sm font-medium text-primary hover:bg-primary/5"
                        >
                          Admin Console
                        </Link>
                      )}
                      {isAuthenticated ? (
                        <Link
                          href={`/${locale}/logout-confirmation`}
                          onClick={() => { setIsMobileMenuOpen(false); setExpandedMobileSection(null); }}
                          className="block rounded-md px-4 py-3 text-sm font-medium hover:bg-accent"
                        >
                          Log Out
                        </Link>
                      ) : (
                        <>
                          <Link
                            href={`/${locale}/login`}
                            onClick={() => { setIsMobileMenuOpen(false); setExpandedMobileSection(null); }}
                            className="block rounded-md px-4 py-3 text-sm font-medium hover:bg-accent"
                          >
                            Log In
                          </Link>
                          <Link
                            href={`/${locale}/signup`}
                            onClick={() => { setIsMobileMenuOpen(false); setExpandedMobileSection(null); }}
                            className="block rounded-md bg-primary px-4 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                          >
                            Sign Up
                          </Link>
                        </>
                      )}
                    </div>
                  </nav>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Mobile: Language Switcher + Hamburger */}
        <div className="flex md:hidden items-center gap-2">
          {/* Language Switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1 px-2 py-2 rounded-md hover:bg-accent transition-colors">
              <Globe className="h-4 w-4" />
              <span className="text-xs font-medium uppercase">{currentLanguage.code}</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {languages.map((lang) => (
                <DropdownMenuItem 
                  key={lang.code}
                  onClick={() => switchLanguage(lang.code)}
                  className={cn(
                    "cursor-pointer",
                    lang.code === locale && "bg-accent"
                  )}
                >
                  <span>{lang.label}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Hamburger Menu */}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <button 
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 w-10"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] h-fit p-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-l">
              <div className="flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-6 w-6 text-primary" />
                    <span className="text-lg font-semibold">Menu</span>
                  </div>
                </div>

                {/* Menu Content */}
                <div className="overflow-y-auto p-6">
                  <nav className="flex flex-col gap-2">
                    {/* Platform Section */}
                    <div>
                      <button
                        onClick={() => toggleMobileSection('platform')}
                        className="w-full flex items-center justify-start gap-4 px-4 py-3 text-sm font-medium hover:bg-accent transition-colors rounded-md"
                      >
                        <span className="w-24 text-left">Platform</span>
                        <ChevronDown
                          className={cn(
                            "h-4 w-4 transition-transform",
                            expandedMobileSection === 'platform' && "rotate-180"
                          )}
                        />
                      </button>
                      {expandedMobileSection === 'platform' && (
                        <div className="pl-4 pt-1 space-y-1">
                          {navigationItems.platform.items.map((item) => (
                            <Link
                              key={item.href}
                              href={`/${locale}${item.href}`}
                              onClick={() => { setIsMobileMenuOpen(false); setExpandedMobileSection(null); }}
                              className="block px-4 py-2 text-sm hover:bg-accent rounded-md transition-colors"
                            >
                              {item.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Solutions Section */}
                    <div>
                      <button
                        onClick={() => toggleMobileSection('solutions')}
                        className="w-full flex items-center justify-start gap-4 px-4 py-3 text-sm font-medium hover:bg-accent transition-colors rounded-md"
                      >
                        <span className="w-24 text-left">Solutions</span>
                        <ChevronDown
                          className={cn(
                            "h-4 w-4 transition-transform",
                            expandedMobileSection === 'solutions' && "rotate-180"
                          )}
                        />
                      </button>
                      {expandedMobileSection === 'solutions' && (
                        <div className="pl-4 pt-1 space-y-1">
                          {navigationItems.solutions.items.map((item) => (
                            <Link
                              key={item.href}
                              href={`/${locale}${item.href}`}
                              onClick={() => { setIsMobileMenuOpen(false); setExpandedMobileSection(null); }}
                              className="block px-4 py-2 text-sm hover:bg-accent rounded-md transition-colors"
                            >
                              {item.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>

                    <Link
                      href={`/${locale}/pricing`}
                      onClick={() => { setIsMobileMenuOpen(false); setExpandedMobileSection(null); }}
                      className="px-4 py-3 rounded-md hover:bg-accent transition-colors text-sm font-medium"
                    >
                      Pricing
                    </Link>

                    <Link
                      href={`/${locale}/enterprise`}
                      onClick={() => { setIsMobileMenuOpen(false); setExpandedMobileSection(null); }}
                      className="px-4 py-3 rounded-md hover:bg-accent transition-colors text-sm font-medium"
                    >
                      Enterprise
                    </Link>

                    {/* Resources Section */}
                    <div>
                      <button
                        onClick={() => toggleMobileSection('resources')}
                        className="w-full flex items-center justify-start gap-4 px-4 py-3 text-sm font-medium hover:bg-accent transition-colors rounded-md"
                      >
                        <span className="w-24 text-left">Resources</span>
                        <ChevronDown
                          className={cn(
                            "h-4 w-4 transition-transform",
                            expandedMobileSection === 'resources' && "rotate-180"
                          )}
                        />
                      </button>
                      {expandedMobileSection === 'resources' && (
                        <div className="pl-4 pt-1 space-y-1">
                          {navigationItems.resources.items.map((item) => (
                            <Link
                              key={item.href}
                              href={`/${locale}${item.href}`}
                              onClick={() => { setIsMobileMenuOpen(false); setExpandedMobileSection(null); }}
                              className="block px-4 py-2 text-sm hover:bg-accent rounded-md transition-colors"
                            >
                              {item.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>

                    <Link
                      href={`/${locale}/about`}
                      onClick={() => { setIsMobileMenuOpen(false); setExpandedMobileSection(null); }}
                      className="px-4 py-3 rounded-md hover:bg-accent transition-colors text-sm font-medium"
                    >
                      About Us
                    </Link>

                    <Link
                      href={`/${locale}/contact`}
                      onClick={() => { setIsMobileMenuOpen(false); setExpandedMobileSection(null); }}
                      className="px-4 py-3 rounded-md hover:bg-accent transition-colors text-sm font-medium"
                    >
                      Contact Us
                    </Link>

                    <div className="mt-4 border-t pt-4 space-y-2">
                      {isAdmin && (
                        <Link
                          href={`/${locale}/console`}
                          onClick={() => { setIsMobileMenuOpen(false); setExpandedMobileSection(null); }}
                          className="block rounded-md border border-dashed border-primary/40 px-4 py-3 text-sm font-medium text-primary hover:bg-primary/5"
                        >
                          Admin Console
                        </Link>
                      )}
                      {isAuthenticated ? (
                        <Link
                          href={`/${locale}/logout-confirmation`}
                          onClick={() => { setIsMobileMenuOpen(false); setExpandedMobileSection(null); }}
                          className="block rounded-md px-4 py-3 text-sm font-medium hover:bg-accent"
                        >
                          Log Out
                        </Link>
                      ) : (
                        <>
                          <Link
                            href={`/${locale}/login`}
                            onClick={() => { setIsMobileMenuOpen(false); setExpandedMobileSection(null); }}
                            className="block rounded-md px-4 py-3 text-sm font-medium hover:bg-accent"
                          >
                            Log In
                          </Link>
                          <Link
                            href={`/${locale}/signup`}
                            onClick={() => { setIsMobileMenuOpen(false); setExpandedMobileSection(null); }}
                            className="block rounded-md bg-primary px-4 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                          >
                            Sign Up
                          </Link>
                        </>
                      )}
                    </div>
                  </nav>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
