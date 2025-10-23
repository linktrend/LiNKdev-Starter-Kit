import { PropsWithChildren } from 'react';
import { SidebarLayout } from '@/components/layouts/SidebarLayout';
import { ConsoleSidebar } from '@/components/navigation/ConsoleSidebar';
import { ConsoleTopbar } from '@/components/navigation/ConsoleTopbar';

export default function ConsoleLayout({ children }: PropsWithChildren) {
  return (
    <SidebarLayout
      sidebarComponent={<ConsoleSidebar />}
      topbarComponent={<ConsoleTopbar screenName="Console" />}
    >
      {children}
    </SidebarLayout>
  );
}
