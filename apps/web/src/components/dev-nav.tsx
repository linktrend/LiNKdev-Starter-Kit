'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@starter/ui';
import { Button } from '@starter/ui';
import { Badge } from '@starter/ui';
import { 
  User, 
  Settings, 
  Building2, 
  Users, 
  CreditCard, 
  Database, 
  HelpCircle,
  ExternalLink
} from 'lucide-react';
import Link from 'next/link';

export function DevNav() {
  const pages = [
    {
      title: 'User Pages',
      description: 'Personal user account pages',
      pages: [
        { href: '/profile', label: 'Profile', icon: User, description: 'User profile overview' },
        { href: '/settings/account', label: 'Account Settings', icon: Settings, description: 'Account settings and preferences' },
      ]
    },
    {
      title: 'Organization Pages',
      description: 'Organization management pages',
      pages: [
        { href: '/org/org-1', label: 'Org Dashboard', icon: Building2, description: 'Organization dashboard' },
        { href: '/org/org-1/settings', label: 'Org Settings', icon: Settings, description: 'Organization settings' },
        { href: '/org/org-1/team', label: 'Team Management', icon: Users, description: 'Team members and invitations' },
        { href: '/org/org-1/billing', label: 'Billing & Plans', icon: CreditCard, description: 'Billing and subscription management' },
      ]
    },
    {
      title: 'Records Pages',
      description: 'Data management pages',
      pages: [
        { href: '/records', label: 'Records List', icon: Database, description: 'View and manage records' },
        { href: '/records/record-1', label: 'Record Detail', icon: Database, description: 'Individual record details' },
      ]
    },
    {
      title: 'Support Pages',
      description: 'Help and support pages',
      pages: [
        { href: '/help', label: 'Help Center', icon: HelpCircle, description: 'Help center and documentation' },
      ]
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Developer Navigation</h2>
        <p className="text-muted-foreground">
          Quick access to all page shells created in this batch
        </p>
        <Badge variant="outline" className="mt-2">
          TODO: Remove when design system nav lands
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {pages.map((section, sectionIndex) => (
          <Card key={sectionIndex}>
            <CardHeader>
              <CardTitle className="text-lg">{section.title}</CardTitle>
              <CardDescription>{section.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {section.pages.map((page, pageIndex) => {
                const IconComponent = page.icon;
                return (
                  <div key={pageIndex} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center space-x-3">
                      <IconComponent className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{page.label}</p>
                        <p className="text-xs text-muted-foreground">{page.description}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={page.href}>
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-muted/50">
        <CardContent className="p-6 text-center">
          <h3 className="font-semibold mb-2">Page Shell Status</h3>
          <p className="text-sm text-muted-foreground mb-4">
            All page shells are created with minimal layouts, auth guards, and TODO placeholders for data integration.
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            <Badge variant="default">Auth Guards ✓</Badge>
            <Badge variant="default">Org Guards ✓</Badge>
            <Badge variant="default">Minimal Layout ✓</Badge>
            <Badge variant="default">TODO Placeholders ✓</Badge>
            <Badge variant="outline">Design System Pending</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
