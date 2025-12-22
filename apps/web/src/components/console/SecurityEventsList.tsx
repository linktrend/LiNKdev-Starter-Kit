'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { getBadgeClasses, type PresetKey } from '@/components/ui/badge.presets';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TableContainer } from '@/components/ui/table-container';
import { DateTimeCell, UserOrgCell } from '@/components/ui/table-utils';
import { TableHeadText, TableHeadStatus, TableCellText, TableCellStatus, ActionIconsCell } from '@/components/ui/table-cells';
import { TableHeadAction, TableCellAction } from '@/components/ui/table-columns';
import { Search, Eye, Download, Clock } from 'lucide-react';
import { getUserDisplay } from '@/utils/userDisplay';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export interface SecurityEvent {
  id: string;
  org_id: string;
  actor_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string;
  metadata: Record<string, any>;
  created_at: string;
}

interface SecurityEventsListProps {
  events: SecurityEvent[];
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoading?: boolean;
}

export function SecurityEventsList({
  events,
  onLoadMore,
  hasMore = false,
  isLoading = false,
}: SecurityEventsListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<SecurityEvent | null>(null);
  const [timeFilter, setTimeFilter] = useState<'all' | '24h' | '7d' | '30d'>('all');

  const filteredEvents = events.filter((event) => {
    // Time filter
    if (timeFilter !== 'all') {
      const eventTime = new Date(event.created_at).getTime();
      const now = Date.now();
      const timeRanges = {
        '24h': 24 * 60 * 60 * 1000,
        '7d': 7 * 24 * 60 * 60 * 1000,
        '30d': 30 * 24 * 60 * 60 * 1000,
      };
      if (now - eventTime > timeRanges[timeFilter]) {
        return false;
      }
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const action = event.action.toLowerCase();
      const entityType = event.entity_type.toLowerCase();
      const metadata = JSON.stringify(event.metadata).toLowerCase();
      return action.includes(query) || entityType.includes(query) || metadata.includes(query);
    }

    return true;
  });

  const getActionBadge = (action: string): PresetKey => {
    if (action.includes('invited') || action.includes('created')) return 'success.soft';
    if (action.includes('role_changed') || action.includes('updated')) return 'info.soft';
    if (action.includes('removed') || action.includes('revoked') || action.includes('deleted')) return 'danger.soft';
    if (action.includes('2fa') || action.includes('password')) return 'warning.soft';
    return 'outline';
  };

  const getActionLabel = (action: string): string => {
    return action
      .split('.')
      .pop()
      ?.replace(/_/g, ' ')
      .replace(/\b\w/g, (l) => l.toUpperCase()) || action;
  };

  const getEntityTypeLabel = (entityType: string): string => {
    return entityType
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const handleExport = () => {
    const csv = [
      ['Timestamp', 'Action', 'Entity Type', 'Actor ID', 'Details'].join(','),
      ...filteredEvents.map((event) =>
        [
          event.created_at,
          event.action,
          event.entity_type,
          event.actor_id || 'system',
          JSON.stringify(event.metadata).replace(/,/g, ';'),
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `security-events-${new Date().toISOString()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search events..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value as typeof timeFilter)}
              className="px-3 py-2 border rounded-lg text-sm bg-background"
            >
              <option value="all">All Time</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>
            <Button variant="outline" onClick={handleExport} disabled={filteredEvents.length === 0}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        <TableContainer id="security-events-table" height="lg">
          <Table className="min-w-[1000px] [&_th]:px-4 [&_td]:px-4 [&_th]:py-3 [&_td]:py-4">
            <TableHeader>
              <TableRow>
                <TableHeadText className="w-40">Timestamp</TableHeadText>
                <TableHeadStatus className="w-40">Action</TableHeadStatus>
                <TableHeadText className="w-32">Entity Type</TableHeadText>
                <TableHeadText className="min-w-0">Actor</TableHeadText>
                <TableHeadAction className="w-32">Details</TableHeadAction>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    Loading events...
                  </TableCell>
                </TableRow>
              ) : filteredEvents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No security events found
                  </TableCell>
                </TableRow>
              ) : (
                <>
                  {filteredEvents.map((event) => (
                    <TableRow key={event.id}>
                      <TableCellText className="w-40">
                        <DateTimeCell date={new Date(event.created_at)} />
                      </TableCellText>
                      <TableCellStatus className="w-40">
                        <Badge className={getBadgeClasses(getActionBadge(event.action))}>
                          {getActionLabel(event.action)}
                        </Badge>
                      </TableCellStatus>
                      <TableCellText className="w-32">
                        <span className="text-sm">{getEntityTypeLabel(event.entity_type)}</span>
                      </TableCellText>
                      <TableCellText className="min-w-0">
                        {event.actor_id ? (
                          <span className="text-sm truncate">{event.actor_id.slice(0, 8)}...</span>
                        ) : (
                          <Badge variant="outline" className="text-xs">
                            System
                          </Badge>
                        )}
                      </TableCellText>
                      <TableCellAction className="w-32">
                        <ActionIconsCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSelectedEvent(event)}
                            title="View details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </ActionIconsCell>
                      </TableCellAction>
                    </TableRow>
                  ))}
                  {hasMore && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4">
                        <Button variant="outline" onClick={onLoadMore} disabled={isLoading}>
                          Load More
                        </Button>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </div>

      {/* Event Details Dialog */}
      <Dialog open={!!selectedEvent} onOpenChange={(open) => !open && setSelectedEvent(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Security Event Details</DialogTitle>
            <DialogDescription>
              {selectedEvent && (
                <span className="text-xs">
                  Event ID: {selectedEvent.id}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          {selectedEvent && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Timestamp</div>
                  <div className="text-sm mt-1">
                    {new Date(selectedEvent.created_at).toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Action</div>
                  <div className="mt-1">
                    <Badge className={getBadgeClasses(getActionBadge(selectedEvent.action))}>
                      {getActionLabel(selectedEvent.action)}
                    </Badge>
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Entity Type</div>
                  <div className="text-sm mt-1">{getEntityTypeLabel(selectedEvent.entity_type)}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Entity ID</div>
                  <div className="text-sm mt-1 font-mono truncate">{selectedEvent.entity_id}</div>
                </div>
                <div className="col-span-2">
                  <div className="text-sm font-medium text-muted-foreground">Actor</div>
                  <div className="text-sm mt-1 font-mono">
                    {selectedEvent.actor_id || (
                      <Badge variant="outline" className="text-xs">
                        System
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {Object.keys(selectedEvent.metadata).length > 0 && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-2">Metadata</div>
                  <div className="rounded-lg bg-muted p-3">
                    <pre className="text-xs overflow-auto max-h-64">
                      {JSON.stringify(selectedEvent.metadata, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
