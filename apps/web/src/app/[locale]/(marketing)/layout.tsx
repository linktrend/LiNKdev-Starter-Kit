import MarketingLayoutClient from '@/components/MarketingLayoutClient';
import React from 'react';

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
    <MarketingLayoutClient user={user ? true : false}>
      {children}
    </MarketingLayoutClient>
  );
}
