import { PropsWithChildren } from 'react';
import { LiquidGlassSidebar } from '@/components/navigation/LiquidGlassSidebar';
import { Home, LayoutDashboard, FileText, Bell, User, Settings } from 'lucide-react';

const appLinks = [
  { href: '/dashboard', label: 'Home', icon: Home },
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/records', label: 'Records', icon: FileText },
  { href: '/reminders', label: 'Reminders', icon: Bell },
  { href: '/profile', label: 'Profile', icon: User },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

export default function AppLayout({ children }: PropsWithChildren) {
  return (
    <div className="flex min-h-screen w-full">
      <LiquidGlassSidebar 
        links={appLinks} 
        title="Application"
      />
      <div className="flex flex-col flex-1 lg:pl-64">
        <main className="flex-1 p-4 sm:px-6 sm:py-4">
          {children}
        </main>
      </div>
    </div>
  );
}
