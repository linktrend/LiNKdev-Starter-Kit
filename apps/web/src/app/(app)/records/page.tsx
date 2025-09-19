'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, Database, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RecordTable } from '@/components/records/RecordTable';
import { api } from '@/trpc/react';

export default function RecordsPage() {
  const [selectedTypeId, setSelectedTypeId] = useState<string>('');
  
  const { data: recordTypes = [], isLoading: typesLoading } = api.records.listRecordTypes.useQuery();
  const { data: recordsData, isLoading: recordsLoading } = api.records.listRecords.useQuery({
    type_id: selectedTypeId || undefined,
    limit: 50,
  });

  const records = recordsData?.records || [];
  const selectedType = recordTypes.find(rt => rt.id === selectedTypeId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Records</h1>
          <p className="text-muted-foreground">
            Manage your data with flexible record types and custom fields
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Settings className="mr-2 h-4 w-4" />
            Manage Types
          </Button>
          <Button asChild>
            <Link href="/records/new">
              <Plus className="mr-2 h-4 w-4" />
              New Record
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Record Types Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Record Types
            </CardTitle>
            <CardDescription>
              Choose a record type to view and manage records
            </CardDescription>
          </CardHeader>
          <CardContent>
            {typesLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
                ))}
              </div>
            ) : recordTypes.length === 0 ? (
              <div className="text-center py-8">
                <Database className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">No record types found</h3>
                <p className="text-muted-foreground mt-2">
                  Create your first record type to get started
                </p>
                <Button asChild className="mt-4">
                  <Link href="/records/types/new">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Record Type
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recordTypes.map((type) => (
                  <Card
                    key={type.id}
                    className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                      selectedTypeId === type.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => setSelectedTypeId(type.id)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{type.display_name}</CardTitle>
                        <Badge variant="secondary">
                          {type.config.fields.length} fields
                        </Badge>
                      </div>
                      {type.description && (
                        <CardDescription className="text-sm">
                          {type.description}
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>Key: {type.key}</span>
                        {type.config.is_public && (
                          <Badge variant="outline" className="text-xs">
                            Public
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Records Table */}
        {selectedType && (
          <Card>
            <CardHeader>
              <CardTitle>{selectedType.display_name} Records</CardTitle>
              <CardDescription>
                {records.length} record{records.length !== 1 ? 's' : ''} found
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RecordTable
                records={records}
                recordType={selectedType}
                isLoading={recordsLoading}
                onEdit={(record) => {
                  // Navigate to edit page
                  window.location.href = `/records/${record.id}/edit`;
                }}
                onView={(record) => {
                  // Navigate to view page
                  window.location.href = `/records/${record.id}`;
                }}
              />
            </CardContent>
          </Card>
        )}

        {/* No type selected */}
        {!selectedTypeId && recordTypes.length > 0 && (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <Database className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">Select a record type</h3>
                <p className="text-muted-foreground mt-2">
                  Choose a record type above to view and manage records
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
