import { ReactNode } from 'react';
import { notFound } from 'next/navigation';

export default function LabsLayout({ children }: { children: ReactNode }) {
  const labsEnabled = process.env.NEXT_PUBLIC_ENABLE_LABS === 'true';
  if (!labsEnabled) {
    notFound();
  }
  return <>{children}</>;
}
