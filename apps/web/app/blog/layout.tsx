import { marketingConfig } from '@/config/marketing';

import CircularNavigation from '@/components/navigation';
import FooterPrimary from '@/components/footer-blog';
import React from 'react';
import { createClient } from '@/utils/supabase/client';
import { getUser } from '@/utils/supabase/queries';

interface MarketingLayoutProps {
  children: React.ReactNode;
}

export default async function MarketingLayout({
  children
}: MarketingLayoutProps) {
  const supabase = createClient();
  const user = await getUser();

  return (
    <div className="flex min-h-screen flex-col items-center w-full">
      <div className="flex items-center justify-between w-full p-4">
        <div className="flex items-center space-x-2">
          <span className="text-lg font-bold">HIKARI</span>
        </div>
        <div className="flex items-center space-x-4">
          <a href="/#features" className="text-sm hover:underline">Features</a>
          <a href="/#pricing" className="text-sm hover:underline">Pricing</a>
          <a href="/blog" className="text-sm hover:underline">Blog</a>
          <a href="/docs" className="text-sm hover:underline">Documentation</a>
        </div>
      </div>
      <main className="flex-1">{children}</main>
      <FooterPrimary />
    </div>
  );
}
