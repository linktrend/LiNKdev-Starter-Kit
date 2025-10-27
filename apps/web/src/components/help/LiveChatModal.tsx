'use client';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface LiveChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LiveChatModal({ isOpen, onClose }: LiveChatModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Live Chat Support</DialogTitle>
          <DialogDescription>
            Our support team is ready to help you.
          </DialogDescription>
        </DialogHeader>
        <div className="text-center py-8">
          <p className="text-muted-foreground">Live chat functionality coming soon</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}