import React from 'react';

import MarketingLayoutClient from '@/components/MarketingLayoutClient';
import { getUser } from '@/lib/auth/server';

interface MarketingLayoutProps {
  children: React.ReactNode;
}

export default async function MarketingLayout({
  children
}: MarketingLayoutProps) {
  const user = await getUser();
  const clientUser = user
    ? {
        id: user.id,
        email: user.email ?? null,
        account_type: user.account_type,
      }
    : null;

  return (
    <MarketingLayoutClient user={clientUser}>
      {children}
    </MarketingLayoutClient>
  );
}
