import { Metadata } from 'next';
import { Database, Table, Clock, HardDrive } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table as UITable, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export const metadata: Metadata = {
  title: 'Database Management'
};

export default function ConsoleDbPage() {
  // Mock database tables
  const mockTables = [
    { name: 'users', rows: 1247, size: '2.3 MB' },
    { name: 'records', rows: 5432, size: '8.7 MB' },
    { name: 'audit_logs', rows: 15678, size: '15.2 MB' },
    { name: 'sessions', rows: 234, size: '0.5 MB' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Database</h1>
        <p className="text-muted-foreground">
          View and manage database tables and migrations
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database Management
          </CardTitle>
          <CardDescription>
            View and manage database tables and migrations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <UITable>
              <TableHeader>
                <TableRow>
                  <TableHead className="flex items-center gap-2">
                    <Table className="h-4 w-4" />
                    Table Name
                  </TableHead>
                  <TableHead className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Rows
                  </TableHead>
                  <TableHead className="flex items-center gap-2">
                    <HardDrive className="h-4 w-4" />
                    Size
                  </TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockTables.map((table) => (
                  <TableRow key={table.name}>
                    <TableCell className="font-medium">{table.name}</TableCell>
                    <TableCell>{table.rows.toLocaleString()}</TableCell>
                    <TableCell>{table.size}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <button className="text-sm text-primary hover:underline">
                          View
                        </button>
                        <button className="text-sm text-primary hover:underline">
                          Migrate
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </UITable>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
