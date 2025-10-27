'use client';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface ReleaseNotesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ReleaseNotesModal({ isOpen, onClose }: ReleaseNotesModalProps) {
  const releaseNotes = [
    { version: '2.1.0', date: '01/12/2024', notes: 'Added new dashboard features and improved performance' },
    { version: '2.0.0', date: '12/01/2023', notes: 'Major redesign with new UI components' },
    { version: '1.9.0', date: '11/15/2023', notes: 'Enhanced analytics and reporting features' },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Release Notes</DialogTitle>
          <DialogDescription>
            Stay up to date with the latest features and improvements
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {releaseNotes.map((release, idx) => (
            <div key={idx} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold">Version {release.version}</h4>
                <span className="text-sm text-muted-foreground">{release.date}</span>
              </div>
              <p className="text-sm text-muted-foreground">{release.notes}</p>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
