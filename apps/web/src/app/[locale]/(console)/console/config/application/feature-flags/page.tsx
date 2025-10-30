'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ConsoleFlagsPage } from '@/components/console/ConsoleFlagsPage';
import { Flag } from 'lucide-react';

export default function ApplicationFeatureFlagsPage() {
  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flag className="h-5 w-5" />
            Feature Flags
          </CardTitle>
          <CardDescription>Manage feature flags and toggles</CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <ConsoleFlagsPage />
        </CardContent>
      </Card>
    </div>
  );
}

