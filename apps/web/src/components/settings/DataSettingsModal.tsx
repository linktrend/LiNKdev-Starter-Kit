'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Database, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DataSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DataSettingsModal({ isOpen, onClose }: DataSettingsModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const handleSave = async () => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log('Saving data settings...');
    alert('Data settings saved successfully!');
    onClose();
  };

  const modalContent = (
    <div 
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{ zIndex: 99999 }}
    >
      {/* Backdrop */}
      <div 
        className="fixed inset-0 modal-backdrop"
      />
      
      {/* Modal */}
      <div
        className="relative w-full max-w-3xl max-h-[90vh] rounded-lg border shadow-2xl overflow-hidden modal-bg flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b flex-shrink-0">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            <h2 className="text-xl font-bold">Data Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Storage Usage */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Storage</span>
              <span className="text-sm text-muted-foreground">6.2 GB / 10 GB</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div className="bg-primary h-2 rounded-full" style={{ width: '62%' }}></div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">3.8 GB remaining</p>
          </div>

          {/* Backup Frequency */}
          <div>
            <label className="block text-sm text-muted-foreground mb-2">Backup Frequency</label>
            <select className="w-full px-4 py-2.5 bg-background text-foreground border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary">
              <option>Never</option>
              <option>Daily</option>
              <option>Weekly</option>
              <option>Monthly</option>
            </select>
            <p className="text-xs text-muted-foreground mt-2">Automated backups help protect your data</p>
          </div>

          {/* Last Backup */}
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div>
              <p className="font-medium">Last Backup</p>
              <p className="text-sm text-muted-foreground">10/12/2024, 10:30:00</p>
            </div>
            <Button className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Restore
            </Button>
          </div>

          {/* Data Retention Policy */}
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="font-semibold text-blue-900 mb-2">Data Retention Policy</p>
            <p className="text-sm text-blue-900">
              Your data is retained for a minimum of 90 days as per legal requirements. After account deletion, data is permanently removed within 30 days.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t bg-muted flex-shrink-0">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="flex-1"
          >
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

