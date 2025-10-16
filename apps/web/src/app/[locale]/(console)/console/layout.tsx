import { PropsWithChildren } from 'react';
import { LiquidGlassSidebar } from '@/components/navigation/LiquidGlassSidebar';
import { LayoutGrid, Users, Database, Key } from 'lucide-react';

const consoleLinks = [
  { href: '/console', label: 'App Overview', icon: LayoutGrid },
  { href: '/console/users', label: 'User Management', icon: Users },
  { href: '/console/db', label: 'Database Access', icon: Database },
  { href: '/console/api', label: 'API Keys', icon: Key },
];

export default function ConsoleLayout({ children }: PropsWithChildren) {
  return (
    <div className="flex min-h-screen w-full">
      <LiquidGlassSidebar 
        links={consoleLinks} 
        title="Dev Console"
      />
      <div className="flex flex-col flex-1 lg:pl-64">
        <main className="flex-1 p-4 sm:px-6 sm:py-4">
          {children}
        </main>
      </div>
    </div>
  );
}
