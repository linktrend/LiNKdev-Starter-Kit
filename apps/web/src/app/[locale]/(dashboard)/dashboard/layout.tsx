import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import {
  getUser,
  getUserDetails,
} from '@/utils/supabase/queries';
import { Settings, User, Eclipse, Home, LayoutDashboard, FileText, Bell } from 'lucide-react';

// User app navigation links
const userAppLinks = [
  { href: '/dashboard', label: 'Home', icon: Home },
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/records', label: 'Records', icon: FileText },
  { href: '/reminders', label: 'Reminders', icon: Bell },
  { href: '/profile', label: 'Profile', icon: User },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

// Inline Navbar component for template
const Navbar = ({ userDetails }: { userDetails: any }) => (
  <header className="flex h-16 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
    <div className="w-full flex-1">
      <h1 className="text-lg font-semibold">Dashboard</h1>
    </div>
    <div className="ml-auto flex items-center gap-4">
      <span className="text-sm text-muted-foreground">
        {userDetails?.full_name || 'User'}
      </span>
    </div>
  </header>
);

// Inline Sidebar component
const Sidebar = ({ links }: { links: typeof userAppLinks }) => (
  <aside className="fixed left-0 top-0 z-50 h-screen w-64 bg-background border-r shadow-lg">
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <div className="flex items-center gap-2">
          <Eclipse className="h-6 w-6" />
          <span className="text-xl font-bold">LTM Starter Kit</span>
        </div>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <Icon className="h-5 w-5" />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  </aside>
);

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default async function DashboardLayout({
  children
}: DashboardLayoutProps) {
  try {
    const supabase = createClient({ cookies });
    const [user, userDetails] = await Promise.all([
      getUser(),
      getUserDetails(),
    ]);

    if (!user) {
      return redirect('/en/login');
    }

    return (
      <div className="flex min-h-screen w-full">
        <Sidebar links={userAppLinks} />
        <div className="flex flex-col flex-1 lg:pl-64">
          <Navbar userDetails={userDetails} />
          <main className="flex-1 p-4 sm:px-6 sm:py-4">
            {children}
          </main>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error in DashboardLayout:', error);
    return redirect('/signin');
  }
}
