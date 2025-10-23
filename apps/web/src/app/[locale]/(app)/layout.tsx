import { PropsWithChildren } from 'react';
import { DEFAULT_APP_LAYOUT, AppLayoutStyles } from '@/config/app-layout';
import { TopNavLayout } from '@/components/layouts/TopNavLayout';
import { SidebarLayout } from '@/components/layouts/SidebarLayout';
import { Sidebar } from '@/components/navigation/Sidebar';
import { Topbar } from '@/components/navigation/Topbar';
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
  // Layout switcher logic - change DEFAULT_APP_LAYOUT to switch layouts
  // @ts-ignore - This comparison is intentional for layout switching
  if (DEFAULT_APP_LAYOUT === AppLayoutStyles.TOPNAV) {
    return (
      <TopNavLayout links={appLinks}>
        {children}
      </TopNavLayout>
    );
  }

  // Default SIDEBAR layout
  return (
    <SidebarLayout
      sidebarComponent={<Sidebar links={appLinks} />}
      topbarComponent={<Topbar title="Application" links={appLinks} />}
    >
      {children}
    </SidebarLayout>
  );
}
