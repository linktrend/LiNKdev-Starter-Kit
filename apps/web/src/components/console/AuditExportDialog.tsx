'use client';

import { useEffect, useState } from 'react';
import { Download, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { DateRangeSelector } from './DateRangeSelector';

type DateRange = { from: Date; to: Date };

type Props = {
  currentRange: DateRange;
  exporting?: boolean;
  onExport: (range: DateRange) => Promise<void> | void;
};

export function AuditExportDialog({ currentRange, exporting, onExport }: Props) {
  const [open, setOpen] = useState(false);
  const [range, setRange] = useState<DateRange>(currentRange);

  useEffect(() => {
    setRange(currentRange);
  }, [currentRange]);

  const handleExport = async () => {
    await onExport(range);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" disabled={exporting}>
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Export audit logs</DialogTitle>
          <DialogDescription>
            CSV export respects the current filters. Choose a date range for the export window.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label>Date range</Label>
          <DateRangeSelector dateRange={range} onChange={setRange} />
        </div>

        {exporting && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Generating CSV…
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={() => void handleExport()} disabled={exporting}>
            {exporting ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Exporting…
              </span>
            ) : (
              'Export'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
