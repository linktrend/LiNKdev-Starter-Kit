import Link from 'next/link';
import { NavItem, navConfig, iconComponents } from '@/config/dashboard';
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent
} from '@starter/ui';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import {
  getUser,
  getUserDetails,
} from '@/utils/supabase/queries';
import { Settings, User, Eclipse } from 'lucide-react';
import { ThemeToggle } from '@starter/ui';
// Inline Navbar component for template
const Navbar = ({ userDetails, navConfig, userId }: { userDetails: any; navConfig: NavItem[]; userId: string }) => (
  <header className="flex h-16 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
    <div className="w-full flex-1">
      <h1 className="text-lg font-semibold">Dashboard</h1>
    </div>
    <div className="ml-auto flex items-center gap-4">
      {/* Theme Toggle */}
      <ThemeToggle />
      {/* Organization Switcher */}
      <OrgSwitcher userId={userId} />
      <span className="text-sm text-muted-foreground">
        {userDetails?.full_name || 'User'}
      </span>
    </div>
  </header>
);

// Inline Sidebar component for template
const Sidebar = ({ navConfig }: { navConfig: NavItem[] }) => (
  <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
    <TooltipProvider>
      <Link
        href="/"
        className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-lg bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
        prefetch={false}
      >
        <Eclipse className="h-5 w-5 transition-all group-hover:scale-110" />
        <span className="sr-only">LTM Starter Kit Inc</span>
      </Link>
      {navConfig.map((item, index) => {
        const IconComponent = iconComponents[item.icon as keyof typeof iconComponents];
        const isActive = false; // Simplified for template
        const isDisabled = item.disabled;
        return (
          <Tooltip key={index}>
            <TooltipTrigger asChild>
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors md:h-8 md:w-8 ${
                  isDisabled
                    ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                    : isActive
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {isDisabled ? (
                  <IconComponent className="h-5 w-5 opacity-50" />
                ) : (
                  <Link
                    href={item.href}
                    className="flex h-full w-full items-center justify-center"
                    prefetch={false}
                  >
                    <IconComponent className="h-5 w-5" />
                  </Link>
                )}
                <span className="sr-only">{item.label}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent side="right">
              {isDisabled ? `${item.label} (Disabled)` : item.label}
            </TooltipContent>
          </Tooltip>
        );
      })}
    </TooltipProvider>
  </nav>
);
import { redirect } from 'next/navigation';
import { OrgSwitcher } from '@/components/org-switcher';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default async function DashboardLayout({
  children
}: DashboardLayoutProps) {
  const supabase = createClient({ cookies });
  const [user, userDetails] = await Promise.all([
    getUser(),
    getUserDetails(),
  ]);

  if (!user) {
    return redirect('/signin');
  }

  // In case you want to get the current pathname in Server.
  // This corresponds to a middleware setting, copy the middleware in root when you use this.

  // const headersList = headers()
  // const pathname = headersList.get('x-current-path') || ''

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
        <Sidebar navConfig={navConfig as NavItem[]} />
        <nav className="mt-auto flex flex-col items-center gap-2 px-2 sm:py-5">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="/dashboard/account"
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
                  prefetch={false}
                >
                  <User className="h-5 w-5" />
                  <span className="sr-only">Profile</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">Profile</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="/dashboard/settings"
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
                  prefetch={false}
                >
                  <Settings className="h-5 w-5" />
                  <span className="sr-only">Settings</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">Settings</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </nav>
      </aside>
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <Navbar userDetails={userDetails} navConfig={navConfig as NavItem[]} userId={user.id} />
        <main className="grid flex-1 items-start p-4 sm:px-6 sm:py-0 md:gap-8">
          {children}
        </main>
      </div>
    </div>
  );
}
