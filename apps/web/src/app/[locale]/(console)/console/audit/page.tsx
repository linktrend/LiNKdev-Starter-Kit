import { Metadata } from 'next';
import { AuditPageClient } from './AuditPageClient';

export const metadata: Metadata = {
  title: 'Console - Audit Logs',
};

export default function ConsoleAuditPage() {
  return <AuditPageClient />;
}
