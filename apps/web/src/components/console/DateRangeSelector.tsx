'use client';

import * as React from 'react';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { DateRange } from 'react-day-picker';

import { cn } from '@/utils/cn';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PRESETS } from '@/lib/analytics/formatters';

interface DateRangeSelectorProps {
  dateRange: { from: Date; to: Date };
  onChange: (range: { from: Date; to: Date }) => void;
  className?: string;
}

export function DateRangeSelector({
  dateRange,
  onChange,
  className,
}: DateRangeSelectorProps) {
  const [selectedPreset, setSelectedPreset] = React.useState<string>('LAST_30_DAYS');
  const [calendarOpen, setCalendarOpen] = React.useState(false);

  // Initial set from props if it matches a preset?
  // For now we keep it simple.

  const handlePresetChange = (value: string) => {
    setSelectedPreset(value);
    if (value === 'custom') {
      setCalendarOpen(true);
      return;
    }
    
    const preset = Object.values(PRESETS).find(p => p.label === value); // Match by label or key?
    // Using keys from PRESETS object would be better.
    // Let's iterate keys.
    const key = Object.keys(PRESETS).find(k => PRESETS[k as keyof typeof PRESETS].label === value || k === value);
    
    if (key && key !== 'custom') {
      const { from, to } = PRESETS[key as keyof typeof PRESETS].getRange();
      onChange({ from, to });
    }
  };

  const handleCalendarSelect = (range: DateRange | undefined) => {
    if (range?.from && range?.to) {
      onChange({ from: range.from, to: range.to });
      setSelectedPreset('custom');
      // Keep open if selecting range? Usually close after selection is complete.
      // But user might want to adjust.
    }
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Select value={selectedPreset} onValueChange={handlePresetChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select range" />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(PRESETS).map(([key, preset]) => (
            <SelectItem key={key} value={key}>
              {preset.label}
            </SelectItem>
          ))}
          <SelectItem value="custom">Custom Range</SelectItem>
        </SelectContent>
      </Select>

      <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
        <PopoverTrigger asChild>
          <Button
            variant={'outline'}
            className={cn(
              'w-[240px] justify-start text-left font-normal',
              !dateRange && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateRange?.from ? (
              dateRange.to ? (
                <>
                  {format(dateRange.from, 'LLL dd, y')} -{' '}
                  {format(dateRange.to, 'LLL dd, y')}
                </>
              ) : (
                format(dateRange.from, 'LLL dd, y')
              )
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={dateRange?.from}
            selected={{ from: dateRange.from, to: dateRange.to }}
            onSelect={handleCalendarSelect}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
