'use client';

/**
 * Table Browser Component
 * Lists all database tables with metadata and schema viewing
 */

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getBadgeClasses } from '@/components/ui/badge.presets';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TableContainer } from '@/components/ui/table-container';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Search, Eye, RefreshCw, CheckCircle2, XCircle } from 'lucide-react';
import type { TableInfo, TableSchema } from '@/lib/database/stats';

interface TableBrowserProps {
  tables: TableInfo[];
  onViewData: (tableName: string) => void;
  onRefresh: () => void;
  isLoading?: boolean;
}

export function TableBrowser({ tables, onViewData, onRefresh, isLoading = false }: TableBrowserProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTable, setSelectedTable] = useState<TableInfo | null>(null);
  const [tableSchema, setTableSchema] = useState<TableSchema[]>([]);
  const [loadingSchema, setLoadingSchema] = useState(false);

  const filteredTables = tables.filter(
    (table) =>
      table.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (table.description && table.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleViewSchema = async (table: TableInfo) => {
    setSelectedTable(table);
    setLoadingSchema(true);
    
    try {
      const { getTableSchemaInfo } = await import('@/app/actions/database');
      const schema = await getTableSchemaInfo(table.name);
      setTableSchema(schema);
    } catch (error) {
      console.error('Error loading table schema:', error);
      setTableSchema([]);
    } finally {
      setLoadingSchema(false);
    }
  };

  const totalRows = tables.reduce((sum, table) => sum + table.rows, 0);

  return (
    <div className="space-y-4">
      {/* Search and actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tables..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {filteredTables.length} tables • {totalRows.toLocaleString()} total rows
          </span>
          <Button variant="outline" size="sm" onClick={onRefresh} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Tables list */}
      <TableContainer id="table-browser-table" height="lg">
        <Table className="min-w-[960px]">
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[200px] max-w-[240px]">Table Name</TableHead>
              <TableHead className="min-w-[120px] max-w-[140px] text-right">Rows</TableHead>
              <TableHead className="min-w-[120px] max-w-[140px]">Size</TableHead>
              <TableHead className="hidden lg:table-cell min-w-[300px] max-w-[400px]">
                Description
              </TableHead>
              <TableHead className="min-w-[100px] max-w-[120px] text-center">RLS</TableHead>
              <TableHead className="min-w-[180px] max-w-[200px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTables.map((table) => (
              <TableRow key={table.name}>
                <TableCell className="min-w-[200px] max-w-[240px]">
                  <div className="flex flex-col gap-1">
                    <span className="font-medium font-mono">{table.name}</span>
                    <span className="text-xs text-muted-foreground lg:hidden">
                      {table.description || 'No description'}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="min-w-[120px] max-w-[140px] text-right">
                  {table.rows.toLocaleString()}
                </TableCell>
                <TableCell className="min-w-[120px] max-w-[140px]">{table.size}</TableCell>
                <TableCell className="hidden lg:table-cell min-w-[300px] max-w-[400px] text-muted-foreground text-sm">
                  {table.description || 'No description'}
                </TableCell>
                <TableCell className="min-w-[100px] max-w-[120px] text-center">
                  {table.rls ? (
                    <div className="flex items-center justify-center">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                    </div>
                  )}
                </TableCell>
                <TableCell className="min-w-[180px] max-w-[200px]">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewSchema(table)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Schema
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewData(table.name)}
                    >
                      View Data
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {filteredTables.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No tables found matching &quot;{searchTerm}&quot;
        </div>
      )}

      {/* Schema Dialog */}
      <Dialog open={selectedTable !== null} onOpenChange={(open) => !open && setSelectedTable(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-mono">{selectedTable?.name}</DialogTitle>
            <DialogDescription>
              {selectedTable?.description || 'Table schema and column definitions'}
            </DialogDescription>
          </DialogHeader>

          {selectedTable && (
            <div className="space-y-4">
              {/* Table metadata */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-muted rounded-lg">
                <div>
                  <span className="text-sm font-medium">Rows:</span>
                  <p className="text-sm text-muted-foreground">
                    {selectedTable.rows.toLocaleString()}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium">Size:</span>
                  <p className="text-sm text-muted-foreground">{selectedTable.size}</p>
                </div>
                <div>
                  <span className="text-sm font-medium">Schema:</span>
                  <p className="text-sm text-muted-foreground">{selectedTable.schema}</p>
                </div>
                <div>
                  <span className="text-sm font-medium">RLS:</span>
                  <p className="text-sm text-muted-foreground">
                    {selectedTable.rls ? 'Enabled' : 'Disabled'}
                  </p>
                </div>
              </div>

              {/* Schema table */}
              {loadingSchema ? (
                <div className="flex items-center justify-center py-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                </div>
              ) : tableSchema.length > 0 ? (
                <TableContainer id="table-schema-dialog" height="md">
                  <Table className="min-w-[720px]">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[180px] max-w-[220px]">Column Name</TableHead>
                        <TableHead className="min-w-[160px] max-w-[200px]">Data Type</TableHead>
                        <TableHead className="min-w-[100px] max-w-[120px]">Nullable</TableHead>
                        <TableHead className="min-w-[180px] max-w-[220px]">Default</TableHead>
                        <TableHead className="min-w-[200px] max-w-[260px]">Description</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tableSchema.map((column) => (
                        <TableRow key={column.columnName}>
                          <TableCell className="min-w-[180px] max-w-[220px] font-medium font-mono">
                            {column.columnName}
                          </TableCell>
                          <TableCell className="min-w-[160px] max-w-[200px] font-mono text-sm">
                            {column.dataType}
                          </TableCell>
                          <TableCell className="min-w-[100px] max-w-[120px]">
                            {column.isNullable ? (
                              <Badge className={getBadgeClasses('boolean.yes')}>Yes</Badge>
                            ) : (
                              <Badge className={getBadgeClasses('boolean.no')}>No</Badge>
                            )}
                          </TableCell>
                          <TableCell className="min-w-[180px] max-w-[220px] font-mono text-sm text-muted-foreground">
                            {column.columnDefault || '-'}
                          </TableCell>
                          <TableCell className="min-w-[200px] max-w-[260px] text-sm text-muted-foreground">
                            {column.description || '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No schema information available
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
