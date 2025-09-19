import { marketingConfig } from '@/config/marketing';
import FooterPrimary from '@/components/footer-primary';
import React from 'react';

// Inline CircularNavigation component for template
const CircularNavigation = ({ items, user }: { items: any[]; user: boolean }) => (
  <nav className="w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
    <div className="container flex h-14 items-center">
      <div className="mr-4 hidden md:flex">
        <a className="mr-6 flex items-center space-x-2" href="/">
          <span className="hidden font-bold sm:inline-block">Hikari</span>
        </a>
        <nav className="flex items-center space-x-6 text-sm font-medium">
          {items.map((item) => (
            <a
              key={item.href}
              className="transition-colors hover:text-foreground/80 text-foreground/60"
              href={item.href}
            >
              {item.title}
            </a>
          ))}
        </nav>
      </div>
      <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
        <div className="w-full flex-1 md:w-auto md:flex-none">
          {/* Search or other content */}
        </div>
        <nav className="flex items-center">
          {user ? (
            <a
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-3"
              href="/dashboard"
            >
              Dashboard
            </a>
          ) : (
            <a
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3"
              href="/signin"
            >
              Sign In
            </a>
          )}
        </nav>
      </div>
    </div>
  </nav>
);

import { getUser } from '@/utils/supabase/queries';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

interface MarketingLayoutProps {
  children: React.ReactNode;
}

export default async function MarketingLayout({
  children
}: MarketingLayoutProps) {
  const supabase = createClient({ cookies });
  const user = await getUser();

  return (
    <div className="flex min-h-screen flex-col items-center w-full">
      <CircularNavigation items={marketingConfig.mainNav} user={user ? true : false} />
      <main className="flex-1">{children}</main>
      <FooterPrimary />
    </div>
  );
}
