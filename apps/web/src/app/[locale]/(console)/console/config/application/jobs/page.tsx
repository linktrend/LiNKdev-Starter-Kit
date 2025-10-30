'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DevelopmentTasksSection } from '@/components/console/DevelopmentTasksSection';
import { BriefcaseBusiness } from 'lucide-react';

export default function ApplicationJobsPage() {
  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BriefcaseBusiness className="h-5 w-5" />
            Jobs/Queue
          </CardTitle>
          <CardDescription>Manage background jobs and queues</CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <DevelopmentTasksSection orgId={process.env.NEXT_PUBLIC_DEFAULT_ORG_ID || ''} />
        </CardContent>
      </Card>
    </div>
  );
}

