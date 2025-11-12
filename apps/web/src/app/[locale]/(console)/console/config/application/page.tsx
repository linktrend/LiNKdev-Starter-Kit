import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings, Flag, Workflow, Rocket } from 'lucide-react';
import { cn } from '@/utils/cn';
import { buildLocalePath } from '@/lib/locale';

const sections = [
  {
    title: 'Application Settings',
    description: 'Branding, authentication, and default behaviors.',
    icon: Settings,
    href: '/console/config/application/settings',
  },
  {
    title: 'Feature Flags',
    description: 'Experiment safely with staged rollouts.',
    icon: Flag,
    href: '/console/config/application/feature-flags',
  },
  {
    title: 'Jobs & Queue',
    description: 'Monitor scheduled tasks and background workers.',
    icon: Workflow,
    href: '/console/config/application/jobs',
  },
  {
    title: 'Deployment',
    description: 'Plan releases, maintenance, and rollout strategy.',
    icon: Rocket,
    href: '/console/config/application/deployment',
  },
];

interface PageProps {
  params: { locale: string };
}

export default function ApplicationConfigLanding({ params }: PageProps) {
  const makeHref = (path: string) => buildLocalePath(params.locale, path);
  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <p className="text-sm uppercase tracking-wide text-muted-foreground">Configuration</p>
        <h1 className="text-3xl font-bold">Application</h1>
        <p className="text-muted-foreground max-w-3xl">
          Manage global application settings, feature flags, operational jobs, and deployment planning in one place.
          Each section mirrors the controls shown in the design reference so teams can jump straight into the view they need.
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <Card key={section.href} className="flex flex-col justify-between">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className={cn('p-2 rounded-lg bg-primary/10 text-primary')}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle>{section.title}</CardTitle>
                    <CardDescription>{section.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link href={makeHref(section.href)}>Open {section.title}</Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
