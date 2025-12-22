 'use client';

import React from 'react';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Filter,
  Search,
  XCircle,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/utils/cn';
import type { ErrorLogRecord, Severity } from '@/app/actions/errors';

export type ErrorListFilters = {
  severity?: Severity | 'all';
  resolved?: boolean | 'all';
  search?: string;
  sort?: 'newest' | 'oldest' | 'severity' | 'occurrences';
};

type Props = {
  errors: ErrorLogRecord[];
  loading?: boolean;
  selectedId?: string | null;
  filters: ErrorListFilters;
  onChangeFilters: (filters: ErrorListFilters) => void;
  onSelect: (id: string) => void;
  onResolve: (ids: string[]) => Promise<void> | void;
  onDelete: (ids: string[]) => Promise<void> | void;
};

export function ErrorList({
  errors,
  loading,
  selectedId,
  filters,
  onChangeFilters,
  onSelect,
  onResolve,
  onDelete,
}: Props) {
  const [expanded, setExpanded] = React.useState<Set<string>>(new Set());
  const [selected, setSelected] = React.useState<Set<string>>(new Set());

  const toggleExpanded = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleSelected = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selected.size === errors.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(errors.map((e) => e.id)));
    }
  };

  const bulkResolve = () => {
    if (selected.size === 0) return;
    onResolve(Array.from(selected));
    setSelected(new Set());
  };

  const bulkDelete = () => {
    if (selected.size === 0) return;
    onDelete(Array.from(selected));
    setSelected(new Set());
  };

  const severityIcon = (severity: Severity) => {
    switch (severity) {
      case 'critical':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      default:
        return <Clock className="h-4 w-4 text-slate-400" />;
    }
  };

  const severityBadge = (severity: Severity) => {
    const tone =
      severity === 'critical'
        ? 'bg-red-100 text-red-800'
        : severity === 'error'
        ? 'bg-rose-100 text-rose-800'
        : severity === 'warning'
        ? 'bg-amber-100 text-amber-800'
        : 'bg-blue-100 text-blue-800';
    return <Badge className={cn('capitalize', tone)}>{severity}</Badge>;
  };

  const statusBadge = (resolved: boolean) =>
    resolved ? (
      <Badge variant="outline" className="text-emerald-700 border-emerald-200 bg-emerald-50">
        <CheckCircle2 className="h-3 w-3 mr-1" />
        Resolved
      </Badge>
    ) : (
      <Badge variant="outline" className="text-amber-700 border-amber-200 bg-amber-50">
        Open
      </Badge>
    );

  return (
    <div className="space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-center gap-3 justify-between">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative">
            <Search className="h-4 w-4 text-muted-foreground absolute left-2 top-2.5" />
            <Input
              placeholder="Search message, stack, page"
              className="pl-8 w-64"
              value={filters.search ?? ''}
              onChange={(e) => onChangeFilters({ ...filters, search: e.target.value })}
            />
          </div>
          <Select
            value={filters.severity ?? 'all'}
            onValueChange={(value) =>
              onChangeFilters({ ...filters, severity: value as Severity | 'all' })
            }
          >
            <SelectTrigger className="w-40">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All severities</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="error">Error</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
              <SelectItem value="info">Info</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={String(filters.resolved ?? 'all')}
            onValueChange={(value) =>
              onChangeFilters({
                ...filters,
                resolved: value === 'all' ? undefined : value === 'true',
              })
            }
          >
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All status</SelectItem>
              <SelectItem value="false">Open</SelectItem>
              <SelectItem value="true">Resolved</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={filters.sort ?? 'newest'}
            onValueChange={(value) => onChangeFilters({ ...filters, sort: value as any })}
          >
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
              <SelectItem value="severity">Severity</SelectItem>
              <SelectItem value="occurrences">Occurrences</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled={selected.size === 0} onClick={bulkResolve}>
            Mark resolved ({selected.size})
          </Button>
          <Button variant="destructive" size="sm" disabled={selected.size === 0} onClick={bulkDelete}>
            Delete ({selected.size})
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <Checkbox
                  checked={selected.size === errors.length && errors.length > 0}
                  onCheckedChange={toggleSelectAll}
                  aria-label="Select all"
                />
              </TableHead>
              <TableHead className="w-10"></TableHead>
              <TableHead>Message</TableHead>
              <TableHead className="hidden md:table-cell">Severity</TableHead>
              <TableHead className="hidden lg:table-cell">Page</TableHead>
              <TableHead className="hidden lg:table-cell">User</TableHead>
              <TableHead className="hidden sm:table-cell">Occurrences</TableHead>
              <TableHead className="hidden sm:table-cell">Status</TableHead>
              <TableHead className="hidden md:table-cell">Last seen</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {errors.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-sm text-muted-foreground py-6">
                  {loading ? 'Loading errors…' : 'No errors found'}
                </TableCell>
              </TableRow>
            )}
            {errors.map((err) => {
              const isExpanded = expanded.has(err.id);
              return (
                <React.Fragment key={err.id}>
                  <TableRow
                    className={cn('cursor-pointer', selectedId === err.id && 'bg-muted/50')}
                    onClick={() => onSelect(err.id)}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selected.has(err.id)}
                        onCheckedChange={() => toggleSelected(err.id)}
                        aria-label="Select row"
                      />
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <button
                        className="text-muted-foreground hover:text-foreground"
                        onClick={() => toggleExpanded(err.id)}
                      >
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </button>
                    </TableCell>
                    <TableCell className="max-w-[260px]">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          {severityIcon(err.severity as Severity)}
                          <span className="font-medium line-clamp-2">{err.message ?? 'Unknown error'}</span>
                        </div>
                        <div className="text-xs text-muted-foreground line-clamp-1">
                          {err.stack_trace?.split('\n')[0] ?? 'No stack trace'}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{severityBadge(err.severity as Severity)}</TableCell>
                    <TableCell className="hidden lg:table-cell max-w-[180px] truncate">
                      {err.page_url ?? '–'}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <Badge variant="outline" className="font-mono text-xs">
                        {err.user_id ?? 'anon'}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">{err.occurrence_count ?? 1}</TableCell>
                    <TableCell className="hidden sm:table-cell">{statusBadge(err.resolved)}</TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                      {new Date(err.last_seen).toLocaleString()}
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onResolve([err.id])}
                          disabled={err.resolved}
                        >
                          Resolve
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => onDelete([err.id])}>
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  {isExpanded && (
                    <TableRow className="bg-muted/40">
                      <TableCell colSpan={10}>
                        <div className="text-xs text-muted-foreground font-mono whitespace-pre-wrap">
                          {err.stack_trace ?? 'No stack trace'}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
