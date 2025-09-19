'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RecordForm } from '@/components/records/RecordForm';
import { api } from '@/trpc/react';

export default function NewRecordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const typeId = searchParams.get('type');
  const typeKey = searchParams.get('typeKey');

  const { data: recordType, isLoading: typeLoading } = api.records.getRecordType.useQuery(
    { id: typeId! },
    { enabled: !!typeId }
  );

  const { data: recordTypeByKey, isLoading: typeByKeyLoading } = api.records.getRecordTypeByKey.useQuery(
    { key: typeKey! },
    { enabled: !!typeKey && !typeId }
  );

  const { data: recordTypes, isLoading: typesLoading } = api.records.listRecordTypes.useQuery();

  const actualRecordType = recordType || recordTypeByKey;
  const isLoading = typeLoading || typeByKeyLoading;

  const handleSave = () => {
    setIsSubmitting(true);
    // Navigate back to records page after successful save
    setTimeout(() => {
      router.push('/records');
    }, 1000);
  };

  const handleCancel = () => {
    router.back();
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" disabled>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        </div>
        <Card>
          <CardHeader>
            <div className="h-6 w-64 bg-muted animate-pulse rounded" />
            <div className="h-4 w-96 bg-muted animate-pulse rounded" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                  <div className="h-10 w-full bg-muted animate-pulse rounded" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!actualRecordType) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={handleCancel}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">Create Record</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Select Record Type</CardTitle>
            <CardDescription>
              Choose a record type to create a new record
            </CardDescription>
          </CardHeader>
          <CardContent>
            {typesLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
                ))}
              </div>
            ) : recordTypes?.length === 0 ? (
              <div className="text-center py-8">
                <h3 className="text-lg font-semibold">No record types available</h3>
                <p className="text-muted-foreground mt-2">
                  Create a record type first to start creating records
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recordTypes?.map((type) => (
                  <Card
                    key={type.id}
                    className="cursor-pointer transition-colors hover:bg-muted/50"
                    onClick={() => router.push(`/records/new?type=${type.id}`)}
                  >
                    <CardHeader>
                      <CardTitle className="text-lg">{type.display_name}</CardTitle>
                      {type.description && (
                        <CardDescription>{type.description}</CardDescription>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm text-muted-foreground">
                        {type.config.fields.length} fields
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={handleCancel}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h1 className="text-3xl font-bold">Create Record</h1>
      </div>

      <Card>
        <CardContent className="pt-6">
          <RecordForm
            recordType={actualRecordType}
            onSave={handleSave}
            onCancel={handleCancel}
            isEditing={false}
          />
        </CardContent>
      </Card>
    </div>
  );
}
