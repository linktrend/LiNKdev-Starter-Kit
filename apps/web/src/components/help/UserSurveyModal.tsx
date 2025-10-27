'use client';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface UserSurveyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UserSurveyModal({ isOpen, onClose }: UserSurveyModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>User Survey</DialogTitle>
          <DialogDescription>
            Help us improve by sharing your feedback.
          </DialogDescription>
        </DialogHeader>
        <div className="text-center py-8">
          <p className="text-muted-foreground">Survey functionality coming soon</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
