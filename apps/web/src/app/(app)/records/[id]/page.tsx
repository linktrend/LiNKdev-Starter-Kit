'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { ArrowLeft, Edit, Trash2, Calendar, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { RecordForm } from '@/components/records/RecordForm';
import { api } from '@/trpc/react';

export default function RecordDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const recordId = params.id as string;

  const { data: record, isLoading: recordLoading } = api.records.getRecord.useQuery({
    id: recordId,
  });

  const deleteRecordMutation = api.records.deleteRecord.useMutation({
    onSuccess: () => {
      router.push('/records');
    },
  });

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    setIsEditing(false);
    // Optionally refresh the record data
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteRecordMutation.mutateAsync({ id: recordId });
    } catch (error) {
      console.error('Failed to delete record:', error);
      setIsDeleting(false);
    }
  };

  const formatValue = (value: any, fieldType: string) => {
    if (value === null || value === undefined) return 'Not set';
    
    switch (fieldType) {
      case 'boolean':
        return value ? 'Yes' : 'No';
      case 'date':
        return new Date(value).toLocaleDateString();
      case 'textarea':
        return value;
      default:
        return String(value);
    }
  };

  if (recordLoading) {
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
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                  <div className="h-6 w-full bg-muted animate-pulse rounded" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!record) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">Record Not Found</h1>
        </div>
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <h3 className="text-lg font-semibold">Record not found</h3>
              <p className="text-muted-foreground mt-2">
                The record you're looking for doesn't exist or you don't have permission to view it.
              </p>
              <Button asChild className="mt-4">
                <a href="/records">Back to Records</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const recordType = record.record_type;

  if (isEditing && recordType) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={handleCancel}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">Edit Record</h1>
        </div>

        <Card>
          <CardContent className="pt-6">
            <RecordForm
              recordType={recordType}
              initialData={record.data}
              onSave={handleSave}
              onCancel={handleCancel}
              isEditing={true}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{recordType?.display_name || 'Record'}</h1>
            <p className="text-muted-foreground">
              {recordType?.description || 'View record details'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleEdit}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDelete}
            disabled={isDeleting}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Record Details */}
        <Card>
          <CardHeader>
            <CardTitle>Record Details</CardTitle>
            <CardDescription>
              Information stored in this record
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recordType?.config.fields.map((field: any) => (
              <div key={field.key} className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-muted-foreground">
                    {field.label}
                  </label>
                  {field.required && (
                    <Badge variant="secondary" className="text-xs">
                      Required
                    </Badge>
                  )}
                </div>
                <div className="text-sm">
                  {field.type === 'textarea' ? (
                    <div className="whitespace-pre-wrap p-3 bg-muted rounded-md">
                      {formatValue(record.data[field.key], field.type)}
                    </div>
                  ) : (
                    <div className="p-2 bg-muted rounded-md">
                      {formatValue(record.data[field.key], field.type)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Record Metadata */}
        <Card>
          <CardHeader>
            <CardTitle>Metadata</CardTitle>
            <CardDescription>
              System information about this record
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  Created
                </div>
                <div className="text-sm">
                  {new Date(record.created_at).toLocaleString()}
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  Updated
                </div>
                <div className="text-sm">
                  {new Date(record.updated_at).toLocaleString()}
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="h-4 w-4" />
                  Created by
                </div>
                <div className="text-sm">
                  {record.created_by}
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="h-4 w-4" />
                  Record ID
                </div>
                <div className="text-sm font-mono">
                  {record.id}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
