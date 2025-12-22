'use client';

import { Filter, UsersIcon } from 'lucide-react';
import type { AuditAction, AuditEntityType } from '@starter/types';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { DateRangeSelector } from './DateRangeSelector';
import type { AuditFilters } from '@/hooks/useAuditLogs';

const ACTION_OPTIONS: AuditAction[] = [
  'created',
  'updated',
  'deleted',
  'completed',
  'snoozed',
  'cancelled',
  'invited',
  'accepted',
  'rejected',
  'role_changed',
  'removed',
  'started',
  'stopped',
  'failed',
  'succeeded',
];

const ENTITY_OPTIONS: AuditEntityType[] = [
  'org',
  'record',
  'reminder',
  'subscription',
  'member',
  'invite',
  'schedule',
  'automation',
];

type Member = {
  user_id: string;
  role?: string;
  user?: {
    full_name?: string | null;
    email?: string | null;
  };
};

type Props = {
  filters: AuditFilters;
  onChange: (next: AuditFilters) => void;
  onClear: () => void;
  members: Member[];
  loadingMembers?: boolean;
};

export function AuditFilterPanel({ filters, onChange, onClear, members, loadingMembers }: Props) {
  return (
    <div className="space-y-4 rounded-lg border bg-card p-4">
      <div className="flex items-center gap-2 text-sm font-semibold">
        <Filter className="h-4 w-4" />
        Filters
      </div>

      <div className="space-y-3">
        <div className="space-y-2">
          <Label htmlFor="action">Action</Label>
          <Select
            value={filters.action ?? 'all'}
            onValueChange={(value) =>
              onChange({ ...filters, action: value === 'all' ? undefined : value })
            }
          >
            <SelectTrigger id="action">
              <SelectValue placeholder="Any action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All actions</SelectItem>
              {ACTION_OPTIONS.map((action) => (
                <SelectItem key={action} value={action}>
                  {action.replace(/_/g, ' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="entity">Entity type</Label>
          <Select
            value={filters.entityType ?? 'all'}
            onValueChange={(value) =>
              onChange({ ...filters, entityType: value === 'all' ? undefined : value })
            }
          >
            <SelectTrigger id="entity">
              <SelectValue placeholder="Any entity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All entities</SelectItem>
              {ENTITY_OPTIONS.map((entity) => (
                <SelectItem key={entity} value={entity}>
                  {entity.replace(/_/g, ' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="actor" className="flex items-center gap-1">
              <UsersIcon className="h-4 w-4" />
              User
            </Label>
            {loadingMembers && <span className="text-xs text-muted-foreground">Loading…</span>}
          </div>
          <Select
            value={filters.actorId ?? 'all'}
            onValueChange={(value) =>
              onChange({ ...filters, actorId: value === 'all' ? undefined : value })
            }
          >
            <SelectTrigger id="actor">
              <SelectValue placeholder="Any user" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All users</SelectItem>
              {members.map((member) => (
                <SelectItem key={member.user_id} value={member.user_id}>
                  {member.user?.full_name || member.user?.email || member.user_id}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Date range</Label>
          <DateRangeSelector
            dateRange={filters.dateRange}
            onChange={(range) => onChange({ ...filters, dateRange: range })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="search">Search</Label>
          <Input
            id="search"
            placeholder="Full-text search…"
            value={filters.search ?? ''}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
          />
          <p className="text-xs text-muted-foreground">
            Searches action, entity type, entity id, and metadata.
          </p>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <Button variant="outline" size="sm" onClick={onClear}>
          Clear filters
        </Button>
        <div className="text-xs text-muted-foreground">
          {filters.action || filters.entityType || filters.actorId || filters.search
            ? 'Filters applied'
            : 'No filters'}
        </div>
      </div>
    </div>
  );
}
