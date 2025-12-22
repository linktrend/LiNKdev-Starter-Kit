'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { ErrorLogRecord, Severity } from '@/app/actions/errors';
import { cn } from '@/utils/cn';

type Props = {
  error?: ErrorLogRecord | null;
  loading?: boolean;
  similar?: ErrorLogRecord[];
  onResolve: (ids: string[]) => Promise<void> | void;
  onDelete: (ids: string[]) => Promise<void> | void;
};

const severityTone: Record<Severity, string> = {
  critical: 'bg-red-100 text-red-800',
  error: 'bg-rose-100 text-rose-800',
  warning: 'bg-amber-100 text-amber-800',
  info: 'bg-blue-100 text-blue-800',
};

export function ErrorDetails({ error, loading, similar = [], onResolve, onDelete }: Props) {
  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading error details…</p>;
  }

  if (!error) {
    return <p className="text-sm text-muted-foreground">Select an error to view details.</p>;
  }

  return (
    <Card className="h-full">
      <CardHeader className="space-y-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg leading-tight flex items-center gap-2">
            <Badge className={cn('capitalize', severityTone[error.severity as Severity])}>
              {error.severity}
            </Badge>
            <span className="line-clamp-2">{error.message ?? 'Unknown error'}</span>
          </CardTitle>
        </div>
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          <span>Occurrences: {error.occurrence_count ?? 1}</span>
          <span>First: {new Date(error.first_seen).toLocaleString()}</span>
          <span>Last: {new Date(error.last_seen).toLocaleString()}</span>
          <Badge variant="outline" className="text-xs">
            {error.resolved ? 'Resolved' : 'Open'}
          </Badge>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled={error.resolved} onClick={() => onResolve([error.id])}>
            Mark resolved
          </Button>
          <Button variant="destructive" size="sm" onClick={() => onDelete([error.id])}>
            Delete
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <DetailItem label="User" value={error.user_id ?? 'Anonymous'} />
          <DetailItem label="Organization" value={error.org_id ?? 'Unknown'} />
          <DetailItem label="Page URL" value={error.page_url ?? '–'} />
          <DetailItem label="User Agent" value={error.user_agent ?? '–'} />
          <DetailItem label="Grouping" value={error.grouping_hash ?? '–'} />
          <DetailItem label="Action" value={error.action ?? 'error.logged'} />
        </div>

        <Tabs defaultValue="stack" className="w-full">
          <TabsList>
            <TabsTrigger value="stack">Stack trace</TabsTrigger>
            <TabsTrigger value="metadata">Metadata</TabsTrigger>
            <TabsTrigger value="similar">Similar errors</TabsTrigger>
          </TabsList>
          <TabsContent value="stack" className="mt-3">
            <pre className="text-xs bg-muted p-3 rounded border overflow-auto max-h-64 whitespace-pre-wrap">
              {error.stack_trace ?? 'No stack trace'}
            </pre>
            {error.component_stack ? (
              <div className="mt-3">
                <p className="text-xs font-semibold mb-1">Component stack</p>
                <pre className="text-xs bg-muted p-3 rounded border overflow-auto max-h-48 whitespace-pre-wrap">
                  {error.component_stack}
                </pre>
              </div>
            ) : null}
          </TabsContent>
          <TabsContent value="metadata" className="mt-3">
            <pre className="text-xs bg-muted p-3 rounded border overflow-auto max-h-64 whitespace-pre-wrap">
              {JSON.stringify(error.metadata ?? {}, null, 2)}
            </pre>
          </TabsContent>
          <TabsContent value="similar" className="mt-3 space-y-2">
            {similar.length === 0 && (
              <p className="text-xs text-muted-foreground">No similar errors for this group.</p>
            )}
            {similar.map((item) => (
              <div key={item.id} className="border rounded-md p-3 text-xs space-y-1">
                <div className="flex items-center gap-2">
                  <Badge className={cn('capitalize', severityTone[item.severity as Severity])}>
                    {item.severity}
                  </Badge>
                  <span className="font-medium">{item.message}</span>
                </div>
                <div className="text-muted-foreground">
                  Last seen {new Date(item.last_seen).toLocaleString()} • {item.occurrence_count ?? 1} occurrences
                </div>
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium break-words">{value}</span>
    </div>
  );
}
