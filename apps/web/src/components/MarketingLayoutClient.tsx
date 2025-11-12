'use client';

import Footer from '@/components/footer';
import { MarketingHeader } from '@/components/navigation/MarketingHeader';
import { usePathname, useParams } from 'next/navigation';
import React from 'react';

interface MarketingLayoutClientProps {
  user: boolean;
  children: React.ReactNode;
}

export default function MarketingLayoutClient({
  user,
  children
}: MarketingLayoutClientProps) {
  const pathname = usePathname();
  const params = useParams();
  const locale = (params?.locale as string) ?? 'en';
  
  // Show navigation only on the homepage
  const isHomePage = pathname === `/${locale}` || pathname === '/';
  
  return (
    <div className="flex min-h-screen flex-col w-full">
      <MarketingHeader user={user} showNavigation={isHomePage} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
