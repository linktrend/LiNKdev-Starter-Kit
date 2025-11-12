import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { buildLocalePath } from '@/lib/locale';

const labsLinks = [
  { label: 'Debug Tools', href: '/labs/debug', description: 'Stripe webhooks, auth simulators, and mock data utilities.' },
  { label: 'i18n Playground', href: '/labs/test-i18n', description: 'Verify translations and locale fallbacks.' },
  { label: 'Org Sandbox', href: '/labs/test-org', description: 'Mock multi-tenant states for demos.' },
  { label: 'Legacy Admin', href: '/labs/admin', description: 'Archived admin shell kept for reference.' },
];

interface PageProps {
  params: { locale: string };
}

export default function LabsIndexPage({ params }: PageProps) {
  const makeHref = (path: string) => buildLocalePath(params.locale, path);
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-widest text-muted-foreground">Labs</p>
        <h1 className="text-3xl font-bold">Internal Sandboxes</h1>
        <p className="text-muted-foreground max-w-2xl">
          These routes are gated behind <code>NEXT_PUBLIC_ENABLE_LABS</code> and should never ship enabled to production environments.
          Use them for experiments, QA workflows, and diagnostics before promoting features into the main app.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {labsLinks.map((link) => (
          <Card key={link.href}>
            <CardHeader>
              <CardTitle>{link.label}</CardTitle>
              <CardDescription>{link.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href={makeHref(link.href)}>Open {link.label}</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
