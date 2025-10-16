'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SidebarLink {
  href: string;
  label: string;
  icon: LucideIcon;
}

interface LiquidGlassSidebarProps {
  links: SidebarLink[];
  title?: string;
  logo?: React.ReactNode;
}

export function LiquidGlassSidebar({ links, title, logo }: LiquidGlassSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-10 w-64 flex-col hidden lg:flex">
      <div className={cn(
        'flex flex-col h-full p-4 gap-4',
        // Liquid Glass effect
        'bg-white/25 backdrop-blur-[40px] backdrop-saturate-[250%]',
        'border-r border-white/40',
        'shadow-[0_32px_80px_rgba(0,0,0,0.3),0_16px_64px_rgba(255,255,255,0.2)]',
        'dark:bg-black/25 dark:border-white/20'
      )}>
        {/* Logo/Title */}
        <div className="flex items-center gap-2 px-2 py-4">
          {logo}
          {title && <h2 className="text-lg font-semibold">{title}</h2>}
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-1">
          {links.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
            const Icon = link.icon;
            
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200',
                  'text-sm font-medium',
                  isActive 
                    ? 'bg-white/40 text-primary shadow-[inset_0_2px_4px_rgba(255,255,255,0.6),inset_0_-1px_2px_rgba(0,0,0,0.1)] dark:bg-white/20'
                    : 'text-foreground/80 hover:text-foreground hover:bg-white/20 dark:hover:bg-white/10'
                )}
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
}
