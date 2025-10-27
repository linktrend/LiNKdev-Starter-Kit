'use client';

import FooterPrimary from '@/components/footer-primary';
import { MarketingHeader } from '@/components/navigation/MarketingHeader';
import React from 'react';

interface MarketingLayoutClientProps {
  user: boolean;
  children: React.ReactNode;
}

export default function MarketingLayoutClient({
  user,
  children
}: MarketingLayoutClientProps) {
  return (
    <div className="flex min-h-screen flex-col w-full">
      <MarketingHeader user={user} />
      <main className="flex-1">{children}</main>
      <FooterPrimary />
    </div>
  );
}
