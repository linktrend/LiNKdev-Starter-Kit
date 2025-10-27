'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ReminderForm } from '@/components/scheduling/ReminderForm';

export default function NewReminderPage() {
  const router = useRouter();
  const [orgId] = useState('org-1'); // In real app, get from context

  const handleSave = () => {
    // Navigate back to reminders page after successful save
    router.push('/reminders');
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={handleCancel}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h1 className="text-3xl font-bold">Create Reminder</h1>
      </div>

      <Card>
        <CardContent className="pt-6">
          <ReminderForm
            orgId={orgId}
            onSave={handleSave}
            onCancel={handleCancel}
            isEditing={false}
          />
        </CardContent>
      </Card>
    </div>
  );
}
