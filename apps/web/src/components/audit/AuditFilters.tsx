'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Search, 
  Filter, 
  Download, 
  Calendar as CalendarIcon,
  X
} from 'lucide-react';
import { format } from 'date-fns';

interface AuditFiltersProps {
  filters: {
    q?: string;
    entityType?: string;
    action?: string;
    actorId?: string;
    from?: string;
    to?: string;
  };
  onFiltersChange: (filters: Partial<AuditFiltersProps['filters']>) => void;
  onExport: () => void;
  isLoading?: boolean;
}

const ENTITY_TYPES = [
  { value: 'org', label: 'Organization' },
  { value: 'record', label: 'Record' },
  { value: 'reminder', label: 'Reminder' },
  { value: 'subscription', label: 'Subscription' },
  { value: 'member', label: 'Member' },
  { value: 'invite', label: 'Invite' },
  { value: 'schedule', label: 'Schedule' },
  { value: 'automation', label: 'Automation' },
];

const ACTIONS = [
  { value: 'created', label: 'Created' },
  { value: 'updated', label: 'Updated' },
  { value: 'deleted', label: 'Deleted' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'invited', label: 'Invited' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'role_changed', label: 'Role Changed' },
  { value: 'removed', label: 'Removed' },
  { value: 'started', label: 'Started' },
  { value: 'stopped', label: 'Stopped' },
  { value: 'failed', label: 'Failed' },
  { value: 'succeeded', label: 'Succeeded' },
];

export function AuditFilters({ 
  filters, 
  onFiltersChange, 
  onExport, 
  isLoading = false 
}: AuditFiltersProps): React.ReactElement {
  const [isOpen, setIsOpen] = React.useState(false);

  const handleFilterChange = (key: keyof typeof filters, value: string | undefined) => {
    onFiltersChange({ [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({
      q: undefined,
      entityType: undefined,
      action: undefined,
      actorId: undefined,
      from: undefined,
      to: undefined,
    });
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== undefined);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
              >
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={onExport}
              disabled={isLoading}
            >
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Search */}
          <div className="space-y-2">
            <Label htmlFor="search">Search</Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Search logs..."
                value={filters.q || ''}
                onChange={(e) => handleFilterChange('q', e.target.value || undefined)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Entity Type */}
          <div className="space-y-2">
            <Label>Entity Type</Label>
            <Select
              value={filters.entityType || ''}
              onValueChange={(value) => handleFilterChange('entityType', value || undefined)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All entity types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All entity types</SelectItem>
                {ENTITY_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Action */}
          <div className="space-y-2">
            <Label>Action</Label>
            <Select
              value={filters.action || ''}
              onValueChange={(value) => handleFilterChange('action', value || undefined)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All actions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All actions</SelectItem>
                {ACTIONS.map((action) => (
                  <SelectItem key={action.value} value={action.value}>
                    {action.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Actor ID */}
          <div className="space-y-2">
            <Label htmlFor="actorId">Actor ID</Label>
            <Input
              id="actorId"
              placeholder="User ID"
              value={filters.actorId || ''}
              onChange={(e) => handleFilterChange('actorId', e.target.value || undefined)}
            />
          </div>

          {/* Date From */}
          <div className="space-y-2">
            <Label>From Date</Label>
            <Popover open={isOpen} onOpenChange={setIsOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.from ? format(new Date(filters.from), 'PPP') : 'Select date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={filters.from ? new Date(filters.from) : undefined}
                  onSelect={(date) => {
                    handleFilterChange('from', date ? date.toISOString() : undefined);
                    setIsOpen(false);
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Date To */}
          <div className="space-y-2">
            <Label>To Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.to ? format(new Date(filters.to), 'PPP') : 'Select date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={filters.to ? new Date(filters.to) : undefined}
                  onSelect={(date) => {
                    handleFilterChange('to', date ? date.toISOString() : undefined);
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
