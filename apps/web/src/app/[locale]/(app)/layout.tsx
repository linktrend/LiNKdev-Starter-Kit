import { PropsWithChildren } from 'react';
import { LiquidGlassSidebar } from '@/components/navigation/LiquidGlassSidebar';
import { Home, LayoutDashboard, FileText, Bell, User, Settings } from 'lucide-react';
import { DEFAULT_APP_LAYOUT, AppLayoutStyles } from '@/config/app-layout';

const appLinks = [
  { href: '/dashboard', label: 'Home', icon: Home },
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/records', label: 'Records', icon: FileText },
  { href: '/reminders', label: 'Reminders', icon: Bell },
  { href: '/profile', label: 'Profile', icon: User },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

export default function AppLayout({ children }: PropsWithChildren) {
  // Layout switcher logic - change DEFAULT_APP_LAYOUT to switch layouts
  // @ts-ignore - This comparison is intentional for layout switching
  if (DEFAULT_APP_LAYOUT === AppLayoutStyles.TOPNAV) {
    // Future TopNavLayout implementation
    return (
      <div className="flex min-h-screen w-full flex-col">
        {/* TopNavLayout placeholder - to be implemented in future steps */}
        <header className="h-16 bg-glass-light dark:bg-glass-dark backdrop-blur-glass border-b border-glass-border-light dark:border-glass-border-dark">
          <div className="flex items-center justify-between h-full px-4">
            <h1 className="text-lg font-semibold">Application</h1>
            <nav className="flex space-x-4">
              {appLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <a
                    key={link.href}
                    href={link.href}
                    className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium hover:bg-glass-light-hover dark:hover:bg-glass-dark-hover"
                  >
                    <Icon className="h-4 w-4" />
                    <span>{link.label}</span>
                  </a>
                );
              })}
            </nav>
          </div>
        </header>
        <main className="flex-1 p-4 sm:px-6 sm:py-4">
          {children}
        </main>
      </div>
    );
  }

  // Default SIDEBAR layout
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
